import { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle2, XCircle, RefreshCw, ExternalLink, ShieldCheck,
    AlertTriangle, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Connections / Setup tab.
 *
 * Read-only health dashboard. Calls GET /api/health (auth-gated) which reports,
 * per service, whether each key is CONFIGURED and whether a live test connection
 * SUCCEEDS — booleans only. No key value is ever shown here or sent to the
 * browser. Keys themselves are pasted once into Vercel's encrypted environment
 * variables; this page just confirms they work.
 */

const SERVICES = [
    {
        id: 'supabase',
        name: 'Supabase',
        blurb: 'The database — products, orders, messages, subscribers.',
        envVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
        where: 'Supabase dashboard → Project Settings → API',
        link: 'https://supabase.com/dashboard',
        required: true,
    },
    {
        id: 'paystack',
        name: 'Paystack',
        blurb: 'Payments — secure checkout and card processing (Naira & USD).',
        envVars: ['PAYSTACK_SECRET_KEY'],
        where: 'Paystack dashboard → Settings → API Keys & Webhooks (set the webhook URL to https://your-domain.com/api/webhook)',
        link: 'https://dashboard.paystack.com/#/settings/developers',
        required: true,
    },
    {
        id: 'resend',
        name: 'Resend',
        blurb: 'Order confirmation emails to customers and you.',
        envVars: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'ADMIN_NOTIFICATION_EMAIL'],
        where: 'Resend dashboard → API Keys (sender domain must be verified)',
        link: 'https://resend.com/api-keys',
        required: false,
    },
];

