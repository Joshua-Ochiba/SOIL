import React, { useEffect } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import useUIStore from '@/store/uiStore';

/**
 * CinematicOverlay — the polish layer that sits over the scrollytell.
 *
 * Four cinema-language touches that fade in/out with the narrative section:
 *   1. Letterbox bars   — thin black bars top/bottom — film framing
 *   2. Vignette         — radial gradient darkening corners — lens falloff
 *   3. Chromatic fringe — subtle red/cyan edge ghosting — anamorphic lens character
 *   4. Cinematic grain  — film grain on top of the base global grain
 *
 * `progress` is the narrative-scoped MotionValue from Home.jsx (0–1 over the
 * VideoNarrativeExperience section). All four elements fade IN from 0–5% and
 * fade OUT from 95–100% so the entry and exit feel deliberate, not snapped.
 *
 * Z-index sits at 15: above the canvas (z-0) and base grain (z-10), below all
 * interactive text content (z-20).
 */
export default function CinematicOverlay({ progress }) {
    // Base opacity for vignette, chromatic, grain — fade in at the start of
    // the section, fade out at the very end.
    const opacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

    // Letterbox fades out earlier — right as the "Growth is not instant. It is
    // earned." chapter exits (~0.68). The frame opens up for the closing
    // "We cultivate for future generations" reflection. Cinematic release.
    const letterboxOpacity = useTransform(progress, [0, 0.05, 0.66, 0.76], [0, 1, 1, 0]);

    // Mirror letterboxOpacity into the UI store so Navbar can crossfade
    // between its embedded (white nav on letterbox) and pill (rounded glass)
    // modes in sync with the bars. Reset to 0 on unmount so other pages
    // don't see a stale value.
    const setLetterboxOpacity = useUIStore((s) => s.setLetterboxOpacity);
    useMotionValueEvent(letterboxOpacity, 'change', (v) => {
        setLetterboxOpacity(v);
    });
    useEffect(() => () => setLetterboxOpacity(0), [setLetterboxOpacity]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[15]" aria-hidden="true">
            {/* ─── 1. LETTERBOX — TOP ─────────────────────────────────────── */}
            <motion.div
                style={{ opacity: letterboxOpacity }}
                className="absolute top-0 left-0 right-0 h-[6vh] md:h-[8vh] bg-black"
            />
            {/* ─── 1. LETTERBOX — BOTTOM ──────────────────────────────────── */}
            <motion.div
                style={{ opacity: letterboxOpacity }}
                className="absolute bottom-0 left-0 right-0 h-[6vh] md:h-[8vh] bg-black"
            />

            {/* Vignette removed — darkened the whole frame too much over the
                scrollytell. Letterbox + chromatic fringe + grain still carry
                the cinematic feel without flattening the image. */}

            {/* ─── 3. CHROMATIC FRINGE — LEFT EDGE (red) ───────────────────── */}
            {/* 1px hairline at 0.22 alpha — present but not perceptible as a band */}
            <motion.div
                style={{
                    opacity,
                    background:
                        'linear-gradient(to right, rgba(255,80,80,0.22), transparent)',
                }}
                className="absolute inset-y-0 left-0 w-[1px]"
            />
            {/* ─── 3. CHROMATIC FRINGE — RIGHT EDGE (cyan) ─────────────────── */}
            <motion.div
                style={{
                    opacity,
                    background:
                        'linear-gradient(to left, rgba(80,180,255,0.22), transparent)',
                }}
                className="absolute inset-y-0 right-0 w-[1px]"
            />

            {/* ─── 4. CINEMATIC GRAIN — film stock on top of base grain ────── */}
            {/* mix-blend-overlay lifts midtones, leaves blacks pure, whites
                untouched. Tile bumped to 256px so the repeat is invisible at
                normal viewports. No animate-grain here — base grain in
                LAYER 2 is already animated; adding a second moving layer
                creates aliasing artifacts that read as horizontal lines.        */}
            <motion.div
                style={{ opacity }}
                className="absolute inset-0 mix-blend-overlay"
            >
                <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                        backgroundSize: '256px 256px',
                    }}
                />
            </motion.div>
        </div>
    );
}
