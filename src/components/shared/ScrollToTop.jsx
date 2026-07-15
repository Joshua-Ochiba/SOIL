import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Disable browser's built-in scroll restoration globally
if (typeof window !== 'undefined') {
    window.history.scrollRestoration = 'manual';
}

function hardReset() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

export default function ScrollToTop() {
    const { pathname } = useLocation();
    const prevRef = useRef(pathname);

    useEffect(() => {
        const prev = prevRef.current;
        prevRef.current = pathname;

        // When navigating between studio sub-routes (e.g. /studio → /studio/product/:id
        // or back), skip the instant reset. The new page's PageTransition useEffect
        // handles the scroll reset on mount, so there's no visible jump.
        const isStudioInternal =
            prev.startsWith('/studio') && pathname.startsWith('/studio');

        if (!isStudioInternal) {
            hardReset();
        }

        // Delayed reset fires after the exit animation (0.15s) + any buffer.
        // Guarantees the incoming page always starts at top.
        const t = setTimeout(hardReset, 300);
        return () => clearTimeout(t);
    }, [pathname]);

    return null;
}
