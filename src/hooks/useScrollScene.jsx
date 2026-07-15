import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

/**
 * Chapter boundaries — same ranges used by VideoScrollExperience text overlays.
 * This context provides a single source of truth for scroll-driven 3D + text layers.
 */
const CHAPTER_RANGES = [
  { id: 'hero',   range: [0.00, 0.04] },
  { id: 'eagle',  range: [0.04, 0.22] },
  { id: 'flight', range: [0.22, 0.40] },
  { id: 'seed',   range: [0.40, 0.58] },
  { id: 'root',   range: [0.58, 0.76] },
  { id: 'fruit',  range: [0.76, 1.00] },
];

const ScrollSceneContext = createContext({
  progress: 0,
  chapter: 0,
  chapterId: 'hero',
  chapterProgress: 0,
  velocity: 0,
});

/**
 * Provider — wraps the page and drives a RAF loop that reads scrollY.
 * Smooths the raw scroll into a lerped `progress` value for buttery 3D transitions.
 */
export function ScrollSceneProvider({ children, containerRef }) {
  const [state, setState] = useState({
    progress: 0,
    chapter: 0,
    chapterId: 'hero',
    chapterProgress: 0,
    velocity: 0,
  });

  // Refs for RAF loop (avoid re-renders per frame — only setState at ~30Hz)
  const rawProgress = useRef(0);
  const smoothProgress = useRef(0);
  const prevProgress = useRef(0);
  const smoothVelocity = useRef(0);
  const lastUpdate = useRef(0);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;

      // Read raw scroll
      const el = containerRef?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const totalScroll = el.scrollHeight - window.innerHeight;
        const scrolled = -rect.top;
        rawProgress.current = totalScroll > 0
          ? Math.max(0, Math.min(1, scrolled / totalScroll))
          : 0;
      } else {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        rawProgress.current = max > 0
          ? Math.max(0, Math.min(1, window.scrollY / max))
          : 0;
      }

      // Lerp smooth progress (heavier smoothing = more cinematic)
      smoothProgress.current += (rawProgress.current - smoothProgress.current) * 0.08;

      // Velocity (smoothed absolute delta)
      const delta = Math.abs(smoothProgress.current - prevProgress.current);
      smoothVelocity.current += (delta - smoothVelocity.current) * 0.1;
      prevProgress.current = smoothProgress.current;

      // Throttle React state updates to ~30fps
      const now = performance.now();
      if (now - lastUpdate.current > 33) {
        lastUpdate.current = now;

        const p = smoothProgress.current;
        let ch = 0;
        let chId = 'hero';
        let chP = 0;

        for (let i = 0; i < CHAPTER_RANGES.length; i++) {
          const [start, end] = CHAPTER_RANGES[i].range;
          if (p >= start && p <= end) {
            ch = i;
            chId = CHAPTER_RANGES[i].id;
            chP = (end - start) > 0 ? (p - start) / (end - start) : 0;
            break;
          }
          if (p > end) {
            ch = i;
            chId = CHAPTER_RANGES[i].id;
            chP = 1;
          }
        }

        setState({
          progress: p,
          chapter: ch,
          chapterId: chId,
          chapterProgress: chP,
          velocity: smoothVelocity.current,
        });
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  // Also expose a ref for per-frame reading in Three.js (no React overhead)
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  progressRef.current = state.progress;
  velocityRef.current = state.velocity;

  const contextValue = React.useMemo(() => ({
    ...state,
    progressRef,
    velocityRef,
  }), [state]);

  return (
    <ScrollSceneContext.Provider value={contextValue}>
      {children}
    </ScrollSceneContext.Provider>
  );
}

export function useScrollScene() {
  return useContext(ScrollSceneContext);
}

export { CHAPTER_RANGES };
export default useScrollScene;
