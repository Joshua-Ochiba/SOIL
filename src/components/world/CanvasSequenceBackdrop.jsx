import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FRAME_COUNT    = 192;
// Reveal gate: a set of evenly-SPREAD keyframes (not the first N sequential).
// This guarantees that the instant the site reveals, there's a loaded frame
// within ~FRAME_COUNT/PRIORITY_COUNT indices of ANY scroll position — so the
// very first scroll-down has coverage across the whole timeline, not just the
// top. The bidirectional nearest-frame fallback snaps to the closest loaded
// frame while the in-between frames stream in and refine the motion.
const PRIORITY_COUNT = 12;
const BATCH_SIZE     = 24;   // parallel requests per batch during full preload
const BATCH_DELAY_MS = 30;   // ms between batches (HTTP/2 multiplexes fine)
const FRAME_PATH = (n) => `/frames/frame_${String(n).padStart(4, '0')}.webp`;

// Lines that crossfade beneath the proverb while loading — so devices with a
// longer wait have something unfolding to read. Starts as the proverb's
// translation, then drifts into manifesto beats. (Authentic Igbo proverb kept
// as the fixed hero above; English beats here so nothing is mistranslated —
// swap in more real Igbo lines if Duke supplies them.)
const SUBLINES = [
    'The journey is more important than the destination — and who you become matters most.',
    'Before the rise, the roots.',
    'We cultivate for those who come after.',
    'Rooted in Africa. Grown for the world.',
];

// Load order: frame 0 → spread priority anchors (reveal gate) → progressive
// stride-halving refinement → sweep up the rest.
function buildLoadOrder(total, priority) {
    const order = [];
    const seen = new Set();
    const add = (i) => { if (i >= 0 && i < total && !seen.has(i)) { order.push(i); seen.add(i); } };

    add(0); // what's on screen at the very top
    for (let k = 1; k < priority; k++) add(Math.round((k / (priority - 1)) * (total - 1)));
    for (let stride = Math.floor(total / priority); stride > 1; stride = Math.floor(stride / 2)) {
        for (let i = stride; i < total; i += stride) add(i);
    }
    for (let i = 0; i < total; i++) add(i);
    return order;
}
const LOAD_ORDER = buildLoadOrder(FRAME_COUNT, PRIORITY_COUNT);

/**
 * Canvas Image Sequence Backdrop — v2
 *
 * Improvements over v1:
 *  - Lerped displayProgress: scroll "glides" to target frame, never snaps
 *  - Mouse parallax: wrapper gets a lazy perspective tilt + pan so the
 *    landscape feels like a real 3D space you can look around in
 *  - All parallax is pure CSS transform on the wrapper — zero extra canvas draws
 *
 * v2.1 — Progressive loading:
 *  - Reveals the site after only the first READY_AT frames load (fast ~1-2 s)
 *  - Remaining frames batch-load silently in the background
 *  - RAF falls back to nearest already-loaded frame when scrolling ahead of loads
 *
 * Architecture:
 *  fixed outer  (overflow:hidden, clips the bleed)
 *    └─ parallax wrapper  (scale 1.10, perspective tilt + pan)
 *         └─ canvas  (draws frames, full size)
 *    └─ overlays  (vignette, fades — fixed, unaffected by parallax)
 *    └─ loader    (absolute, on top)
 */
