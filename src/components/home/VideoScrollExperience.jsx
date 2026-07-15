import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useTransform } from 'framer-motion';
import useCursorPosition from '../../hooks/useCursorPosition';

// Story chapters keyed to scroll progress (0–1) over the 800vh container
const CHAPTERS = [
  {
    range: [0.04, 0.22],
    label: 'The Eagle',
    symbol: '✦',
    heading: 'From the highest vantage,\nit all begins.',
    body: 'Before the journey, there is perspective. The eagle sees what others cannot — the full landscape of what is possible.',
  },
  {
    range: [0.22, 0.40],
    label: 'The Flight',
    symbol: '◇',
    heading: 'Roots reach\nbefore they rise.',
    body: 'SOIL anchors itself in African indigenous knowledge, memory, and wisdom — the invisible infrastructure of our future.',
  },
  {
    range: [0.40, 0.58],
    label: 'The Seed',
    symbol: '⬡',
    heading: 'Everything begins\nin the soil.',
    body: 'Small. Dense. Full of potential. Waiting to be met by the right conditions. The seed does not rush its own becoming.',
  },
  {
    range: [0.58, 0.76],
    label: 'The Root',
    symbol: '◉',
    heading: 'Growth is not instant.\nIt is earned.',
    body: 'Through patience, pressure, and purpose — something new breaks through. Innovation shaped by culture. Intelligence guided by values.',
  },
  {
    range: [0.76, 0.95],
    label: 'The Fruit',
    symbol: '◈',
    heading: 'We cultivate\nfor future generations.',
    body: 'The measure of a tree is not its height — it is the shade it provides for those who come after. SOIL builds for what endures.',
  },
];

const FLARE_THRESHOLDS = [0.04, 0.22, 0.40, 0.58, 0.76, 0.95];

/** Reactive Chapter Component - Bypasses React re-renders during scroll */
function Chapter({ chapter, progress }) {
  const [start, end] = chapter.range;

  // High-performance reactive opacity and transform
  const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
  const translateY = useTransform(progress, [start, end], [20, -20]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 md:px-12"
      style={{ opacity, y: translateY }}
    >
      <div className="max-w-2xl text-center px-4 md:px-0">
        <p
          className="text-[15px] md:text-sm tracking-[0.3em] md:tracking-[0.6em] uppercase text-soil-sun mb-3 md:mb-4 font-ui font-bold text-center w-full px-2"
          style={{ textShadow: '0 0 15px rgba(217, 160, 54, 0.5)' }}
        >
          <span className="mr-2 opacity-80">{chapter.symbol}</span>{chapter.label}
        </p>
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[0.05em] text-foreground leading-[1.1] md:leading-tight mb-4 md:mb-6 whitespace-pre-line drop-shadow-md">
          {chapter.heading}
        </h2>
        <p className="font-ui text-base md:text-xl text-foreground/85 leading-relaxed max-w-lg mx-auto px-2 md:px-0">
          {chapter.body}
        </p>
      </div>
    </motion.div>
  );
}

/** Reactive Manifesto Overlay */
function ManifestoOverlay({ progress }) {
  const opacity = useTransform(progress, [0.88, 0.96], [0, 1]);

  return (
    <motion.div
      className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none px-6"
      style={{ opacity }}
    >
      <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-soil-sun/50 font-ui">
        IJE di mkpa karia ebe a na-aga
      </p>
      <p className="font-ui text-base md:text-xl text-foreground/70 italic text-center max-w-xl"
      >
        "SOIL is cultivating the future from a different starting point."
      </p>
      <div className="w-px h-10 bg-gradient-to-b from-soil-sun/40 to-transparent mt-2" />
    </motion.div>
  );
}

