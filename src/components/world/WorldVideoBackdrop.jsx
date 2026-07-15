import React, { useEffect, useRef, useState } from 'react';

export default function WorldVideoBackdrop({
    progressRef,
    src = '/world.mp4',
    webmSrc = '',
    poster = '',
}) {
    /** @type {React.MutableRefObject<HTMLVideoElement | null>} */
    const videoRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let raf = 0;
        let cancelled = false;
        let easedProgress = progressRef?.current ?? 0;
        let lastSeekAt = 0;

        const onLoaded = () => {
            if (cancelled) return;
            setReady(true);
            try {
                video.pause();
            } catch {
                /* noop */
            }
        };

        const onError = () => {
            if (cancelled) return;
            setFailed(true);
        };

        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);

        const target = progressRef ?? { current: 0 };

        const sync = () => {
        };

        raf = requestAnimationFrame(sync);

        return () => {
            cancelled = true;
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [progressRef]);

    return (
        <div
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
            style={{
                backgroundColor: '#1f2115',
                backgroundImage: poster ? `url(${poster})` : undefined,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
            }}
        >

            {!failed && (
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    preload="auto"
                    poster={poster}
                    style={{ transition: 'opacity 1500ms ease' }}
                    className={`w-full h-full object-cover ${ready ? 'opacity-100' : 'opacity-0'}`}
                >
                    {webmSrc && <source src={webmSrc} type="video/webm" />}
                    <source src={src} type="video/mp4" />
                </video>
            )}

        </div>
    );
}