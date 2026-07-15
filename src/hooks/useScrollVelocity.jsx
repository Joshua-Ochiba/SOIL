import { useEffect, useRef } from 'react';

export default function useScrollVelocity() {
    const velocityRef = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        let lastY = window.scrollY;
        let lastT = performance.now();
        let raf = 0;
        //lastY → previous scroll position
        //lastT → previous timestamp

        const onScroll = () => {
            const now = performance.now(); //High-precision timestamp (better than Date.now())
            const dt = Math.max(1, now - lastT); //Time elapsed since last scroll event
            const dy = window.scrollY - lastY; //Change in scroll position

            // Calculate instantaneous speed (px / ms)
            const instant = Math.abs(dy) / dt;

            // Smooth the speed out so it rises naturally
            velocityRef.current = velocityRef.current * 0.3 + instant * 0.7;
            lastY = window.scrollY;
            lastT = now;
        };

        const decay = () => {
            // Exponential decay toward 0 when the user stops scrolling
            velocityRef.current *= 0.92;
            if (velocityRef.current < 0.0001) velocityRef.current = 0;
            raf = requestAnimationFrame(decay);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        raf = requestAnimationFrame(decay);

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return velocityRef;
}
