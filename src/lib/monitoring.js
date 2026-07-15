/**
 * Error monitoring — optional, zero-config-by-default.
 *
 * If VITE_SENTRY_DSN is set (Vercel env var), errors are reported to Sentry.
 * If it's not set, this is a complete no-op — no Sentry code is even loaded
 * (it's a dynamic import), so there's no bundle cost until you turn it on.
 *
 * To enable: create a project at sentry.io, copy its DSN into VITE_SENTRY_DSN.
 */

let sentry = null;

export async function initMonitoring() {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return; // monitoring stays off until a DSN is configured
    try {
        const Sentry = await import('@sentry/react');
        Sentry.init({
            dsn,
            environment: import.meta.env.MODE,
            tracesSampleRate: 0.1,
        });
        sentry = Sentry;
    } catch (e) {
        console.warn('[monitoring] Sentry failed to initialise:', e);
    }
}

/** Report a caught error (used by the ErrorBoundary). Always safe to call. */
export function captureError(error, context) {
    if (sentry) {
        sentry.captureException(error, context ? { extra: context } : undefined);
    } else if (import.meta.env.DEV) {
        console.error('[captureError]', error, context || '');
    }
}
