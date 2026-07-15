import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// Panel auto-collapses after this many ms with no hover/touch
const IDLE_TIMEOUT_MS = 4000;

// Duke's curated SOIL playlist — used as the default when no CMS track URLs are
// set, so the soundtrack always works out of the box. CMS settings override it.
const DEFAULT_PLAYLIST_URL = 'https://open.spotify.com/playlist/1De37HTKyanp5sdnaMQQvH';

// Official Spotify mark — inlined so we don't pull a whole icon library.
// Inherits `currentColor`, so the parent's `text-*` class controls colour.
function SpotifyIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.421a.62.62 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.871 7.077-.496 9.713 1.115a.623.623 0 01.206.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 11-.452-1.493c3.633-1.102 8.147-.568 11.232 1.328a.78.78 0 01.257 1.074zm.105-2.835c-3.223-1.914-8.54-2.09-11.617-1.156a.935.935 0 11-.542-1.79c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 01-.956 1.608z" />
        </svg>
    );
}

/**
 * SpotifyPlayer — floating soundtrack widget
 *
 * Architecture:
 *  - One persistent iframe that NEVER unmounts (otherwise music stops on
 *    panel close / route nav). The panel chrome around it animates open/closed.
 *  - Reads up to 3 track/playlist URLs from site_settings. Empty slots are
 *    hidden. If all three are empty, the player doesn't render at all.
 *  - Subtle pulse hint on the closed button until first interaction, so
 *    visitors discover the soundtrack without it being intrusive.
 *  - Mounted inside PublicRoutes (not in admin), so it survives /studio →
 *    /cultivate → /studio/product/* navigation.
 */

// Convert any Spotify share URL into an embed URL.
function toEmbedUrl(rawUrl) {
    if (!rawUrl) return null;
    let url = rawUrl.trim();
    if (!url) return null;
    if (url.includes('open.spotify.com/embed/')) return url.split('?')[0];
    if (url.includes('open.spotify.com/')) {
        return url.replace('open.spotify.com/', 'open.spotify.com/embed/').split('?')[0];
    }
    return null;
}

// The shareable (non-embed) URL — opens the full playlist in the Spotify app/web,
// where it plays in full. Used by the "Get the full SOIL playlist" CTA.
function toOpenUrl(rawUrl) {
    if (!rawUrl) return null;
    const url = rawUrl.trim().split('?')[0];
    if (!url) return null;
    return url.replace('open.spotify.com/embed/', 'open.spotify.com/');
}

