import React, { useEffect, useRef, useState } from 'react';

/**
 * Custom cursor v2.
 * - Two-layer: precise dot + soft golden ring with glow
 * - Canvas-drawn trail (last 10 positions, fading alpha)
 * - data-hover: ring scales 1.6x, dot dims (smooth CSS transition)
 * - data-magnetic: cursor visually pulls toward element center;
 *                  element itself translates ~8px toward cursor (button squish)
 * - Auto-disabled on touch devices
 */
export default function CustomCursor() {
    const [visible, setVisible] = useState(false);
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const dotRef = useRef(null);
    const canvasRef = useRef(null);

    // Animation-only refs (no React renders)
    const targetRef = useRef({ x: -100, y: -100 });
    const currentRef = useRef({ x: -100, y: -100 });
    const hoveringRef = useRef(false);
    const magnetRef = useRef(null);
    const magnetRectRef = useRef(null);
    const trailRef = useRef([]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if ('ontouchstart' in window) return undefined;

        setVisible(true);

        const onMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
            // Refresh magnet rect occasionally — element may have moved
            if (magnetRef.current) {
                magnetRectRef.current = magnetRef.current.getBoundingClientRect();
            }
        };

        const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-hover]';

        const onOver = (e) => {
            const t = e.target;
            if (!(t instanceof Element)) return;

            const hov = t.closest(HOVER_SELECTOR);
            if (hov) {
                hoveringRef.current = true;
                ringRef.current?.classList.add('cursor-ring--hover');
                dotRef.current?.classList.add('cursor-dot--hover');
            }

            const mag = /** @type {HTMLElement | null} */ (t.closest('[data-magnetic]'));
            if (mag) {
                magnetRef.current = mag;
                magnetRectRef.current = mag.getBoundingClientRect();
            }
        };

        const onOut = (e) => {
            const t = e.target;
            if (!(t instanceof Element)) return;

            const hov = t.closest(HOVER_SELECTOR);
            if (hov && !e.relatedTarget?.closest?.(HOVER_SELECTOR)) {
                hoveringRef.current = false;
                ringRef.current?.classList.remove('cursor-ring--hover');
                dotRef.current?.classList.remove('cursor-dot--hover');
            }

            const mag = /** @type {HTMLElement | null} */ (t.closest('[data-magnetic]'));
            if (mag && magnetRef.current === mag) {
                // Release element back to its origin
                mag.style.transform = '';
                magnetRef.current = null;
                magnetRectRef.current = null;
            }
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseover', onOver, { passive: true });
        document.addEventListener('mouseout', onOut, { passive: true });

        // ── Canvas trail ──
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        const resize = () => {
            if (!canvas || !ctx) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        // ── RAF loop: position + magnet + trail ──
        let raf = 0;
        const loop = () => {
            let tx = targetRef.current.x;
            let ty = targetRef.current.y;

            // Magnetic pull
            const magnet = magnetRef.current;
            const rect = magnetRectRef.current;
            if (magnet && rect) {
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = tx - cx;
                const dy = ty - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = Math.max(rect.width, rect.height) / 2 + 40;
                if (dist < radius) {
                    const pull = 1 - dist / radius;
                    // Pull cursor visually toward magnet center
                    tx -= dx * pull * 0.35;
                    ty -= dy * pull * 0.35;
                    // Move element slightly toward cursor (button squish)
                    const max = 8;
                    const ex = Math.max(-max, Math.min(max, dx * 0.18));
                    const ey = Math.max(-max, Math.min(max, dy * 0.18));
                    magnet.style.transform = `translate(${ex}px, ${ey}px)`;
                    magnet.style.transition = 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)';
                }
            }

            // Lerp visual position
            const lerp = 0.2;
            currentRef.current.x += (tx - currentRef.current.x) * lerp;
            currentRef.current.y += (ty - currentRef.current.y) * lerp;
            const cx = currentRef.current.x;
            const cy = currentRef.current.y;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
            }

            // Trail
            const trail = trailRef.current;
            trail.unshift({ x: cx, y: cy });
            if (trail.length > 10) trail.length = 10;

            if (ctx) {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                for (let i = trail.length - 1; i >= 1; i -= 1) {
                    const p = trail[i];
                    const a = (1 - i / trail.length) * 0.14;
                    const r = 3 + (1 - i / trail.length) * 5;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(217, 160, 54, ${a})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            window.removeEventListener('resize', resize);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    if (!visible) return null;

    return (
        <>
            <style>{`
        * { cursor: none !important; }
        @media (hover: none) { * { cursor: auto !important; } }
        .cursor-ring {
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                      background 0.25s ease,
                      border-color 0.25s ease,
                      box-shadow 0.25s ease;
          transform: translate(-50%, -50%) scale(1);
        }
        .cursor-ring--hover {
          transform: translate(-50%, -50%) scale(1.6);
          background: rgba(217, 160, 54, 0.14) !important;
          border-color: rgba(217, 160, 54, 0.45) !important;
          box-shadow: 0 0 36px 6px rgba(217, 160, 54, 0.28) !important;
        }
        .cursor-dot {
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translate(-50%, -50%) scale(1);
        }
        .cursor-dot--hover {
          opacity: 0.4;
          transform: translate(-50%, -50%) scale(0.6);
        }
      `}</style>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-[10000] pointer-events-none"
                aria-hidden="true"
            />
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 z-[10001] pointer-events-none"
                style={{ transform: 'translate3d(-100px, -100px, 0)', willChange: 'transform' }}
            >
                <div
                    ref={ringRef}
                    className="cursor-ring absolute rounded-full"
                    style={{
                        width: 30,
                        height: 30,
                        background: 'rgba(217, 160, 54, 0.06)',
                        border: '1px solid rgba(217, 160, 54, 0.22)',
                        boxShadow: '0 0 22px 3px rgba(217, 160, 54, 0.16)',
                    }}
                />
                <div
                    ref={dotRef}
                    className="cursor-dot absolute rounded-full"
                    style={{
                        width: 6,
                        height: 6,
                        background: 'rgba(242, 239, 233, 0.95)',
                        boxShadow: '0 0 8px rgba(242, 239, 233, 0.5)',
                    }}
                />
            </div>
        </>
    );
}