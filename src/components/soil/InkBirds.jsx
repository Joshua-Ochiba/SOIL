import { useRef, useEffect } from 'react';

const NUM_BIRDS = 38;
const MAX_SPEED = 1.8;
const MIN_SPEED = 0.5;

// Boids weights
const SEP_RADIUS = 40;
const ALIGN_RADIUS = 80;
const COHESION_RADIUS = 100;
const SEP_WEIGHT = 1.6;
const ALIGN_WEIGHT = 1.0;
const COHESION_WEIGHT = 0.8;

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function limit(vx, vy, max) {
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > max) { return [vx / len * max, vy / len * max]; }
    return [vx, vy];
}

class Bird {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        const angle = Math.random() * Math.PI * 2;
        const spd = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingSpeed = 0.04 + Math.random() * 0.03;
        this.size = 0.7 + Math.random() * 0.6;
        // Slight opacity variation — some birds feel further away
        this.baseOpacity = 0.25 + Math.random() * 0.5;
    }

    update(birds, w, h) {
        let sepX = 0, sepY = 0, sepCount = 0;
        let alignX = 0, alignY = 0, alignCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        for (const other of birds) {
            if (other === this) continue;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < SEP_RADIUS && d > 0) {
                sepX -= dx / d;
                sepY -= dy / d;
                sepCount++;
            }
            if (d < ALIGN_RADIUS) {
                alignX += other.vx;
                alignY += other.vy;
                alignCount++;
            }
            if (d < COHESION_RADIUS) {
                cohX += other.x;
                cohY += other.y;
                cohCount++;
            }
        }

        let ax = 0, ay = 0;

        if (sepCount > 0) {
            ax += (sepX / sepCount) * SEP_WEIGHT;
            ay += (sepY / sepCount) * SEP_WEIGHT;
        }
        if (alignCount > 0) {
            ax += (alignX / alignCount - this.vx) * ALIGN_WEIGHT * 0.05;
            ay += (alignY / alignCount - this.vy) * ALIGN_WEIGHT * 0.05;
        }
        if (cohCount > 0) {
            ax += (cohX / cohCount - this.x) * COHESION_WEIGHT * 0.001;
            ay += (cohY / cohCount - this.y) * COHESION_WEIGHT * 0.001;
        }

        // Soft boundary — nudge back toward canvas
        const margin = 80;
        if (this.x < margin) ax += 0.08;
        if (this.x > w - margin) ax -= 0.08;
        if (this.y < margin) ay += 0.08;
        if (this.y > h - margin) ay -= 0.08;

        this.vx += ax;
        this.vy += ay;
        [this.vx, this.vy] = limit(this.vx, this.vy, MAX_SPEED);

        // Enforce minimum speed so birds never stall
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd < MIN_SPEED) {
            this.vx = (this.vx / spd) * MIN_SPEED;
            this.vy = (this.vy / spd) * MIN_SPEED;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap at edges
        if (this.x < -20) this.x = w + 20;
        if (this.x > w + 20) this.x = -20;
        if (this.y < -20) this.y = h + 20;
        if (this.y > h + 20) this.y = -20;

        this.wingPhase += this.wingSpeed;
    }

    draw(ctx, color1, color2) {
        const angle = Math.atan2(this.vy, this.vx);
        const wingBeat = Math.sin(this.wingPhase); // -1 to 1

        const s = this.size;

        // Wing arc spread: full down-stroke opens wider, up-stroke tucks in
        const spread = (wingBeat * 0.5 + 0.5); // 0 to 1
        const halfSpan = (12 + spread * 10) * s;
        const dip = (4 + spread * 6) * s; // how much wings bow downward at tips

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // Blend between color1 and color2 based on wing position — subtle shimmer
        const t = spread;
        ctx.strokeStyle = lerpHex(color1, color2, t);
        ctx.lineWidth = clamp(0.8 * s, 0.5, 1.6);
        ctx.lineCap = 'round';
        ctx.globalAlpha = this.baseOpacity;

        // Left wing — quadratic arc from body center outward
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-halfSpan * 0.5, dip, -halfSpan, 0);
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(halfSpan * 0.5, dip, halfSpan, 0);
        ctx.stroke();

        ctx.restore();
    }
}

// Interpolate two hex colors
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

function lerpHex(a, b, t) {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg, bb] = hexToRgb(b);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
}

export default function InkBirds({
    color1 = '#D9A036',
    color2 = '#8E3E2F',
    count = NUM_BIRDS,
    opacity = 1,
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let w = canvas.offsetWidth;
        let h = canvas.offsetHeight;
        let dpr = window.devicePixelRatio || 1;
        let birds = [];
        let raf;

        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        };

        const init = () => {
            resize();
            birds = Array.from({ length: count }, () => new Bird(w, h));
        };

        const render = () => {
            ctx.clearRect(0, 0, w, h);
            for (const b of birds) {
                b.update(birds, w, h);
                b.draw(ctx, color1, color2);
            }
            raf = requestAnimationFrame(render);
        };

        const onResize = () => {
            resize();
            // Clamp birds back inside new bounds
            for (const b of birds) {
                b.x = clamp(b.x, 0, w);
                b.y = clamp(b.y, 0, h);
            }
        };

        window.addEventListener('resize', onResize);
        init();
        render();

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(raf);
        };
    }, [color1, color2, count]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{ pointerEvents: 'none', opacity }}
        />
    );
}
