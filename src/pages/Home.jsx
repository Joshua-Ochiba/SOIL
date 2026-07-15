import React, { useRef, useEffect, useState } from "react";
import { useScroll, motion, useReducedMotion, useTransform, useMotionValueEvent } from "framer-motion";
import Lenis from "lenis";

import GrainOverlay from "../components/soil/GrainOverlay";
import CanvasSequenceBackdrop from "../components/world/CanvasSequenceBackdrop";
import CinematicOverlay from "../components/world/CinematicOverlay";
import RealisticBirds from "../components/soil/RealisticBirds";
import VideoNarrativeExperience from "../components/home/VideoNarrativeExperience";
import EcosystemPreview from "../components/home/EcosystemPreview";
import SectionDivider from "../components/soil/SectionDivider";
import PlantYourSeed from "../components/home/PlantYourSeed";
import Footer from "../components/soil/Footer";
import ParticleDust from "@/components/soil/ParticleDust";
import PageMeta from "../components/shared/PageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";



export default function Home() {
    const containerRef = useRef(null);
    const narrativeRef = useRef(null);
    const { data: settings } = useSiteSettings();

    // ── DEBUG FLAGS — temporary (debug/home-perf branch only) ────────────────
    // Bisect what crashes the home page on low-memory devices (iOS Safari:
    // "A problem repeatedly occurred"). Toggle via URL query params:
    //   ?noframes  skip the 192-frame eagle sequence (biggest memory suspect)
    //   ?nobirds   skip the WebGL dove flock
    //   ?nodust    skip the particle canvas
    //   ?nolenis   skip Lenis smooth scroll
    //   ?lite      skip ALL of the above at once
    const dbg = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const LITE      = dbg.has('lite');
    const NO_FRAMES = LITE || dbg.has('noframes');
    const NO_BIRDS  = LITE || dbg.has('nobirds');
    const NO_DUST   = LITE || dbg.has('nodust');
    const NO_LENIS  = LITE || dbg.has('nolenis');

    // When the frame sequence is disabled, its loader never runs — so fire the
    // reveal event ourselves, otherwise the navbar stays hidden until its 8s
    // fallback and the page looks stuck.
    useEffect(() => {
        if (NO_FRAMES) window.dispatchEvent(new CustomEvent('soil:loaded'));
    }, [NO_FRAMES]);

    // Respect the OS "reduce motion" setting. When on, we skip Lenis
    // smooth-scroll (native scroll only) so the page doesn't glide/inertia
    // for users who opt out of animation. The scroll-driven scrollytell still
    // works on native scroll — it just snaps to real scroll position instead
    // of a smoothed one. WCAG 2.3.3 / 2.2.2.
    const prefersReducedMotion = useReducedMotion();

    // ── Lenis smooth scroll ─────────────────────────────────────────────────
    // Native browser scroll fires in 16ms ratchet steps — every Awwwards-level
    // scrollytell uses a smooth-scroll library (Lenis, Locomotive) to convert
    // wheel/trackpad input into a continuous velocity stream. With Lenis,
    // useScroll() reads a smoothed scroll position, so the canvas frame
    // sequence and parallax glide instead of stutter.
    //
    // Scoped to the Home page only — mounted on enter, destroyed on leave —
    // so admin, commerce, and modal scroll behaviour stays native. Disabled
    // entirely under prefers-reduced-motion.
    useEffect(() => {
        if (prefersReducedMotion || NO_LENIS) return;
        const lenis = new Lenis({
            duration: 1.15,                          // glide length
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smoothstep
            smoothWheel: true,
            smoothTouch: false,                      // mobile already has momentum
            wheelMultiplier: 0.95,                   // slightly slower than native — more cinematic
            touchMultiplier: 2,
        });

        let rafId;
        const raf = (time) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [prefersReducedMotion]);

    // Narrative-scoped scroll — drives the eagle/seed image sequence. We bind
    // it to the VideoNarrativeExperience wrapper so frame 0 plays at section
    // top and the final frame (eagle landing on the AFRIKA branch) plays at
    // section bottom, instead of being mapped across the entire page where
    // opaque sections later cover the canvas.
    const { scrollYProgress: narrativeProgress } = useScroll({
        target: narrativeRef,
        offset: ["start start", "end end"]
    });

    // Sky-reveal — the bird sky is a single FIXED page-wide layer spanning
    // everything from the 5-layers section down (birds never clipped by section
    // edges). It must reach full opacity exactly as the scrollytell performs
    // its closing dissolve-to-background (the seamClose, 0.88→0.99). Because the
    // sky's own bg is the SAME bg-background color, it covers the fixed eagle
    // backdrop in lockstep with that dissolve — so there's no transparent window
    // where the eagle's bottom edge shows through as a hard line + dark gap.
    const skyOpacity = useTransform(narrativeProgress, [0.92, 0.995], [0, 1]);

    // Perf: the bird sky is a WebGL Canvas rendering 64 rigged 3D doves + an
    // O(n²) flocking sim every frame. It must NOT run during the eagle
    // scrollytell above — an always-mounted (opacity-faded) Canvas burns GPU/CPU
    // the whole scrub and stutters the frame-sequence scrub on weaker GPUs.
    // We latch it on just before the reveal (0.85, ahead of the 0.92 opacity
    // ramp) so the on-mount warm-up settles the flock before it's ever seen,
    // and keep it mounted thereafter (no remount thrash scrolling near the seam).
    const [birdsLive, setBirdsLive] = useState(false);
    useMotionValueEvent(narrativeProgress, "change", (v) => {
        if (v >= 0.85 && !birdsLive) setBirdsLive(true);
    });

    return (
        // We set a massive height (e.g., 300vh) so the user has room to scroll,
        // even if the content on screen isn't physically that tall.
        <main ref={containerRef} className="relative bg-background">

            {/* Skip link — lets keyboard/SR users bypass the long scrollytell
                and jump straight to the main content. Visually hidden until
                focused. WCAG 2.4.1 Bypass Blocks. */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-5 focus:py-3 focus:bg-soil-sun focus:text-background focus:rounded-sm focus:font-ui focus:text-sm focus:font-semibold focus:tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
                Skip to content
            </a>

            <PageMeta
                title="SOIL — Cultivating the Future"
                description="SOIL is a transformative ecosystem rooted in African heritage — a living, rooted system of ideas, people, projects and values. Cultivating sustainable solutions for Africa and the World."
                canonicalPath="/"
            />

            {/* LAYER 1: Canvas Image Sequence Backdrop — zero seek lag.
                Uses the narrative-scoped progress so the full 8-second video
                plays out across the VideoNarrativeExperience section, with
                frame 192 (eagle landing) landing right as that section ends. */}
            {!NO_FRAMES && <CanvasSequenceBackdrop progress={narrativeProgress} />}

            {/* LAYER 2: Base global grain — subtle, persistent across whole page */}
            <div className="fixed inset-0 z-10 pointer-events-none
             mix-blend-overlay opacity-30">

                <GrainOverlay />

            </div>

            {/* LAYER 2.5: Cinematic polish layer — letterbox, vignette,
                chromatic fringe, extra grain. Fades in/out with the narrative
                section so it's only present during the scrollytell. */}
            <CinematicOverlay progress={narrativeProgress} />

            {/* LAYER 2.6: BIRD SKY — fixed, page-wide, sits above the eagle
                backdrop (z-0) and below the content (z-20). Its own dark bg
                hides the eagle once revealed. Doves roam the full viewport and,
                because the layer is fixed + the sections below are transparent,
                they read as one continuous sky from 5-layers to the footer with
                no section-edge clipping. */}
            <motion.div
                className="fixed inset-0 z-[5] pointer-events-none bg-background"
                style={{ opacity: skyOpacity }}
                aria-hidden="true"
            >
                {!NO_BIRDS && birdsLive && <RealisticBirds />}
            </motion.div>

            {/* LAYER 3: Interactive Content */}
            <div id="main-content" className="relative z-20 w-full">
                <div ref={narrativeRef}>
                    <VideoNarrativeExperience />
                </div>

                <div className="relative">
                    {/* Gold dust — fades in with the dove sky at the 5-layers
                        dissolve (same narrativeProgress window as skyOpacity) and
                        stays for the rest of the page (useTransform clamps at 1). */}
                    {!NO_DUST && <ParticleDust progress={narrativeProgress} count={240} fadeRange={[0.88, 0.99]} />}

                    {/* Transparent — the fixed bird sky shows through */}
                    <div className="relative z-10">
                        <EcosystemPreview />
                    </div>

                    <div className="relative z-10">
                        <PlantYourSeed />
                    </div>

                    {/* ── WHAT IS SOIL ── */}
                    <div className="relative z-10 overflow-hidden border-t border-white/[0.04]">

                        {/* Ambient glow — anchored at the base */}
                        <div className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none" style={{
                            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(217,160,54,0.09) 0%, transparent 70%)',
                        }} />

                        <div className="relative py-12 md:py-20 px-6">
                            <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-10 md:gap-14">

                                {/* ── Moment 1: Definition ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex flex-col items-center gap-5"
                                >
                                    <p className="text-[11px] tracking-[0.45em] uppercase text-soil-sun/60 font-ui font-medium">
                                        {settings?.whatis_eyebrow}
                                    </p>
                                    <h2
                                        className="font-display text-white/70 leading-tight"
                                        style={{ fontSize: 'clamp(2.2rem, 6.5vw, 5rem)', letterSpacing: '0.03em' }}
                                    >
                                        {settings?.whatis_heading}
                                    </h2>
                                    <p className="font-ui text-base md:text-lg text-foreground/55 leading-relaxed max-w-md whitespace-pre-line">
                                        {settings?.definition_body}
                                    </p>
                                </motion.div>

                                {/* ── Purpose quote ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="w-px h-10 bg-gradient-to-b from-transparent to-soil-sun/30" />
                                    <p className="font-display text-lg md:text-2xl italic text-soil-sun/75 leading-snug whitespace-pre-line">
                                        {settings?.mission_quote}
                                    </p>
                                    <div className="w-px h-10 bg-gradient-to-b from-soil-sun/30 to-transparent" />
                                </motion.div>

                                {/* ── Philosophy ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ duration: 1, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <p className="font-ui text-base md:text-lg text-foreground/55 leading-loose max-w-lg whitespace-pre-line">
                                        {settings?.philosophy_body}
                                    </p>
                                </motion.div>

                                {/* ── Moment 3: The Axiom ── */}
                                <motion.div
                                    initial={{ opacity: 0, y: 32 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex flex-col items-center gap-5 pt-4"
                                >
                                    <p className="text-[11px] tracking-[0.4em] uppercase text-soil-sun/55 font-ui font-medium">
                                        {settings?.whatis_axiom_label}
                                    </p>

                                    {/* Igbo phrase — large, sacred. lang="ig" so
                                        screen readers don't read it as English.
                                        Raised from /20 → /55 to clear WCAG AA. */}
                                    <p
                                        lang="ig"
                                        className="font-display text-foreground/55 leading-tight uppercase"
                                        style={{ fontSize: 'clamp(1.1rem, 3.8vw, 2.6rem)', letterSpacing: '0.12em' }}
                                    >
                                        {settings?.whatis_axiom_line1}
                                    </p>
                                    <p
                                        lang="ig"
                                        className="font-display text-foreground/55 leading-tight uppercase"
                                        style={{ fontSize: 'clamp(1.1rem, 3.8vw, 2.6rem)', letterSpacing: '0.12em' }}
                                    >
                                        {settings?.whatis_axiom_line2}
                                    </p>

                                    {/* Translation */}
                                    <div className="flex flex-col items-center gap-3 mt-3">
                                        <div className="w-10 h-px bg-soil-sun/20" />
                                        <p className="font-ui text-base md:text-lg italic text-foreground/60 leading-relaxed max-w-sm">
                                            {settings?.whatis_translation}
                                        </p>
                                    </div>
                                </motion.div>

                            </div>
                        </div>

                        {/* Bottom seam */}
                        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                            style={{ background: 'linear-gradient(to right, transparent, rgba(217,160,54,0.12), transparent)' }} />
                    </div>

                    <div className="relative z-10">
                        <Footer />
                    </div>

                </div>
            </div>

        </main>
    )
}