/** SOIL hero title with per-letter cursor drift. */
function HeroTitle({ heroOpacity, mounted }) {
  const letters = ['S', 'O', 'I', 'L'];
  const { normalizedRef } = useCursorPosition();
  const letterRefs = useRef([]);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const offsets = letters.map(() => ({ x: 0, y: 0 }));

    const loop = () => {
      if (cancelled) return;
      const cx = normalizedRef.current.x;
      const cy = normalizedRef.current.y;
      letters.forEach((_, i) => {
        const mult = 3 + i * 0.6;
        const tx = cx * mult;
        const ty = cy * (1.5 + i * 0.3);
        offsets[i].x += (tx - offsets[i].x) * 0.08;
        offsets[i].y += (ty - offsets[i].y) * 0.08;
        const el = letterRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${offsets[i].x.toFixed(2)}px, ${offsets[i].y.toFixed(2)}px, 0)`;
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [normalizedRef]);

  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
      transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}

      className="font-display text-[clamp(3.5rem,15vw,9rem)] leading-none tracking-[0.05em] md:tracking-[0.22em] text-[#fff6dc] font-black"
      style={{
        opacity: heroOpacity,
        textShadow: '4px 4px 0px rgba(217, 160, 54, 0.3), 8px 8px 0px rgba(0,0,0,0.2)'
      }}
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          ref={(el) => { letterRefs.current[i] = el; }}
          style={{ display: 'inline-block', willChange: 'transform' }}
        >
          {letter}
        </span>
      ))}
    </motion.h1>
  );
}

function ChapterFlare({ flareKey }) {
  return (
    <AnimatePresence>
      {flareKey >= 0 && (
        <motion.div
          key={flareKey}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.05, 1.1] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 pointer-events-none z-[15]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(217,160,54,0.35) 0%, rgba(217,160,54,0.12) 25%, transparent 60%)',
            mixBlendMode: 'screen',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 49% 50%, rgba(255,140,80,0.12) 0%, transparent 40%)',
              mixBlendMode: 'screen',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 51% 50%, rgba(80,180,200,0.10) 0%, transparent 40%)',
              mixBlendMode: 'screen',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VideoScrollExperience({ progress }) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [flareKey, setFlareKey] = useState(-1);

  const prevProgressRef = useRef(0);
  const flareCounterRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const unsubscribe = progress.on("change", (v) => {
      if (!reducedMotion) {
        const prev = prevProgressRef.current;
        for (const threshold of FLARE_THRESHOLDS) {
          if ((prev < threshold && v >= threshold) || (prev > threshold && v <= threshold)) {
            flareCounterRef.current += 1;
            setFlareKey(flareCounterRef.current);
            break;
          }
        }
      }
      prevProgressRef.current = v;
    });

    return () => unsubscribe();
  }, [progress]);

  const heroOpacity = useTransform(progress, [0, 0.05], [1, 0]);

  return (
    <div ref={containerRef} style={{ height: '800vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30 pointer-events-none" />
        <ChapterFlare flareKey={flareKey} />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 2, delay: 1 }}
            className="text-[13px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase text-soil-sun mb-6 md:mb-8 font-ui font-bold text-center px-4"
            style={{
              opacity: heroOpacity,
              textShadow: '0 0 20px rgba(217, 160, 54, 0.4)'
            }}
          >
            Sons & Daughters of the Indigenous Land
          </motion.p>

          <HeroTitle heroOpacity={heroOpacity} mounted={mounted} />


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="mt-10 md:mt-12 flex flex-col items-center gap-3"
            style={{ opacity: heroOpacity }}
          >
            <span className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-white font-ui">
              Begin the journey
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-10 md:h-12 bg-gradient-to-b from-soil-sun/60 to-transparent"
            />
          </motion.div>
        </div>

        <div className="absolute inset-0 z-20">
          {CHAPTERS.map((ch, i) => (
            <Chapter key={i} chapter={ch} progress={progress} />
          ))}
          <ManifestoOverlay progress={progress} />
        </div>

        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
          {CHAPTERS.map((ch, i) => (
            <NavDot key={i} chapter={ch} progress={progress} />
          ))}
        </div>

        <ProgressBar progress={progress} />
      </div>
    </div>
  );
}

function NavDot({ chapter, progress }) {
  const [start, end] = chapter.range;
  const opacity = useTransform(progress, [start - 0.05, start, end, end + 0.05], [0.3, 1, 1, 0.3]);

  return (
    <motion.div
      className="w-px h-6 bg-soil-sun rounded-full"
      style={{ opacity }}
    />
  );
}

function ProgressBar({ progress }) {
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
      <div className="w-24 md:w-32 h-px bg-border/20 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-soil-sun/50 origin-left"
          style={{ scaleX }}
        />
      </div>
      <span className="font-ui text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        Scroll to explore
      </span>
    </div>
  );
}
