import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { customerOrderEmail, adminOrderNotification } from './_emails/order-confirmation.js';

/* ─────────────────────────────────────────────────────────────────────────────
   SOIL Studio — Paystack Webhook Handler
   Route: POST /api/webhook

   What this does:
     1. Verifies the Paystack signature (HMAC-SHA512 of the raw body using the
        SECRET key) — rejects forged requests.
     2. Handles charge.success → upserts the order to Supabase.
     3. Reads the cart / customer / shipping from the transaction metadata that
        /api/initialize-transaction stored (prices were computed server-side there).
     4. Decrements product stock atomically.
     5. Sends order confirmation to the customer + new-order alert to the admin.
     6. Idempotent: upserts by paystack_reference — safe if Paystack retries.

   Required env vars (Vercel → Settings → Environment Variables):
     PAYSTACK_SECRET_KEY       — Paystack Dashboard → Settings → API Keys (also verifies webhooks)
     SUPABASE_SERVICE_ROLE_KEY — Supabase Dashboard → Settings → API → service_role
     SUPABASE_URL              — OR VITE_SUPABASE_URL (falls back automatically)

   Optional email env vars (emails gracefully skip if any are missing):
     RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_NOTIFICATION_EMAIL

   IMPORTANT: bodyParser must be false so we can verify the raw body.
───────────────────────────────────────────────────────────────────────────── */

// Disable Vercel's automatic body parsing — we need the raw bytes to verify
export const config = { api: { bodyParser: false } };

/** Read the full request body as a single Buffer */
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data',  c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        req.on('end',   () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')    return res.status(405).end();

    const {
        PAYSTACK_SECRET_KEY,
        SUPABASE_URL,
        VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
    } = process.env;

    const supabaseUrl = SUPABASE_URL || VITE_SUPABASE_URL;

    if (!PAYSTACK_SECRET_KEY) {
        console.error('[webhook] Missing: PAYSTACK_SECRET_KEY');
        return res.status(500).json({ error: 'Payments not configured.' });
    }
    if (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[webhook] Missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        return res.status(500).json({ error: 'Database not configured.' });
    }

    // ── 1. Read raw body ─────────────────────────────────────────────────────
    let rawBody;
    try {
        rawBody = await getRawBody(req);
    } catch (err) {
        console.error('[webhook] Failed to read body:', err.message);
        return res.status(400).json({ error: 'Could not read request body.' });
    }

    // ── 2. Verify Paystack signature ─────────────────────────────────────────
    // Paystack signs the body with HMAC-SHA512 using your SECRET key.
    const signature = req.headers['x-paystack-signature'];
    const expected  = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
    if (!signature || signature !== expected) {
        console.error('[webhook] Signature verification failed.');
        return res.status(401).json({ error: 'Invalid signature.' });
    }

    // ── 3. Parse + filter event ──────────────────────────────────────────────
    let event;
    try {
        event = JSON.parse(rawBody.toString('utf8'));
    } catch {
        return res.status(400).json({ error: 'Invalid JSON.' });
    }

    if (event.event !== 'charge.success') {
        return res.status(200).json({ received: true, skipped: event.event });
    }

    const data      = event.data || {};
    const reference = data.reference;
    const soil      = data.metadata?.soil || {};
    console.log(`[webhook] charge.success → ${reference}`);

    // ── 4. Build the order from trusted init-time metadata ───────────────────
    const items = (soil.items || []).map(li => ({
        name:       li.name,
        price:      Number(li.price) || 0,
        quantity:   Number(li.quantity) || 1,
        image:      li.image || null,
        size:       li.size || null,
        product_id: li.product_id || null,
    }));

    const currency = (data.currency || soil.currency || 'NGN').toUpperCase();
    const total    = (data.amount || 0) / 100;

    // ── 5. Upsert to Supabase (service role bypasses RLS) ────────────────────
    // Idempotent via the unique paystack_reference index (see paystack.sql).
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    const orderId = `ps_${reference}`;

    const { error: dbError } = await supabase
        .from('orders')
        .upsert(
            {
                id:                 orderId,
                paystack_reference: reference,
                items,
                total,
                currency,
                status:             'paid',
                customer_name:      soil.customer?.name  || null,
                customer_email:     data.customer?.email || soil.customer?.email || null,
                shipping_address:   soil.shipping || null,
                updated_at:         new Date().toISOString(),
            },
            { onConflict: 'paystack_reference' }
        );

    if (dbError) {
        console.error('[webhook] Supabase upsert error:', dbError.message);
    } else {
        console.log(`[webhook] Order saved: ${orderId} (${items.length} item(s), ${currency} ${total})`);
    }

    // ── 6. Decrement stock atomically for each line item ─────────────────────
    for (const it of items) {
        if (!it.product_id) continue;
        try {
            const { error: stockErr } = await supabase.rpc('decrement_stock', {
                product_id: it.product_id,
                qty:        it.quantity || 1,
            });
            if (stockErr) console.error(`[webhook] Stock decrement failed for ${it.product_id}:`, stockErr.message);
        } catch (err) {
            console.error(`[webhook] decrement_stock RPC threw for ${it.product_id}:`, err.message);
        }
    }

    // ── 7. Send confirmation emails (customer + admin) ───────────────────────
    const { RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_NOTIFICATION_EMAIL } = process.env;

    if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
        const resend = new Resend(RESEND_API_KEY);

        const orderForEmail = {
            id:               orderId,
            items,
            total,
            currency,
            customer_name:    soil.customer?.name  || null,
            customer_email:   data.customer?.email || soil.customer?.email || null,
            shipping_address: soil.shipping || null,
        };

        if (orderForEmail.customer_email) {
            try {
                const { subject, html, text } = customerOrderEmail(orderForEmail);
                const { error: mailErr } = await resend.emails.send({
                    from: RESEND_FROM_EMAIL, to: orderForEmail.customer_email, subject, html, text,
                });
                if (mailErr) console.error('[webhook] Customer email send failed:', mailErr.message || mailErr);
                else console.log(`[webhook] Customer confirmation sent → ${orderForEmail.customer_email}`);
            } catch (err) {
                console.error('[webhook] Customer email threw:', err.message);
            }
        }

        if (ADMIN_NOTIFICATION_EMAIL) {
            try {
                const { subject, html, text } = adminOrderNotification(orderForEmail);
                const { error: adminErr } = await resend.emails.send({
                    from: RESEND_FROM_EMAIL, to: ADMIN_NOTIFICATION_EMAIL,
                    reply_to: orderForEmail.customer_email || undefined, subject, html, text,
                });
                if (adminErr) console.error('[webhook] Admin email send failed:', adminErr.message || adminErr);
                else console.log(`[webhook] Admin notification sent → ${ADMIN_NOTIFICATION_EMAIL}`);
            } catch (err) {
                console.error('[webhook] Admin email threw:', err.message);
            }
        }
    } else {
        console.log('[webhook] Resend not configured — skipping email send.');
    }

    return res.status(200).json({ received: true });
}
