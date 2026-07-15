import React, { useRef, useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';
import useIsDark from '@/hooks/useIsDark';

export default function ParticleDust({
    progress,
    count = 150,
    color = "#D9A036", // SOIL Gold
    fadeRange = [0.65, 0.85],
    intensity = 1
}) {
    const canvasRef = useRef(null);
    const isDark = useIsDark();
    const particleOpacity = useTransform(progress, fadeRange, [0, 0.6 * intensity]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;

        // Theme-tuned dust. Dark = the original gold motes (unchanged). Light =
        // deeper bronze/sepia flecks, fewer and slower, so they read on parchment
        // (gold vanishes on cream) and stay calm/scholarly — earth & ink suspended
        // in old paper rather than the night-time gold shimmer.
        const dustColor  = isDark ? color : '#8a6a2e';   // warm ochre-bronze — visible, not black
        const dustCount  = isDark ? count : Math.round(count * 0.6);
        const speedScale = isDark ? 1 : 0.6;

        let currentW = window.innerWidth;
        let currentH = window.innerHeight;
        let particles = [];

        // Pre-render blurred particle templates for performance
        const particleTemplates = [];
        const createTemplates = () => {
            // Dark: small, defined, brighter gold motes (the original look).
            // Light: larger, much softer, lower-opacity ochre haze so they read as
            // floating paper/earth flecks on parchment — never hard dots.
            const layers = isDark
                ? [
                    { size: 1.5, blur: 0, opacity: 0.8 }, // Sharp/Far
                    { size: 3, blur: 2, opacity: 0.4 },   // Mid
                    { size: 8, blur: 6, opacity: 0.2 },   // Near/Bokeh
                  ]
                : [
                    { size: 3, blur: 2, opacity: 0.55 },  // soft/far
                    { size: 6, blur: 4, opacity: 0.38 },  // mid haze
                    { size: 11, blur: 8, opacity: 0.22 }, // large bokeh
                  ];

            layers.forEach((layer, i) => {
                const pCanvas = document.createElement('canvas');
                const pSize = layer.size * 4; // Buffer for blur
                pCanvas.width = pSize * 2;
                pCanvas.height = pSize * 2;
                const pCtx = pCanvas.getContext('2d');

                const gradient = pCtx.createRadialGradient(pSize, pSize, 0, pSize, pSize, pSize);
                gradient.addColorStop(0, `${dustColor}${Math.floor(layer.opacity * 255).toString(16).padStart(2, '0')}`);
                gradient.addColorStop(1, `${dustColor}00`);

                pCtx.beginPath();
                pCtx.arc(pSize, pSize, pSize, 0, Math.PI * 2);
                pCtx.fillStyle = gradient;
                pCtx.fill();
                particleTemplates[i] = pCanvas;
            });
        };

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            currentW = window.innerWidth;
            currentH = window.innerHeight;
            canvas.width = currentW * dpr;
            canvas.height = currentH * dpr;
            canvas.style.width = currentW + 'px';
            canvas.style.height = currentH + 'px';
            ctx.scale(dpr, dpr);
            createTemplates();
        };

        class Particle {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * currentW;
                this.y = Math.random() * currentH;
                this.layer = Math.floor(Math.random() * 3); // 0: Far, 1: Mid, 2: Near

                // Motion props
                const speedMult = [0.1, 0.3, 0.8][this.layer] * speedScale;
                this.speedX = (Math.random() - 0.5) * speedMult;
                this.speedY = -(Math.random() * 0.4 + 0.1) * speedMult;

                // Sinusoidal drift
                this.drift = Math.random() * Math.PI * 2;
                this.driftSpeed = Math.random() * 0.02 * speedScale;

                this.opacity = Math.random() * 0.5 + 0.5;
            }

            update() {
                this.drift += this.driftSpeed;
                this.x += this.speedX + Math.sin(this.drift) * 0.2;
                this.y += this.speedY;

                if (this.y < -20) this.y = currentH + 20;
                if (this.x < -20) this.x = currentW + 20;
                if (this.x > currentW + 20) this.x = -20;
            }

            draw() {
                const template = particleTemplates[this.layer];
                const size = template.width / 2;

                // Cinematic lighting: Fade based on screen position (brighter in center)
                const distToCenter = Math.sqrt(Math.pow(this.x - currentW / 2, 2) + Math.pow(this.y - currentH / 2, 2));
                const lighting = Math.max(0.2, 1 - distToCenter / (currentW * 0.8));

                ctx.globalAlpha = this.opacity * lighting;
                ctx.drawImage(template, this.x - size / 2, this.y - size / 2, size, size);
                ctx.globalAlpha = 1.0;
            }
        }

        particles = Array.from({ length: dustCount }, () => new Particle());

        const render = () => {
            ctx.clearRect(0, 0, currentW, currentH);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [count, color, intensity, isDark]);

    return (
        <motion.canvas
            ref={canvasRef}
            style={{ opacity: particleOpacity }}
            className="fixed inset-0 pointer-events-none top-0 left-0 w-full h-full z-20"
        />
    );
}
