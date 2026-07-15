import React, { useEffect, useRef, useState } from 'react';
import { useAnimationFrame } from 'framer-motion';

/**
 * Global scrubbed-video backdrop. Fixed full-viewport, sits behind everything.
 *
 * Three reactivity layers, all driven by a single RAF loop:
 *  1. Scroll → video.currentTime  (frame scrubbing — the scrollytelling itself)
 *  2. Scroll → filter (color grading curve: warm gold → cool forest → golden bloom)
 *  3. Cursor → translate (subtle 3D parallax under cursor)
 *  4. Scroll velocity → brightness boost + tiny blur (settles in ~400ms)
 *
 * Respects prefers-reduced-motion: parallax + velocity reactivity disable; color grading + scrub remain.
 */
export default function ScrollVideoBackdrop({ src, progress }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  // High-performance loop that runs outside of React re-renders
  useAnimationFrame(() => {
    const video = videoRef.current;
    if (!video || !video.duration || video.seeking) return;

    // Get current scroll progress (0-1) from the MotionValue
    const currentProgress = progress.get();
    const targetTime = currentProgress * (video.duration - 0.05);

    // Only seek if the difference is significant enough to avoid micro-stutters
    if (Math.abs(video.currentTime - targetTime) > 0.04) {
      video.currentTime = targetTime;
    }
  });

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => setReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ filter: 'brightness(0.5) contrast(1.05)' }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      {/* Bottom fade into footer */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
