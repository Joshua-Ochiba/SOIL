import { Component } from 'react';
import { captureError } from '@/lib/monitoring';

/**
 * Top-level error boundary — catches any unhandled React render error
 * and shows a clean recovery screen instead of a blank white page.
 *
 * Wrap the app root with <ErrorBoundary> in main.jsx.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info.componentStack);
        // Reports to Sentry when VITE_SENTRY_DSN is configured; no-op otherwise.
        captureError(error, { componentStack: info.componentStack });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen bg-background dark:bg-[#0a0806] flex flex-col items-center justify-center px-6 text-center">
                <p className="text-[9px] tracking-[0.5em] uppercase text-accent/50 font-ui mb-4">
                    Something went wrong
                </p>
                <h1 className="font-display text-2xl text-foreground/80 mb-3 tracking-tight">
                    An unexpected error occurred
                </h1>
                <p className="font-ui text-sm text-foreground/35 max-w-xs leading-relaxed mb-8">
                    Try refreshing the page. If the problem persists, contact the SOIL team.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 border border-accent/30 text-accent text-[10px] tracking-[0.3em] uppercase font-ui hover:bg-accent/10 transition-all duration-300 rounded-lg"
                >
                    Refresh Page
                </button>
            </div>
        );
    }
}