export default function SpotifyPlayer() {
    const { data: settings } = useSiteSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    const idleTimerRef = useRef(null);

    const tracks = useMemo(() => {
        const fromSettings = settings ? [
            { label: settings.spotify_track_1_label || 'Track 1', url: toEmbedUrl(settings.spotify_track_1_url), openUrl: toOpenUrl(settings.spotify_track_1_url) },
            { label: settings.spotify_track_2_label || 'Track 2', url: toEmbedUrl(settings.spotify_track_2_url), openUrl: toOpenUrl(settings.spotify_track_2_url) },
            { label: settings.spotify_track_3_label || 'Track 3', url: toEmbedUrl(settings.spotify_track_3_url), openUrl: toOpenUrl(settings.spotify_track_3_url) },
        ].filter(t => t.url) : [];
        if (fromSettings.length > 0) return fromSettings;
        // No CMS tracks set → fall back to Duke's curated SOIL playlist.
        return [{ label: 'SOIL Sessions', url: toEmbedUrl(DEFAULT_PLAYLIST_URL), openUrl: toOpenUrl(DEFAULT_PLAYLIST_URL) }];
    }, [settings]);

    useEffect(() => {
        if (activeIdx >= tracks.length && tracks.length > 0) setActiveIdx(0);
    }, [tracks.length, activeIdx]);

    // ── Idle auto-collapse ──────────────────────────────────────────────────
    // When the panel is open, start a countdown to auto-close. Mouse entering
    // the panel cancels it; leaving restarts it. The iframe captures internal
    // events (cross-origin), but mouseenter/leave on the parent wrapper still
    // fire because they're triggered on the DOM element, not its contents.
    const armIdleTimer = () => {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => setIsOpen(false), IDLE_TIMEOUT_MS);
    };
    const cancelIdleTimer = () => clearTimeout(idleTimerRef.current);

    useEffect(() => {
        if (!isOpen) {
            cancelIdleTimer();
            return;
        }
        armIdleTimer();
        return cancelIdleTimer;
    }, [isOpen, activeIdx]);

    if (tracks.length === 0) return null;

    const activeTrack = tracks[Math.min(activeIdx, tracks.length - 1)];

    const handleOpen = () => {
        setIsOpen(true);
        setHasInteracted(true);
    };

    return (
        <>
            {/* ── Closed-state floating button ────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, y: 12, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: hasInteracted ? 0 : 1.5 }}
                        onClick={handleOpen}
                        className="fixed bottom-5 right-5 z-[150] w-12 h-12 rounded-full bg-[#0a0806]/95 backdrop-blur border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] hover:bg-[#1DB954]/10 hover:border-[#1DB954]/70 transition-all duration-300 group shadow-lg shadow-black/40"
                        aria-label="Open soundtrack player"
                    >
                        <SpotifyIcon className="w-5 h-5" />
                        {/* Pulsing ring — only until first interaction */}
                        {!hasInteracted && (
                            <>
                                <span className="absolute inset-0 rounded-full border border-[#1DB954]/50 animate-ping" />
                                <span className="absolute -inset-1 rounded-full border border-[#1DB954]/20 animate-pulse" />
                            </>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Panel — chrome animates open, iframe stays mounted ────── */}
            {/* Hover pauses the idle timer; leaving restarts the countdown.  */}
            <motion.div
                onMouseEnter={cancelIdleTimer}
                onMouseLeave={armIdleTimer}
                onTouchStart={armIdleTimer}
                initial={false}
                animate={{
                    opacity:        isOpen ? 1 : 0,
                    y:              isOpen ? 0 : 16,
                    scale:          isOpen ? 1 : 0.96,
                    pointerEvents:  isOpen ? 'auto' : 'none',
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="fixed bottom-5 right-5 z-[150] w-[min(92vw,340px)] bg-[#0e0c0a]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <SpotifyIcon className="w-4 h-4 text-[#1DB954]" />
                        <p className="text-[11px] tracking-[0.32em] uppercase font-ui font-semibold text-white">
                            Soundtrack
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 flex items-center justify-center text-foreground/55 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                        aria-label="Close player"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Tab switcher — hidden if only one track */}
                {tracks.length > 1 && (
                    <div className="flex gap-1 px-3 pt-3 pb-2 border-b border-white/[0.04] overflow-x-auto scrollbar-hide">
                        {tracks.map((track, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIdx(i)}
                                className={`px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase font-ui font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                                    activeIdx === i
                                        ? 'bg-[#1DB954]/20 text-[#1DB954]'
                                        : 'text-foreground/55 hover:text-foreground/85 hover:bg-white/[0.03]'
                                }`}
                            >
                                {track.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* The iframe itself — keyed by URL so changing tracks reloads it */}
                <div className="p-3">
                    <iframe
                        key={activeTrack.url}
                        src={activeTrack.url}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                        title="Spotify Player"
                    />
                    {/* Full-playlist CTA — anyone hearing 30s previews (i.e. not
                        signed into Spotify) is one tap from the full playlist,
                        which plays in full inside Spotify. Framed as an invite,
                        not an error. */}
                    <div className="mt-3 flex flex-col items-center gap-2">
                        <p className="text-[11px] text-foreground/55 font-ui">
                            Like what you hear?
                        </p>
                        <a
                            href={activeTrack.openUrl || 'https://open.spotify.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#1DB954] hover:bg-[#1ed760] text-[#0a0806] text-[12px] font-ui font-semibold tracking-wide py-2.5 rounded-lg transition-colors duration-300"
                        >
                            <SpotifyIcon className="w-4 h-4" />
                            Get the full SOIL playlist
                        </a>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
