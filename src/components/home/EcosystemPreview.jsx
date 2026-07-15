import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const LayerIcon = ({ id, color, hovered }) => {
    const glyphs = {
        intelligence: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <motion.circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
                <motion.circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" className="opacity-80" />
                <path d="M12 2v3M12 19v3M2 12h3m14 0h3" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </svg>
        ),
        studio: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <motion.path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 3 1.5 5.5 4 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" animate={{ pathLength: [0.9, 1, 0.9], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                <circle cx="10" cy="12" r="3" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                <path d="M12 8c1.5 0 3 1.5 3 4s-1.5 4-3 4" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            </svg>
        ),
        labs: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1" opacity="0.4" transform="rotate(45 12 12)" />
                <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1" opacity="0.4" transform="rotate(-45 12 12)" />
                <motion.circle cx="12" cy="12" r="2" fill="currentColor" animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </svg>
        ),
        soilnomics: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <path d="M7 12c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5S7 14.5 7 12z" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                <motion.path d="M12 12c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5-4.5 2-4.5 4.5 2 4.5 4.5 4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" animate={{ strokeDashoffset: [0, 40], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} strokeDasharray="10 30" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
        ),
        foundation: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <path d="M6 21h12M12 21V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 21v-8M16 21v-8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <motion.path d="M5 8c0-3.5 3-6.5 7-6.5s7 3 7 6.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity }} />
                <rect x="10.5" y="4" width="3" height="3" fill="currentColor" opacity="0.8" />
            </svg>
        ),
        instagram: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
        ),
        twitter: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" opacity="0.4" />
                <path d="M22 2l-9 9m-4 4l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 2l7 7m4 4l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        linkedin: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <path d="M6 20V8M10 20V12c0-2.2 1.8-4 4-4s4 1.8 4 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="6" cy="4" r="1.5" fill="currentColor" />
            </svg>
        ),
        email: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full overflow-visible">
                <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                <path d="M12 14v4" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            </svg>
        ),
    };
    return (
        <motion.div
            className={`w-10 h-10 ${color} relative`}
            animate={{ y: [0, -3, 0], rotate: hovered ? 5 : 0 }}
            transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 0.5 } }}
        >
            <div className="absolute inset-0 blur-[8px] opacity-20 bg-current rounded-full" />
            {glyphs[id] || glyphs.intelligence}
        </motion.div>
    );
};