export default function CanvasSequenceBackdrop({ progress }) {
    const canvasRef    = useRef(null);
    const wrapperRef   = useRef(null);
    const framesRef    = useRef([]);
    const loadedCountRef  = useRef(0);
    const lastFrameRef    = useRef(-1);
    const rafRef          = useRef(null);

    // Lerped values — all live in refs so RAF reads them without React re-renders
    const displayProgressRef = useRef(0);   // chases progress.get()
    const mouseRef   = useRef({ x: 0, y: 0 });   // raw  –0.5 … 0.5
    const panRef     = useRef({ x: 0, y: 0 });   // lerped pan offset (px)
    const tiltRef    = useRef({ x: 0, y: 0 });   // lerped tilt (deg)

    const [loadProgress, setLoadProgress] = useState(0);
    const [ready, setReady]  = useState(false);
    const [subline, setSubline] = useState(0);
    const isTouchRef = useRef(false);

    // ─── 1. Detect touch (disable parallax on mobile) ───────────────────────
    useEffect(() => {
        isTouchRef.current = ('ontouchstart' in window);
    }, []);

    // Crossfade the sub-line beneath the proverb while loading. Holds the first
    // line (the translation) a touch longer, then advances; stays on the last
    // line once reached so it never loops jarringly on a long wait.
    useEffect(() => {
        if (ready) return;
        let interval;
        const first = setTimeout(() => {
            setSubline(1);
            interval = setInterval(() => {
                setSubline(s => (s + 1 < SUBLINES.length ? s + 1 : s));
            }, 3600);
        }, 4200);
        return () => { clearTimeout(first); if (interval) clearInterval(interval); };
    }, [ready]);

    // Fire global event as the loading screen begins fading
    useEffect(() => {
        if (!ready) return;
        const t = setTimeout(() => window.dispatchEvent(new CustomEvent('soil:loaded')), 700);
        return () => clearTimeout(t);
    }, [ready]);

    // ─── 2. Pre-load ALL frames behind the manifesto loader ────────────────
    //
    //  v3 strategy — full preload. The branded loading screen (manifesto +
    //  spinner + real 0–100% progress) stays up until EVERY frame is decoded,
    //  then dissolves into the eagle. The payoff: once the experience begins,
    //  the scrub is perfectly smooth forever — zero frames ever stream in late.
    //
    //  Frames are fetched in keyframe-first order (LOAD_ORDER) so the canvas
    //  has good coverage the instant it reveals. Progress is measured across
    //  ALL frames. onerror counts too, so a missing frame can never wedge the
    //  loader — and a hard safety timeout reveals regardless after a max wait.
    // ────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        framesRef.current = new Array(FRAME_COUNT).fill(null);
        loadedCountRef.current = 0;

        let readyFired = false;
        const reveal = () => { if (!readyFired) { readyFired = true; setReady(true); } };

        const onLoad = () => {
            if (cancelled) return;
            loadedCountRef.current += 1;
            setLoadProgress(Math.min(100, Math.round((loadedCountRef.current / FRAME_COUNT) * 100)));
            if (loadedCountRef.current >= FRAME_COUNT) reveal();
        };

        const preload = (i) => {
            const img = new Image();
            framesRef.current[i] = img;
            img.src = FRAME_PATH(i + 1);
            // Count a frame as ready only once it's fully DECODED (paint-ready),
            // not merely downloaded. Without this the first scroll pays the WebP
            // decode cost frame-by-frame and stutters for a second before it
            // settles — exactly the jank we're chasing. decode() moves that work
            // into the loading screen, so the first scrub is a pure GPU blit.
            if (typeof img.decode === 'function') {
                img.decode().then(onLoad).catch(onLoad); // count even if decode rejects (never hang)
            } else {
                img.onload = onLoad;
                img.onerror = onLoad;
            }
            return img;
        };

        // Fetch in keyframe-first order, in batches, so the network isn't
        // hammered with 192 parallel requests at once.
        const timeouts = [];
        let cursor = 0;
        const loadNextBatch = () => {
            if (cancelled) return;
            const end = Math.min(cursor + BATCH_SIZE, LOAD_ORDER.length);
            for (let k = cursor; k < end; k++) preload(LOAD_ORDER[k]);
            cursor = end;
            if (cursor < LOAD_ORDER.length) timeouts.push(setTimeout(loadNextBatch, BATCH_DELAY_MS));
        };
        loadNextBatch();

        // Safety net: never strand the visitor on the loader if the network
        // stalls on a few frames — reveal anyway after the cap.
        const safety = setTimeout(reveal, 30000);
        timeouts.push(safety);

        return () => {
            cancelled = true;
            timeouts.forEach(clearTimeout);
        };
    }, []);

    // ─── 3. Mouse tracking ───────────────────────────────────────────────────
    useEffect(() => {
        const onMove = (e) => {
            mouseRef.current = {
                x: (e.clientX / window.innerWidth)  - 0.5,  // -0.5 … 0.5
                y: (e.clientY / window.innerHeight) - 0.5,
            };
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    // ─── 4. Canvas resize (DPR-aware) ───────────────────────────────────────
    useEffect(() => {
        if (!ready) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width  = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width  = `${w}px`;
            canvas.style.height = `${h}px`;
            // High-quality bicubic resampling for max sharpness — the decode
            // pre-pass below means we're never paying decode cost at draw time,
            // and Lenis smooth scroll feeds the lerp a continuous stream
            // (instead of chunky native scroll events), so the canvas isn't
            // racing to catch up. Quality + smooth motion.
            const c = canvas.getContext('2d');
            if (c) {
                c.imageSmoothingEnabled = true;
                c.imageSmoothingQuality = 'high';
            }
            lastFrameRef.current = -1; // force redraw after resize
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [ready]);

    // ─── 5. Master RAF loop — scroll + parallax ─────────────────────────────
    useEffect(() => {
        if (!ready) return;

        const canvas  = canvasRef.current;
        const wrapper = wrapperRef.current;
        const ctx     = canvas?.getContext('2d');
        if (!ctx || !wrapper) return;

        // Parallax tuning — tweak these to taste
        const MAX_PAN_X  = 38;   // px  left/right look
        const MAX_PAN_Y  = 22;   // px  up/down look
        const MAX_TILT_Y = 3.4;  // deg left/right tilt (rotateY)
        const MAX_TILT_X = 2.2;  // deg up/down tilt   (rotateX)
        const PAN_LERP   = 0.065; // lower = lazier / more cinematic
        const TILT_LERP  = 0.055;
        const SCROLL_LERP = 0.12; // Lower lerp is fine here because Lenis is
                                   // smoothing the underlying scroll input — we
                                   // can afford a long cinematic glide without
                                   // feeling laggy, since the source signal is
                                   // already buttery.

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);

            // ── A. Smooth scroll progress → frame ─────────────────────────
            const rawProgress = progress.get();
            displayProgressRef.current +=
                (rawProgress - displayProgressRef.current) * SCROLL_LERP;

            const clamped    = Math.max(0, Math.min(1, displayProgressRef.current));
            const frameIndex = Math.round(clamped * (FRAME_COUNT - 1));

            if (frameIndex !== lastFrameRef.current) {
                // Find nearest loaded frame in both directions — with keyframe-
                // first loading, the closest hit is usually within a few indices.
                let drawIndex = frameIndex;
                const isLoaded = (i) => {
                    const f = framesRef.current[i];
                    return f?.complete && f.naturalWidth > 0;
                };
                if (!isLoaded(drawIndex)) {
                    for (let d = 1; d < FRAME_COUNT; d++) {
                        if (drawIndex - d >= 0 && isLoaded(drawIndex - d)) { drawIndex = drawIndex - d; break; }
                        if (drawIndex + d < FRAME_COUNT && isLoaded(drawIndex + d)) { drawIndex = drawIndex + d; break; }
                    }
                }

                const img = framesRef.current[drawIndex];
                if (img?.complete && img.naturalWidth > 0) {
                    lastFrameRef.current = frameIndex;

                    const cw = canvas.width;
                    const ch = canvas.height;
                    const iw = img.naturalWidth;
                    const ih = img.naturalHeight;
                    const imgAspect    = iw / ih;
                    const canvasAspect = cw / ch;

                    if (ch > cw) {
                        // ── Portrait (mobile): cinematic blurred-fill letterbox ──
                        // The footage is 16:9 but the screen is tall and narrow.
                        // Filling the screen would crop ~75% of the frame width and
                        // lose the eagle / SOIL vines. Instead: paint an ambient
                        // blurred cover behind (fills the screen, no dead bars),
                        // then lay the FULL sharp frame on top, fit to width and
                        // centered — so the entire composition is always visible.

                        // 1. Ambient blurred fill — max-scale cover, darkened.
                        // 1.12 overscan so the 22px blur never samples past the
                        // image edge (which would leave a faint transparent fringe).
                        const coverScale = Math.max(cw / iw, ch / ih) * 1.12;
                        const fW = iw * coverScale;
                        const fH = ih * coverScale;
                        const fX = (cw - fW) / 2;
                        const fY = (ch - fH) / 2;
                        ctx.save();
                        ctx.filter = 'blur(22px) brightness(0.45) saturate(1.1)';
                        ctx.drawImage(img, fX, fY, fW, fH);
                        ctx.restore();

                        // 2. Sharp full frame — fit to width, vertically centered
                        const sW = cw;
                        const sH = cw / imgAspect;
                        const sY = (ch - sH) / 2;
                        ctx.drawImage(img, 0, sY, sW, sH);
                    } else {
                        // ── Landscape / desktop: cover (fill, crop overflow) ──
                        let sw, sh, sx, sy;
                        if (canvasAspect > imgAspect) {
                            sw = cw; sh = cw / imgAspect; sx = 0; sy = (ch - sh) / 2;
                        } else {
                            sh = ch; sw = ch * imgAspect; sy = 0;
                            sx = (cw - sw) / 2;
                        }
                        ctx.drawImage(img, sx, sy, sw, sh);
                    }
                }
            }

            // ── B. Parallax — skip on touch devices ───────────────────────
            if (isTouchRef.current) return;

            const mx = mouseRef.current.x; // -0.5 … 0.5
            const my = mouseRef.current.y;

            // Lerp pan (camera translation)
            panRef.current.x  += (mx * -MAX_PAN_X  - panRef.current.x)  * PAN_LERP;
            panRef.current.y  += (my * -MAX_PAN_Y  - panRef.current.y)  * PAN_LERP;

            // Lerp tilt (perspective rotation — gives real 3D depth)
            tiltRef.current.x += (my * -MAX_TILT_X - tiltRef.current.x) * TILT_LERP;
            tiltRef.current.y += (mx *  MAX_TILT_Y - tiltRef.current.y) * TILT_LERP;

            const { x: px, y: py }   = panRef.current;
            const { x: tx, y: ty }   = tiltRef.current;

            // Single CSS transform — GPU composited, no canvas redraws
            // scale(1.04) — minimum needed to hide canvas edges during parallax
            // tilt; v1 used 1.10 which softened the image by 10 % for no reason.
            wrapper.style.transform =
                `perspective(900px) rotateX(${tx.toFixed(3)}deg) rotateY(${ty.toFixed(3)}deg) translate(${px.toFixed(2)}px, ${py.toFixed(2)}px) scale(1.04)`;
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [ready, progress]);

    return (
        <>
        <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">

            {/* ── Parallax wrapper — scaled up so edges never show ──────── */}
            <div
                ref={wrapperRef}
                className="absolute inset-0"
                style={{
                    transformOrigin: 'center center',
                    willChange: 'transform',
                    opacity: ready ? 1 : 0,
                    transition: 'opacity 2s ease 1.2s',
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{
                        // Cinematic grade:
                        //  brightness 0.78 — lifted from 0.62; reveals ~25% more
                        //                    detail in the foliage and sky without
                        //                    losing the moody feel.
                        //  contrast 1.14   — adds bite to edges; makes the 1080 px
                        //                    source feel sharper than its true res.
                        //  saturate 1.08   — slight warmth in the earth tones.
                        //  sepia 0.10      — subtle film LUT (orange-in-highlights,
                        //                    teal-shadows once contrast hits it).
                        filter: 'brightness(0.78) contrast(1.14) saturate(1.08) sepia(0.10)',
                    }}
                />
            </div>

            {/* ── Cinematic overlays — outside wrapper so they don't tilt ── */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

        </div>

        {createPortal(
            <div
                className="fixed inset-0 bg-[#0a0806] flex flex-col items-center justify-center px-6 overflow-hidden"
                style={{
                    zIndex: 9999,
                    opacity: ready ? 0 : 1,
                    pointerEvents: ready ? 'none' : 'auto',
                    transition: 'opacity 1.6s ease 0.5s',
                }}
                aria-hidden={ready}
                role="status"
                aria-label="Loading the SOIL experience"
            >
                {/* faint radial warmth from below — same earthy palette as the eagle grade */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'radial-gradient(120% 80% at 50% 120%, rgba(217,160,54,0.10), transparent 60%)' }} />

                <div className="relative flex flex-col items-center max-w-2xl">
                    {/* Igbo proverb — the sacred line of the site */}
                    <div className="flex flex-col items-center mb-8 soil-proverb-in">
                        <p lang="ig"
                           className="font-display uppercase text-[#fff6dc]/90 leading-tight text-center"
                           style={{ fontSize: 'clamp(1.2rem, 4.4vw, 2.6rem)', letterSpacing: '0.1em' }}>
                            IJE DI MKPA KARIA EBE A NA-AGA
                        </p>
                        <p lang="ig"
                           className="font-display uppercase text-[#fff6dc]/90 leading-tight text-center"
                           style={{ fontSize: 'clamp(1.2rem, 4.4vw, 2.6rem)', letterSpacing: '0.1em' }}>
                            NA ONYE I GA-ABU IHE KACHA MKPA
                        </p>
                        {/* Rotating sub-line — translation first, then manifesto beats */}
                        <div className="flex flex-col items-center gap-2.5 mt-5">
                            <div className="w-10 h-px bg-soil-sun/25" />
                            <p
                                key={subline}
                                className="font-ui text-xs md:text-sm italic text-foreground/45 leading-relaxed text-center px-6 max-w-md min-h-[2.6em] soil-subline-in"
                            >
                                {SUBLINES[subline]}
                            </p>
                        </div>
                    </div>

                    {/* Spinner — thin ring with a soil-sun arc */}
                    <div className="relative w-9 h-9 mb-7">
                        <div className="absolute inset-0 rounded-full border-2 border-white/[0.07]" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-soil-sun animate-spin"
                             style={{ animationDuration: '0.9s' }} />
                    </div>

                    {/* Progress bar */}
                    <div className="w-52 h-px bg-white/10 relative overflow-hidden rounded-full">
                        <div
                            className="absolute left-0 top-0 h-full bg-soil-sun transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <p className="mt-4 text-[9px] tracking-[0.5em] uppercase text-foreground/30 font-ui tabular-nums">
                        {loadProgress < 100 ? `Cultivating the experience — ${loadProgress}%` : 'Entering the ecosystem'}
                    </p>
                </div>

                <style>{`
                    @keyframes soilProverbIn {
                        from { opacity: 0; transform: translateY(8px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .soil-proverb-in { animation: soilProverbIn 1s ease both; }
                    @keyframes soilSublineIn {
                        from { opacity: 0; transform: translateY(4px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .soil-subline-in { animation: soilSublineIn 0.9s ease both; }
                `}</style>
            </div>,
            document.body
        )}
        </>
    );
}
