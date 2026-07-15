import { useEffect, useRef, useState } from "react";

/**
 * Returns scroll progress as 0..1 across the entire scrollable document.
 * Both a state value (for React renders) and a ref (for animation loops
 * that should not trigger re-renders) are exposed.
 */

export function useScrollProgress() {
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);

    useEffect(() => {
        let raf = 0;//Stores the requestAnimationFrame ID

        const compute = () => {
            // Calculate how far we can possibly scroll
            const max = document.documentElement.scrollHeight - window.innerHeight;

            // Calculate our progress from 0 to 1
            const next = max > 0 ?
                Math.min(1, Math.max(0, window.scrollY / max)) : 0

            progressRef.current = next; // Update the invisible ref
            setProgress(next); // Update the React state
            raf = 0;
        };

        const onScroll = () => {
            // requestAnimationFrame ensures this only runs once per screen refresh (60fps)
            if (raf) return;
            raf = requestAnimationFrame(compute);
        };

        compute();

        window.addEventListener('scroll', onScroll, { passive: true });

        window.addEventListener('resize', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);

            window.removeEventListener('resize', onScroll);

            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return { progress, progressRef };
}