const LAYERS = [
    {
        id: 'intelligence',
        title: 'SOIL Intelligence',
        subtitle: 'The Intellectual Layer',
        description: 'AI, strategic systems, consulting, and enterprise solutions. Helping organisations unlock clarity through structure and strategic execution.',
        detail: 'SOIL Intelligence is the strategic and systems arm of the ecosystem. We work at the intersection of artificial intelligence, organisational design, and African intellectual tradition — building frameworks that help institutions think clearly and act decisively. From enterprise consulting to AI-native tools, Intelligence turns complexity into momentum.',
        offerings: ['Strategic Consulting', 'AI Systems Design', 'Enterprise Frameworks', 'Research & Insight'],
        path: '/intelligence',
        color: 'text-soil-sun',
        glowColor: 'rgba(217,160,54,0.12)',
        accentColor: 'rgba(217,160,54,0.5)',
        borderActive: 'border-soil-sun/40',
    },
    {
        id: 'studio',
        title: 'SOIL Studio',
        subtitle: 'The Culture Layer',
        description: 'Art, garments, artefacts, and visual storytelling. Exploring African identity, memory, symbolism, and modern design.',
        detail: 'SOIL Studio is where culture is made tangible. Through garments, visual art, artefacts, and spatial design, the Studio translates African memory and symbolism into contemporary form. Every piece is a document — of identity, of time, of what it means to build beauty from roots.',
        offerings: ['Apparel & Garments', 'Visual Art', 'Cultural Artefacts', 'Brand Storytelling'],
        path: '/studio',
        color: 'text-soil-earth',
        glowColor: 'rgba(142,62,47,0.12)',
        accentColor: 'rgba(142,62,47,0.5)',
        borderActive: 'border-soil-earth/40',
    },
    {
        id: 'labs',
        title: 'SOIL Labs',
        subtitle: 'The Innovation Layer',
        description: 'Where ideas become systems and experiments become products. Exploring how technology and AI build meaningful tools.',
        detail: 'Labs is SOIL\'s engine of experimentation. It is where prototypes are born, where hypotheses meet reality, and where the next generation of African-built technology is incubated. Labs operates at the frontier — exploring what AI, software, and systems design can unlock when guided by cultural intelligence.',
        offerings: ['Product Incubation', 'AI Experiments', 'Tech Prototyping', 'Open Research'],
        path: '/cultivate',
        color: 'text-soil-chlorophyll',
        glowColor: 'rgba(45,57,36,0.18)',
        accentColor: 'rgba(45,90,39,0.5)',
        borderActive: 'border-green-700/40',
    },
    {
        id: 'soilnomics',
        title: 'Soilnomics',
        subtitle: 'The Economic Layer',
        description: 'How value is created, circulated, and sustained. Enterprise, ownership, and building durable systems of prosperity.',
        detail: 'Soilnomics is SOIL\'s framework for economic sovereignty. It examines how value flows through communities, how ownership structures shape futures, and how African institutions can build durable prosperity. This layer combines research, enterprise development, and financial design to create systems that endure beyond market cycles.',
        offerings: ['Economic Research', 'Enterprise Development', 'Ownership Models', 'Community Value Systems'],
        path: '/cultivate',
        color: 'text-soil-sand',
        glowColor: 'rgba(196,168,130,0.1)',
        accentColor: 'rgba(196,168,130,0.4)',
        borderActive: 'border-soil-sand/40',
    },
    {
        id: 'foundation',
        title: 'SOIL Foundation',
        subtitle: 'The Social Layer',
        description: 'Supporting communities, creating access, and contributing to the human side of transformation beyond commerce.',
        detail: 'The Foundation is SOIL\'s commitment to the people the ecosystem exists to serve. It funds access, education, and community infrastructure — ensuring that the benefits of innovation are not concentrated but distributed. The Foundation operates on the principle that the tree\'s purpose is the shade it gives.',
        offerings: ['Education Access', 'Community Infrastructure', 'Grants & Fellowships', 'Social Programmes'],
        path: '/cultivate',
        color: 'text-foreground/60',
        glowColor: 'rgba(242,239,233,0.05)',
        accentColor: 'rgba(242,239,233,0.2)',
        borderActive: 'border-border/60',
    },
];

