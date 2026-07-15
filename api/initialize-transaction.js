import { createClient } from '@supabase/supabase-js';
import { paystackFetch, toSubunit, buildOrder } from './_lib/paystack.js';

/**
 * POST /api/initialize-transaction  — the cart "Checkout" button calls this.
 *
 * Body: {
 *   items:    [{ id, size, quantity }],   // prices are looked up server-side, never trusted from the client
 *   currency: 'NGN' | 'USD',
 *   customer: { email, name, phone },
 *   shipping: { line1, line2, city, state, country, postal_code },
 *   callbackUrl: string                   // where Paystack returns the buyer after payment
 * }
 *
 * Returns: { authorization_url, reference } — the client redirects to authorization_url.
 *
 * Security: the real price of every item is read from Supabase here, so a tampered
 * cart can't change what the customer is charged.
 */
export default async function handler(req, res) {
    const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const secretKey   = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey)                 return res.status(500).json({ error: 'Payments are not configured yet (PAYSTACK_SECRET_KEY missing).' });
    if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Database is not configured (Supabase keys missing).' });

    try {
        const { items, customer, shipping, callbackUrl } = req.body || {};
        const currency = (req.body?.currency || 'NGN').toUpperCase();

        if (!items || items.length === 0)  return res.status(400).json({ error: 'Cart is empty.' });
        if (!customer?.email)              return res.status(400).json({ error: 'An email address is required for checkout.' });
        if (currency !== 'NGN' && currency !== 'USD') return res.status(400).json({ error: 'Unsupported currency.' });

        const supa = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

        // Read currency controls from site settings
        const { data: settings } = await supa
            .from('site_settings').select('usd_checkout_enabled, usd_rate').eq('id', 1).maybeSingle();
        const usdRate = settings?.usd_rate ?? 1600;

        if (currency === 'USD' && settings && settings.usd_checkout_enabled === false) {
            return res.status(400).json({ error: 'USD checkout is currently unavailable. Please switch to Naira.' });
        }

        // Trusted pricing — computed from the database, not the client
        const { lineItems, total } = await buildOrder({ supa, items, currency, usdRate });
        if (total <= 0) return res.status(400).json({ error: 'Order total is invalid.' });

        // Everything the webhook needs to write the order goes in metadata.
        const metadata = {
            soil: {
                items: lineItems,
                currency,
                customer: {
                    name:  customer.name  || null,
                    email: customer.email,
                    phone: customer.phone || null,
                },
                shipping: shipping || null,
            },
            // Shown on the Paystack dashboard for quick reference
            custom_fields: [
                { display_name: 'Customer', variable_name: 'customer_name', value: customer.name || '—' },
                { display_name: 'Items', variable_name: 'item_count', value: String(lineItems.length) },
            ],
        };

        const init = await paystackFetch('/transaction/initialize', {
            method: 'POST',
            secretKey,
            body: {
                email:        customer.email,
                amount:       toSubunit(total),
                currency,
                callback_url: callbackUrl,
                metadata,
            },
        });

        return res.status(200).json({
            authorization_url: init.data.authorization_url,
            reference:         init.data.reference,
        });
    } catch (err) {
        console.error('Paystack initialize error:', err);
        return res.status(500).json({ error: err.message || 'Could not start checkout.' });
    }
}
