import React, { useState, useEffect, useRef } from 'react';
import { motion, useTransform, useMotionValueEvent, useScroll, easeIn } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// Structure (scroll ranges, side, symbol) stays fixed — only the words are
// editable from Admin → Origin Page. `n` maps to the nar{n}_* settings keys.
const CHAPTER_STRUCTURE = [
  { n: 1, range: [0.07, 0.23], side: 'left',  symbol: '✦' },
  { n: 2, range: [0.23, 0.39], side: 'right', symbol: '◇' },
  { n: 3, range: [0.39, 0.55], side: 'left',  symbol: '⬡' },
  { n: 4, range: [0.53, 0.68], side: 'right', symbol: '◉' },
  { n: 5, range: [0.66, 0.84], side: 'left',  symbol: '◈', creditStyle: true },
];

export default function VideoNarrativeExperience() {
  const sectionRef = useRef(null);
  const { data: settings } = useSiteSettings();
  const [fontsReady, setFontsReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  // Merge fixed structure with editable copy from site settings
  const chapters = CHAPTER_STRUCTURE.map(c => ({
    ...c,
    label:   settings?.[`nar${c.n}_label`]   ?? '',
    heading: settings?.[`nar${c.n}_heading`] ?? '',
    body:    settings?.[`nar${c.n}_body`]    ?? '',
  }));

  // Section-local scroll — chapters now map to THIS section's 0→1, not the whole page.
  // This means the last chapter always gets its full scroll budget regardless of
  // how much content sits below on the page.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    let done = false;
    const flip = () => { if (!done) { done = true; setFontsReady(true); } };
    // Reveal the hero once fonts settle — but NEVER leave it hidden. If the
    // fonts promise stalls on a cold CDN (which never happens on warm local
    // dev), a 1.5s fallback flips it visible anyway so the title always shows.
    document.fonts?.ready.then(flip).catch(flip);
    const t = setTimeout(flip, 1500);
    return () => clearTimeout(t);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setHeroVisible(v < 0.07);
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.05], [0, -50]);

  // Bottom-anchored "rising layer" transition — instead of an all-over fade,
  // the background colour climbs up the viewport from the bottom, as if the
  // next chapter is being scrolled in from below as a new layer. A deep 45vh
  // feather at the top edge (set in the gradient style) means the rising edge
  // is a long, soft dissolve rather than a perceptible horizon line. Panel
  // overshoots to 150vh so the feather has fully cleared the top of the
  // viewport by the time the section ends.
  // Pushed late so the dawn-rise dissolve lands just ABOVE the 5-layers
  // boundary — the "We cultivate" credit fully clears (~0.84) AND a last beat
  // of eagle footage plays before the fade begins (~0.89), instead of the fade
  // eating into the end of the scrollytell.
  const fadeRiseHeight = useTransform(scrollYProgress, [0.89, 1], ['0vh', '150vh']);

  // Seam-closer: a full-viewport solid bg panel that fades to 100% opacity in
  // the final sliver of scroll. The feathered rising panel above is still
  // semi-transparent at its top edge as the section ends — without this, the
  // next section (EcosystemPreview, solid bg) scrolls up and its hard top edge
  // meets the not-yet-covered canvas for a frame, reading as a faint line.
  // This brings the whole viewport to solid bg right at the handoff, so the
  // next section matches seamlessly with nothing showing through.
  const seamClose = useTransform(scrollYProgress, [0.94, 0.995], [0, 1]);

  return (
    <div ref={sectionRef} className="relative" style={{ height: '600vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">

        {/* HERO TITLE — unmounted once scrolled past fade zone */}
        {heroVisible && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div style={{ opacity: fontsReady ? 1 : 0, transition: 'opacity 0.8s ease' }}>
              <motion.div
                style={{ opacity: heroOpacity, y: heroY }}
                className="flex flex-col items-center"
              >
                <p
                  className="text-sm tracking-[0.35em] md:tracking-[0.5em] uppercase text-soil-sun mb-6 md:mb-8 font-ui font-bold text-center px-4"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
                >
                  {settings?.hero_eyebrow}
                </p>
                <h1
                  className="font-display text-[clamp(3.5rem,15vw,9rem)] leading-none tracking-[0.05em] md:tracking-[0.22em] text-[#fff6dc] font-black"
                  style={{ textShadow: '4px 4px 0px rgba(217, 160, 54, 0.3), 8px 8px 0px rgba(0,0,0,0.2)' }}
                >
                  SOIL
                </h1>
                <div className="mt-12 flex flex-col items-center gap-3">
                  <span className="text-[11px] md:text-[13px] tracking-[0.35em] uppercase text-white/65 font-ui font-medium">
                    {settings?.hero_scroll_hint}
                  </span>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-px h-12 bg-gradient-to-b from-soil-sun/60 to-transparent"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* NARRATIVE CHAPTERS */}
        <div className="absolute inset-0 z-30">
          {chapters.map((ch, i) => (
            <NarrativeChapter key={i} chapter={ch} progress={scrollYProgress} />
          ))}
        </div>

        {/* Cinematic top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent pointer-events-none z-10" />

        {/* End-of-narrative transition — a bg-coloured panel rising from the
            bottom of the viewport. The eagle stays visible at the top while
            the floor rises like a layer being scrolled in. The linear-gradient
            keeps the top 10vh of the panel as a soft fade so the moving edge
            never reads as a horizon line. */}
        {/* Seam-closer: full-viewport solid bg, opacity 0→1 at the very end.
            Sits below the rising panel (z-40 vs the panel's own stacking) so
            the warm feathered rise stays visible during the transition, then
            this fills any remaining transparent gap at the exact handoff. */}
        <motion.div
          style={{ opacity: seamClose }}
          className="absolute inset-0 bg-background pointer-events-none z-40"
        />

        <motion.div
          style={{
            height: fadeRiseHeight,
            // Continuous dawn-lit dissolve. To kill Mach banding (the eye
            // amplifies any point where the gradient's slope changes), the ramp
            // uses many closely-spaced stops with small per-stop deltas in hue,
            // lightness and alpha simultaneously. The result reads as one smooth
            // curve with no perceptible demarcation lines — the base color lifts
            // toward a warm amber glow as it dissolves, like dawn rising into
            // the frame.
            background: `linear-gradient(to top,
              hsl(var(--background)) 0%,
              hsl(var(--background)) 30%,
              hsla(19 14% 12% / 0.97) 40%,
              hsla(21 17% 14% / 0.92) 46%,
              hsla(23 20% 15% / 0.86) 52%,
              hsla(25 24% 17% / 0.78) 57%,
              hsla(27 28% 19% / 0.69) 62%,
              hsla(29 32% 22% / 0.59) 67%,
              hsla(31 37% 25% / 0.49) 72%,
              hsla(33 41% 28% / 0.39) 77%,
              hsla(35 46% 32% / 0.30) 81%,
              hsla(37 50% 36% / 0.22) 85%,
              hsla(39 54% 40% / 0.15) 89%,
              hsla(41 58% 44% / 0.09) 93%,
              hsla(43 61% 48% / 0.04) 97%,
              hsla(44 63% 50% / 0.01) 99%,
              transparent 100%)`,
          }}
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-40"
        />
      </div>
    </div>
  );
}

function NarrativeChapter({ chapter, progress }) {
  const [start, end] = chapter.range;
  const span         = end - start;
  const isCredits    = !!chapter.creditStyle;

  // Credits chapter holds opacity longer before it fades; others follow a tighter arc
  const opacityBreaks = isCredits
    ? [start, start + 0.04, start + span * 0.84, end]
    : [start, start + 0.03, start + span * 0.72, start + span * 0.90];
  const opacity = useTransform(progress, opacityBreaks, [0, 1, 1, 0]);

  // Credits: rises from below the viewport like closing-credit titles (linear, no ease)
  // Normal: starts near center, drifts up and off the top (ease-in)
  const yFrom  = isCredits ? 700 : 80;
  const yTo    = isCredits ? -520 : -580;
  const yOpts  = isCredits ? {} : { ease: easeIn };
  const y      = useTransform(progress, [start, end], [yFrom, yTo], yOpts);

  // Scale — credits stay at 1; others compress slightly as they exit
  const scaleBreaks  = isCredits ? [start, end] : [start, start + 0.05, start + span * 0.75, end];
  const scaleOutputs = isCredits ? [1, 1]       : [1.06, 1, 1, 0.95];
  const scale        = useTransform(progress, scaleBreaks, scaleOutputs);

  // Blur — credits always sharp; others blur in/out
  const blurBreaks  = isCredits
    ? [start, end]
    : [start, start + 0.03, start + span * 0.72, start + span * 0.90];
  const blurOutputs = isCredits ? [0, 0] : [8, 0, 0, 10];
  const blurPx      = useTransform(progress, blurBreaks, blurOutputs);
  const filter      = useTransform(blurPx, (v) => `blur(${v}px)`);

  const isLeft     = chapter.side === 'left';
  const xOffset    = isLeft ? 'left-[4%] md:left-[10%]' : 'right-[4%] md:right-[10%]';
  const textAlign  = isLeft ? 'text-left' : 'text-right';
  const alignItems = isLeft ? 'items-start' : 'items-end';

  return (
    <motion.div
      style={{ opacity, y, scale, filter }}
      className={`absolute top-1/2 -translate-y-1/2 max-w-[260px] sm:max-w-[320px] md:max-w-[460px] flex flex-col ${alignItems} ${xOffset} ${textAlign}`}
    >
      <div className={`flex items-center gap-3 mb-5 ${isLeft ? '' : 'flex-row-reverse'}`}>
        <span className="text-soil-sun text-base">{chapter.symbol}</span>
        <p className="text-[11px] md:text-[13px] tracking-[0.4em] uppercase text-soil-sun font-ui font-semibold">
          {chapter.label}
        </p>
      </div>

      <h2
        className="font-ui font-bold text-[clamp(1.5rem,5.2vw,4.2rem)] text-white leading-[1.05] mb-4 md:mb-6 whitespace-pre-line tracking-tight"
        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)' }}
      >
        {chapter.heading}
      </h2>

      <p
        className="font-ui font-light text-xs md:text-base text-white/65 leading-relaxed tracking-wide"
        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
      >
        {chapter.body}
      </p>
    </motion.div>
  );
}