// ─── Small grid card (front only, triggers the expand) ───────────────────────
function LayerCard({ layer, onOpen, anyOpen }) {
    const [hovered, setHovered] = useState(false);
    const cardRef = useRef(null);

    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const sx = useSpring(px, { stiffness: 220, damping: 22, mass: 0.4 });
    const sy = useSpring(py, { stiffness: 220, damping: 22, mass: 0.4 });
    const tiltY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
    const tiltX = useTransform(sy, [-0.5, 0.5], [6, -6]);
    const glowX = useTransform(sx, [-0.5, 0.5], ['25%', '75%']);
    const glowY = useTransform(sy, [-0.5, 0.5], ['25%', '75%']);

    const handleClick = () => {
        if (anyOpen || !cardRef.current) return;
        onOpen(layer, cardRef.current.getBoundingClientRect());
    };

    const onMouseMove = (e) => {
        if (anyOpen) return;
        const rect = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - rect.left) / rect.width - 0.5);
        py.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const onLeave = () => {
        setHovered(false);
        px.set(0);
        py.set(0);
    };

    return (
        <div
            ref={cardRef}
            role="button"
            tabIndex={anyOpen ? -1 : 0}
            aria-label={`Open ${layer.title} — ${layer.subtitle}`}
            style={{ perspective: '1200px' }}
            onMouseMove={onMouseMove}
            onMouseLeave={onLeave}
            onMouseEnter={() => !anyOpen && setHovered(true)}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className={`cursor-pointer rounded-sm transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-sun ${anyOpen ? 'opacity-20 scale-[0.95] pointer-events-none' : ''}`}
            data-hover
        >
            <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}>
                <div className={`border border-[1.5px] rounded-sm transition-colors duration-500 ${hovered ? layer.borderActive : 'border-border/80'}`}>
                    <div className="overflow-hidden rounded-sm relative">
                        <motion.div
                            animate={{ opacity: hovered ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: `radial-gradient(ellipse 80% 60% at var(--gx) var(--gy), ${layer.glowColor} 0%, transparent 70%)`,
                                ['--gx']: glowX,
                                ['--gy']: glowY,
                            }}
                        />
                        <div className="absolute inset-0 bg-background/55 backdrop-blur-md" />

                        <div className="relative p-4 md:p-8 min-h-[160px] md:min-h-[380px] flex flex-col justify-between">
                            <div>
                                <motion.div
                                    animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? [0, -5, 5, 0] : 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <LayerIcon id={layer.id} color={layer.color} hovered={hovered} />
                                </motion.div>
                                <h3 className="font-display text-base md:text-lg tracking-[0.1em] mt-6 text-foreground">
                                    {layer.title}
                                </h3>
                                <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/75 mt-1 font-ui font-medium">
                                    {layer.subtitle}
                                </p>
                            </div>
                            <div>
                                <p className="text-[15px] text-foreground/75 font-ui leading-relaxed mt-4 line-clamp-3">
                                    {layer.description}
                                </p>
                                <motion.p
                                    animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 text-[10px] tracking-[0.28em] uppercase font-ui text-foreground/65 font-medium"
                                >
                                    Click to open →
                                </motion.p>
                            </div>
                            <motion.div
                                animate={{ scaleX: hovered ? 1 : 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-soil-sun/40 to-transparent origin-left"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Expanded overlay (portal) ────────────────────────────────────────────────
function ExpandedCard({ layer, originRect, onClose }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Same card shape, just bigger — keep portrait rectangle proportions
    const overlayW = Math.min(window.innerWidth * 0.92, 420);
    const overlayH = Math.min(window.innerHeight * 0.85, 560);
    const cardCx   = originRect.left + originRect.width / 2;
    const cardCy   = originRect.top  + originRect.height / 2;
    const ix       = cardCx - window.innerWidth / 2;
    const iy       = cardCy - window.innerHeight / 2;
    const iScale   = originRect.width / overlayW;

    return createPortal(
        <>
            {/* Backdrop — opacity animation lives here, isolated from 3D context */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.08 }}
                className="fixed inset-0 z-[200] backdrop-blur-[3px]"
                onClick={onClose}
            />

            {/* Perspective container — plain div, no animation, no stacking context */}
            <div
                className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none"
                style={{ perspective: '1600px' }}
            >
            {/* Card — flips and travels simultaneously */}
            <motion.div
                initial={{ x: ix, y: iy, scale: iScale, rotateY: 0 }}
                animate={{ x: 0, y: 0, scale: 1, rotateY: 180 }}
                exit={{ x: ix, y: iy, scale: iScale, opacity: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.8, 1] } }}
                transition={{
                    x:       { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                    y:       { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                    scale:   { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                    rotateY: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                }}
                style={{ transformStyle: 'preserve-3d', width: `${overlayW}px`, height: `${overlayH}px`, position: 'relative', pointerEvents: 'auto' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── FRONT — absolute inset-0, solid bg, no compositing children ── */}
                <div
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        position: 'absolute',
                        inset: 0,
                    }}
                    className={`border ${layer.borderActive} rounded-sm`}
                >
                    <div className="absolute inset-0 overflow-hidden rounded-sm">
                        <div className="absolute inset-0 bg-background" />
                    </div>
                    <div className="relative h-full p-8 flex flex-col justify-between">
                        <div>
                            <LayerIcon id={layer.id} color={layer.color} />
                            <h3 className="font-display text-2xl md:text-3xl tracking-[0.08em] text-foreground mt-6">
                                {layer.title}
                            </h3>
                            <p className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 mt-2 font-ui font-medium">
                                {layer.subtitle}
                            </p>
                        </div>
                        <p className="font-ui text-[15px] text-foreground/70 leading-relaxed">
                            {layer.description}
                        </p>
                    </div>
                </div>

                {/* ── BACK — plain div, raw CSS transform, no FM transform ── */}
                <div
                    style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        position: 'absolute',
                        inset: 0,
                    }}
                    className={`border ${layer.borderActive} rounded-sm`}
                >
                    <div className="overflow-hidden rounded-sm absolute inset-0">
                        <div className="absolute inset-0 bg-[#141210]/95 backdrop-blur-xl" />
                        <div
                            className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: `linear-gradient(to right, transparent, ${layer.accentColor}, transparent)` }}
                        />
                        <div className="absolute -bottom-2 -right-2 text-[6rem] leading-none opacity-[0.04] font-display select-none pointer-events-none text-white">
                            {layer.title.split(' ').pop()}
                        </div>

                        <div className="relative p-6 md:p-8 h-full flex flex-col overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <LayerIcon id={layer.id} color={layer.color} />
                                    <p className={`text-[11px] tracking-[0.35em] uppercase font-ui font-semibold opacity-90 mt-4 mb-1 ${layer.color}`}>
                                        {layer.subtitle}
                                    </p>
                                    <h3 className="font-display text-2xl md:text-3xl tracking-tight text-white leading-tight">
                                        {layer.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 flex items-center justify-center border border-white/15 text-foreground/65 hover:text-white hover:border-white/40 transition-all duration-300 rounded-sm text-[11px] flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="w-full h-px bg-white/[0.06] mb-6" />

                            {/* Detail */}
                            <p className="font-ui text-[15px] text-foreground/75 leading-relaxed mb-6 flex-1">
                                {layer.detail}
                            </p>

                            {/* Offerings */}
                            <div className="mb-6">
                                <p className="text-[11px] tracking-[0.32em] uppercase text-foreground/60 mb-3 font-ui font-semibold">What we offer</p>
                                <div className="flex flex-col gap-2">
                                    {layer.offerings.map((o, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <span className={`text-sm ${layer.color} opacity-70`}>—</span>
                                            <span className="text-sm font-ui text-foreground/70">{o}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="pt-5 border-t border-white/[0.06]">
                                <Link
                                    to={layer.path}
                                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                                    className={`inline-flex items-center gap-3 border ${layer.borderActive} px-6 py-3.5 text-[11px] tracking-[0.28em] uppercase font-ui font-semibold ${layer.color} hover:bg-white/[0.04] transition-all duration-300 group rounded-sm`}
                                >
                                    Explore {layer.title}
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            </div>
        </>,
        document.body
    );
}

const reveal = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 },
    }),
};

