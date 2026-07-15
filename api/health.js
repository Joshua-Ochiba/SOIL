import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/health — powers the admin "Setup" / Connections page.
 *
 * Auth: requires a valid Supabase session (Authorization: Bearer <token>).
 *
 * SECURITY: this endpoint NEVER returns a key value. It only reports, per
 * service, whether the key is configured and whether a live test connection
 * succeeds — plain booleans. The only extra detail is Paystack's mode
 * (test/live), derived from the key PREFIX, never the key itself.
 */
export default async function handler(req, res) {
    const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey     = process.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const resendKey   = process.env.RESEND_API_KEY;
    const resendFrom  = process.env.RESEND_FROM_EMAIL;

    // ── Auth gate — only a logged-in admin may read connection status ────────
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return res.status(401).json({ error: 'Not signed in.' });
    try {
        if (!supabaseUrl) return res.status(500).json({ error: 'Supabase URL missing.' });
        const authClient = createClient(supabaseUrl, anonKey || serviceKey);
        const { data: { user }, error } = await authClient.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Session invalid or expired — sign in again.' });
    } catch {
        return res.status(401).json({ error: 'Could not verify your session.' });
    }

    // ── Supabase: configured? can we read a table? ───────────────────────────
    const supabase = { configured: !!(supabaseUrl && serviceKey), connected: false };
    if (supabase.configured) {
        try {
            const supa = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
            const { error } = await supa.from('products').select('id').limit(1);
            supabase.connected = !error;
        } catch { /* leave false */ }
    }

    // ── Paystack: configured? key valid? live or test? ───────────────────────
    // Paystack uses the same SECRET key to verify webhooks, so there's no
    // separate webhook secret — a valid key means webhooks can be verified too.
    const paystack = {
        configured: !!paystackKey,
        connected: false,
        mode: paystackKey ? (paystackKey.startsWith('sk_live') ? 'live' : 'test') : null,
    };
    if (paystack.configured) {
        try {
            const r = await fetch('https://api.paystack.co/transaction?perPage=1', {
                headers: { Authorization: `Bearer ${paystackKey}` },
            });
            paystack.connected = r.ok;
        } catch { /* leave false */ }
    }

    // ── Resend: configured? key valid? (read-only domains check) ─────────────
    const resend = { configured: !!(resendKey && resendFrom), connected: false };
    if (resendKey) {
        try {
            const r = await fetch('https://api.resend.com/domains', {
                headers: { Authorization: `Bearer ${resendKey}` },
            });
            resend.connected = r.ok;
        } catch { /* leave false */ }
    }

    return res.status(200).json({
        ok: true,
        services: { supabase, paystack, resend },
        // Convenience flag the UI can use for an overall "ready to sell" banner.
        readyToSell: supabase.connected && paystack.connected,
    });
}
