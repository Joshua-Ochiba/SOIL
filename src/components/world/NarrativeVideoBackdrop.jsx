import React, { useEffect, useRef, useState } from 'react';
import { useAnimationFrame, useSpring } from 'framer-motion';

/**
 * Enhanced narrative-driven video backdrop.
 * Designed to scrub perfectly in sync with the VideoNarrativeExperience.
 */
export default function NarrativeVideoBackdrop({ src = "/eagle.mp4", progress }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Smooth the incoming scroll progress with a spring
  const smoothProgress = useSpring(progress, {
    damping: 35,
    stiffness: 100,
    mass: 0.5,
    restDelta: 0.001
  });

  useAnimationFrame(() => {
    const video = videoRef.current;
    if (!video || !video.duration || video.seeking) return;

    // Use the smoothed progress for a "glide" feel
    const currentProgress = smoothProgress.get();
    const targetTime = currentProgress * (video.duration - 0.05);

    // Only seek if the difference is significant enough to avoid micro-stutters
    // but frequent enough to feel responsive
    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      video.currentTime = targetTime;
    }
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => setReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: 'brightness(0.5) contrast(1.1)' }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
