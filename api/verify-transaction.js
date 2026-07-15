import { paystackFetch } from './_lib/paystack.js';

/**
 * GET /api/verify-transaction?reference=...  — the success page calls this to
 * confirm payment and show the buyer their details.
 *
 * The order itself is written authoritatively by the webhook (/api/webhook).
 * This endpoint is read-only — it just verifies status for the UI.
 */
export default async function handler(req, res) {
    const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Payments are not configured.' });

    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'reference required' });

    try {
        const v = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`, { secretKey });
        const d = v.data || {};
        const soil = d.metadata?.soil || {};

        res.status(200).json({
            payment_status:   d.status,                                   // 'success' | 'failed' | ...
            paid:             d.status === 'success',
            currency:         d.currency || soil.currency || 'NGN',
            amount:           (d.amount || 0) / 100,
            customer_name:    soil.customer?.name  || null,
            customer_email:   d.customer?.email    || soil.customer?.email || null,
            shipping_address: soil.shipping        || null,
        });
    } catch (err) {
        console.error('Paystack verify error:', err);
        res.status(500).json({ error: err.message });
    }
}