export default function EcosystemPreview() {
    const { data: settings } = useSiteSettings();
    const [expandedLayer, setExpandedLayer] = useState(null);
    const [originRect, setOriginRect]       = useState(null);

    const handleOpen = (layer, rect) => {
        setOriginRect(rect);
        setExpandedLayer(layer);
    };

    const handleClose = () => {
        setExpandedLayer(null);
        setOriginRect(null);
    };

    return (
        <section className="relative py-8 md:py-12 px-4 md:px-6 overflow-hidden">
            {/* Bird sky lifted to Home.jsx as a fixed page-wide layer so the
                flock spans from here to the footer without section clipping. */}
            {/* transform: translateZ(0) forces this div onto its own GPU compositor layer,
                which the browser stacks above the WebGL canvas layer */}
            <div className="max-w-6xl mx-auto relative z-10" style={{ transform: 'translateZ(0)' }}>

                <motion.div
                    className="text-center mb-12 md:mb-20"
                    initial="hidden" whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={reveal} custom={0}
                >
                    <h2 className="font-display text-3xl md:text-6xl tracking-[0.1em] text-foreground">
                        {settings?.layers_heading}
                    </h2>
                    <p className="mt-6 font-ui text-sm md:text-base text-foreground/45 max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                        {settings?.layers_intro}
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-2">
                    {LAYERS.map((layer, i) => (
                        <motion.div
                            key={layer.id}
                            initial="hidden" whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={reveal} custom={i + 1}
                        >
                            <LayerCard
                                layer={layer}
                                onOpen={handleOpen}
                                anyOpen={!!expandedLayer}
                            />
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    className="text-center text-[11px] tracking-[0.28em] uppercase text-foreground/55 font-ui font-medium mt-8"
                    initial="hidden" whileInView="visible"
                    viewport={{ once: true, amount: 1 }}
                    variants={reveal} custom={7}
                >
                    Click any card to reveal
                </motion.p>
            </div>

            <AnimatePresence>
                {expandedLayer && originRect && (
                    <ExpandedCard
                        key={expandedLayer.id}
                        layer={expandedLayer}
                        originRect={originRect}
                        onClose={handleClose}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