function StatusPill({ ok, label }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] tracking-[0.2em] uppercase font-ui font-semibold ${
            ok ? 'text-green-400/90 bg-green-400/10 border-green-400/30'
               : 'text-amber-400/90 bg-amber-400/10 border-amber-400/30'
        }`}>
            {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {label}
        </span>
    );
}

export default function ConnectionsTab() {
    const [state, setState] = useState({ loading: true, error: null, data: null, noApi: false });

    const load = useCallback(async () => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) { setState({ loading: false, error: 'Session expired — sign in again.', data: null, noApi: false }); return; }

            const res = await fetch('/api/health', {
                headers: { Authorization: `Bearer ${token}` },
            });
            // On a plain `vite` localhost there's no serverless runtime, so the
            // SPA fallback returns index.html (not JSON). Detect that.
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
                setState({ loading: false, error: null, data: null, noApi: true });
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || `Status check failed (${res.status})`);
            setState({ loading: false, error: null, data, noApi: false });
        } catch (e) {
            setState({ loading: false, error: e.message || 'Could not check connections.', data: null, noApi: false });
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const { loading, error, data, noApi } = state;
    const svc = data?.services;

    return (
        <div className="max-w-3xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="font-display text-xl text-white tracking-wide mb-1">Setup &amp; Connections</h2>
                    <p className="font-ui text-sm text-foreground/50 leading-relaxed max-w-lg">
                        Live status of the services that power the site. Keys are set once in Vercel —
                        this page just confirms they're working. It never shows the keys themselves.
                    </p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-3.5 py-2 border border-white/15 text-foreground/70 text-[10px] tracking-[0.25em] uppercase font-ui hover:border-white/30 hover:text-white transition-all rounded-lg flex-shrink-0 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Recheck
                </button>
            </div>

            {/* Overall banner */}
            {data && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${
                    data.readyToSell
                        ? 'border-green-400/30 bg-green-400/[0.06]'
                        : 'border-amber-400/30 bg-amber-400/[0.06]'
                }`}>
                    {data.readyToSell
                        ? <ShieldCheck className="w-5 h-5 text-green-400/90 flex-shrink-0" />
                        : <AlertTriangle className="w-5 h-5 text-amber-400/90 flex-shrink-0" />}
                    <p className="font-ui text-sm text-foreground/80">
                        {data.readyToSell
                            ? 'Everything is connected — the store is ready to take real orders.'
                            : 'Some setup is still needed before the store can take live orders. See below.'}
                    </p>
                </div>
            )}

            {/* localhost notice */}
            {noApi && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] mb-6">
                    <AlertTriangle className="w-5 h-5 text-foreground/40 flex-shrink-0 mt-0.5" />
                    <p className="font-ui text-sm text-foreground/55 leading-relaxed">
                        Connection checks only run on the live (deployed) site — there's no server on this
                        local preview. Open the admin on your real domain to see live status.
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-400/25 bg-red-400/[0.06] mb-6">
                    <XCircle className="w-5 h-5 text-red-400/80 flex-shrink-0 mt-0.5" />
                    <p className="font-ui text-sm text-red-300/80">{error}</p>
                </div>
            )}

            {/* Service cards */}
            <div className="space-y-3">
                {SERVICES.map(s => {
                    const st = svc?.[s.id];
                    const configured = st?.configured;
                    const connected  = st?.connected;
                    return (
                        <div key={s.id} className="border border-white/[0.07] rounded-xl p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="font-display text-base text-white tracking-wide">{s.name}</h3>
                                        {!s.required && (
                                            <span className="text-[8px] tracking-[0.25em] uppercase text-foreground/30 font-ui border border-white/10 rounded px-1.5 py-0.5">Optional</span>
                                        )}
                                    </div>
                                    <p className="font-ui text-[13px] text-foreground/50 mt-1 leading-relaxed">{s.blurb}</p>
                                </div>
                                {svc && (
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <StatusPill ok={connected} label={connected ? 'Connected' : (configured ? 'Error' : 'Not set up')} />
                                        {s.id === 'paystack' && st?.mode && (
                                            <span className={`text-[8px] tracking-[0.2em] uppercase font-ui ${st.mode === 'live' ? 'text-green-400/70' : 'text-amber-400/70'}`}>
                                                {st.mode} mode
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Paystack webhook reminder */}
                            {s.id === 'paystack' && svc && connected && (
                                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-start gap-2">
                                    <span className="text-[10px] tracking-[0.2em] uppercase font-ui text-foreground/40 flex-shrink-0">Webhook</span>
                                    <span className="text-[11px] font-ui text-foreground/45 leading-relaxed">
                                        Set the webhook URL in Paystack → Settings → API Keys &amp; Webhooks to
                                        <code className="text-soil-sun/70"> https://your-domain.com/api/webhook</code> — required for orders to record after payment.
                                    </span>
                                </div>
                            )}

                            {/* Setup detail — shown when not fully connected */}
                            {svc && !connected && (
                                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                                    <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/30 font-ui mb-2">Set these in Vercel</p>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {s.envVars.map(v => (
                                            <code key={v} className="text-[10px] font-mono text-soil-sun/80 bg-soil-sun/[0.06] border border-soil-sun/15 rounded px-1.5 py-0.5">{v}</code>
                                        ))}
                                    </div>
                                    <p className="font-ui text-[12px] text-foreground/45 leading-relaxed">
                                        Find them in: {s.where}.{' '}
                                        <a href={s.link} target="_blank" rel="noopener noreferrer"
                                           className="inline-flex items-center gap-1 text-soil-sun/80 hover:text-soil-sun">
                                            Open <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* How keys work — always visible, reassures the non-dev */}
            <div className="mt-6 border border-white/[0.06] rounded-xl p-4 bg-white/[0.01]">
                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/30 font-ui mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-soil-sun/60" /> How keys work
                </p>
                <p className="font-ui text-[13px] text-foreground/55 leading-relaxed">
                    Keys are pasted once into <span className="text-white/80">Vercel → Settings → Environment Variables</span>,
                    where they're encrypted and only ever read by the server — never exposed in the browser. After a key
                    changes in Vercel, redeploy (or it applies on the next deploy), then hit <span className="text-white/80">Recheck</span> here.
                    You never need a terminal.
                </p>
            </div>
        </div>
    );
}
