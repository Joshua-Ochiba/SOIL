import React, { useRef, useEffect } from 'react';

/**
 * SkyBackdrop — looping sky-with-birds video for the EcosystemPreview section.
 * Replaces the previous WebGL VantaBirds (paper-craft style) with real
 * footage so it matches the photoreal eagle scene above.
 *
 * Architecture:
 *   - <video> sized to cover the parent section
 *   - autoplay + loop + muted + playsInline → plays instantly, mobile-safe
 *   - Top & bottom gradient overlays melt the video into the page bg so the
 *     sky has no hard edges as the user scrolls in and out of the section
 *   - z-0 keeps it under the LayerCards (z-10) but above the page bg
 *
 * Performance vs VantaBirds:
 *   - One pre-decoded video element vs continuous Three.js render loop
 *   - GPU-accelerated playback, near-zero CPU cost
 *   - 5 MB MP4 with faststart vs ~1.5 MB JS + perpetual WebGL frames
 */
export default function SkyBackdrop({
    src = '/sky/birds.mp4',
    topFadeHeight  = '40vh',
    botFadeHeight  = '30vh',
}) {
    const videoRef = useRef(null);

    // Some browsers (Safari) ignore the autoplay attribute when JS controls
    // the element; explicitly call play() to guarantee playback. Failures
    // are silent — the video just stays on its first frame, which still
    // reads as a sky photo backdrop.
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const tryPlay = () => v.play?.().catch(() => {});
        tryPlay();
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            <video
                ref={videoRef}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                    // Slight warm grade to match the eagle scene above —
                    // brighter than the dark scrollytell so this reads as
                    // sky, not a continuation of the night/cinema feel.
                    filter: 'brightness(1.05) contrast(1.04) saturate(1.08)',
                }}
            />

            {/* Top fade — sky melts up into the page bg */}
            <div
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{
                    height: topFadeHeight,
                    background: 'linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)',
                }}
            />
            {/* Bottom fade — sky melts down into the page bg */}
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                    height: botFadeHeight,
                    background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)',
                }}
            />
        </div>
    );
}
