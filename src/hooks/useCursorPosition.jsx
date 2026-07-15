import { useEffect, useRef } from 'react';

export default function useCursorPosition() {
    const xRef = useRef(0);
    const yRef = useRef(0);
    const normalizedRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if ('ontouchstart' in window) return undefined; // Ignore on mobile devices

        // Initialize at viewport center so first frame isn't a jolt
        xRef.current = window.innerWidth / 2;
        yRef.current = window.innerHeight / 2;

        const onMove = (e) => {
            xRef.current = e.clientX;
            yRef.current = e.clientY;
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Normalize from -1 to 1 based on the exact center of the screen
            normalizedRef.current = {
                x: w > 0 ? (e.clientX / w) * 2 - 1 : 0,
                y: h > 0 ? (e.clientY / h) * 2 - 1 : 0,
            };
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return { xRef, yRef, normalizedRef };
}
