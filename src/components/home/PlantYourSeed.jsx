import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from '../soil/ScrollReveal';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const LEAF_TYPES = ['sunflower', 'tulip', 'daisy', 'poppy'];

const FLOWER_PALETTES = {
    sunflower: ['#F5C030', '#F0A818', '#FAD428', '#E89C10'],
    tulip:     ['#E8364E', '#C830A0', '#8C28C8', '#E87028', '#D82882'],
    daisy:     ['#F8F8F8', '#F4ECC8', '#FFF4B0', '#E8F0D8'],
    poppy:     ['#E02020', '#E84E18', '#D02870', '#E85828', '#B8207A'],
};

function getSeedFlowerColor(id, leafType) {
    const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const palette = FLOWER_PALETTES[leafType] || FLOWER_PALETTES.tulip;
    return palette[n % palette.length];
}

const DEPTH = [
    { scale: 1.00, opacity: 0.94, brightness: 1.00, saturate: 1.15, blur: 0,   bottomMin: 2,   bottomRange: 16 },
    { scale: 0.62, opacity: 0.62, brightness: 0.76, saturate: 0.88, blur: 0.4, bottomMin: 52,  bottomRange: 24 },
    { scale: 0.42, opacity: 0.42, brightness: 0.62, saturate: 0.62, blur: 0.9, bottomMin: 110, bottomRange: 36 },
];

function getSeedDepth(id) {
    const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return n % 3;
}

const SC = '#3A7020'; // stem
const LC = '#4A8830'; // leaf
const RC = '#7A5830'; // root
const cx = { transformBox: 'fill-box', transformOrigin: 'center' };

// Wraps children in motion.g with lifecycle animation when growing,
// or a plain <g> (fully visible, no framer overhead) when static.
function Stage({ growing, initial, animate, transition, style, children }) {
    if (growing) {
        return (
            <motion.g style={{ ...cx, ...style }} initial={initial} animate={animate} transition={transition}>
                {children}
            </motion.g>
        );
    }
    return <g>{children}</g>;
}

function SeedSVG({ type, glowing, growing = false, flowerColor = '#F5C030' }) {
    const glow = glowing
        ? `drop-shadow(0 0 6px ${flowerColor}cc) drop-shadow(0 0 18px ${flowerColor}55)`
        : `drop-shadow(0 0 3px ${flowerColor}44)`;

    const T = (dur, delay, ease = 'easeOut') => ({ duration: dur, delay, ease });

    const stemProps = growing
        ? { initial: { pathLength: 0 }, animate: { pathLength: 1 } }
        : {};

    if (type === 'sunflower') return (
        <svg width="44" height="78" viewBox="-22 -76 44 78" style={{ filter: glow }} overflow="visible">
            <ellipse cx="0" cy="1" rx="5" ry="1.5" fill="rgba(0,0,0,0.30)" style={{ filter: 'blur(2px)' }} />
            {/* Roots — only drawn during grow lifecycle */}
            {growing && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T(0.4, 0)}>
                    <motion.path d="M0,0 C0,7 0,15 0,22"      fill="none" stroke={RC} strokeWidth="1.1" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.38, 0.06)} />
                    <motion.path d="M0,9 C-5,12 -8,17 -10,21" fill="none" stroke={RC} strokeWidth="0.70" strokeLinecap="round" opacity="0.7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.32, 0.16)} />
                    <motion.path d="M0,13 C5,16 9,21 11,24"   fill="none" stroke={RC} strokeWidth="0.60" strokeLinecap="round" opacity="0.55" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.28, 0.24)} />
                </motion.g>
            )}
            {/* Stem */}
            {growing ? (
                <motion.path d="M0,0 C0,-20 0,-42 0,-58" fill="none" stroke={SC} strokeWidth="2.4" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.65, 0.28)} />
            ) : (
                <path d="M0,0 C0,-20 0,-42 0,-58" fill="none" stroke={SC} strokeWidth="2.4" strokeLinecap="round" />
            )}
            {/* Leaves */}
            <Stage growing={growing} initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.45, 0.75, [0.22,1,0.36,1])}>
                <path d="M0,-24 C-10,-22 -14,-14 -9,-10 C-5,-9 0,-16 0,-24" fill={LC} />
                <path d="M0,-24 L-8,-11" fill="none" stroke="rgba(0,60,0,0.25)" strokeWidth="0.7" />
                <path d="M0,-38 C10,-36 14,-28 9,-24 C5,-23 0,-30 0,-38" fill={LC} />
                <path d="M0,-38 L8,-25" fill="none" stroke="rgba(0,60,0,0.25)" strokeWidth="0.7" />
            </Stage>
            {/* Flower */}
            <Stage growing={growing} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.55, 1.15, [0.22,1,0.36,1])}>
                {[0,45,90,135,180,225,270,315].map(a => (
                    <ellipse key={`o${a}`} cx="0" cy="-67" rx="4" ry="9" fill={flowerColor} opacity="0.92" transform={`rotate(${a}, 0, -58)`} />
                ))}
                {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map(a => (
                    <ellipse key={`i${a}`} cx="0" cy="-64" rx="3.2" ry="6.5" fill={flowerColor} opacity="0.68" transform={`rotate(${a}, 0, -58)`} />
                ))}
                <circle cx="0" cy="-58" r="9.5" fill="#3C1E06" />
                <circle cx="0" cy="-58" r="7.5" fill="#281404" />
                <circle cx="0" cy="-58" r="5"   fill="#1E0E02" />
                {[-3,0,3].map(x => [-61,-58,-55].map(y => (
                    <circle key={`${x}${y}`} cx={x} cy={y} r="0.9" fill="#9A5018" opacity="0.65" />
                )))}
            </Stage>
        </svg>
    );

    if (type === 'tulip') return (
        <svg width="32" height="72" viewBox="-16 -70 32 72" style={{ filter: glow }} overflow="visible">
            <ellipse cx="0" cy="1" rx="4" ry="1.2" fill="rgba(0,0,0,0.28)" style={{ filter: 'blur(1.5px)' }} />
            {growing && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T(0.4, 0)}>
                    <motion.path d="M0,0 C0,6 0,13 0,18"     fill="none" stroke={RC} strokeWidth="1.0" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.36, 0.06)} />
                    <motion.path d="M0,8 C-4,10 -7,14 -8,17" fill="none" stroke={RC} strokeWidth="0.65" strokeLinecap="round" opacity="0.65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.30, 0.16)} />
                    <motion.path d="M0,11 C4,13 7,17 8,20"   fill="none" stroke={RC} strokeWidth="0.60" strokeLinecap="round" opacity="0.50" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.26, 0.23)} />
                </motion.g>
            )}
            {growing ? (
                <motion.path d="M0,0 C1,-16 1,-34 0,-48" fill="none" stroke={SC} strokeWidth="1.9" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.65, 0.28)} />
            ) : (
                <path d="M0,0 C1,-16 1,-34 0,-48" fill="none" stroke={SC} strokeWidth="1.9" strokeLinecap="round" />
            )}
            <Stage growing={growing} initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.45, 0.75, [0.22,1,0.36,1])}>
                <path d="M0,-14 C-9,-12 -13,-6 -9,-2 C-5,-1 0,-8 0,-14" fill={LC} />
                <path d="M0,-14 L-8,-4" fill="none" stroke="rgba(0,60,0,0.20)" strokeWidth="0.7" />
                <path d="M0,-28 C9,-26 13,-20 9,-16 C5,-15 0,-22 0,-28" fill={LC} />
                <path d="M0,-28 L8,-17" fill="none" stroke="rgba(0,60,0,0.20)" strokeWidth="0.7" />
            </Stage>
            <Stage growing={growing} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.55, 1.15, [0.22,1,0.36,1])}>
                <path d="M0,-48 C-8,-50 -10,-60 -6,-66 C-3,-70 0,-66 0,-58 Z" fill={flowerColor} opacity="0.68" />
                <path d="M0,-48 C8,-50 10,-60 6,-66 C3,-70 0,-66 0,-58 Z"  fill={flowerColor} opacity="0.68" />
                <path d="M0,-48 C-5,-54 -5,-64 0,-68 C5,-64 5,-54 0,-48 Z" fill={flowerColor} opacity="0.96" />
                <path d="M0,-52 C0,-58 0,-64 0,-68"    fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" strokeLinecap="round" />
                <path d="M-1,-53 C-2,-59 -2,-64 -1,-67" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" strokeLinecap="round" />
                <path d="M 1,-53 C 2,-59  2,-64  1,-67" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" strokeLinecap="round" />
                <path d="M0,-52 C-3,-56 -3,-62 0,-66 C3,-62 3,-56 0,-52 Z" fill="rgba(255,255,255,0.10)" />
            </Stage>
        </svg>
    );

    if (type === 'daisy') return (
        <svg width="34" height="64" viewBox="-17 -62 34 64" style={{ filter: glow }} overflow="visible">
            <ellipse cx="0" cy="1" rx="4" ry="1.2" fill="rgba(0,0,0,0.25)" style={{ filter: 'blur(1.5px)' }} />
            {growing && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T(0.4, 0)}>
                    <motion.path d="M0,0 C0,5 0,12 0,17"   fill="none" stroke={RC} strokeWidth="0.9" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.34, 0.06)} />
                    <motion.path d="M0,7 C-3,9 -6,13 -7,16" fill="none" stroke={RC} strokeWidth="0.60" strokeLinecap="round" opacity="0.65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.28, 0.16)} />
                    <motion.path d="M0,10 C3,12 6,16 7,19"  fill="none" stroke={RC} strokeWidth="0.55" strokeLinecap="round" opacity="0.50" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.24, 0.23)} />
                </motion.g>
            )}
            {growing ? (
                <motion.path d="M0,0 C1,-16 2,-32 1,-48" fill="none" stroke={SC} strokeWidth="1.3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.65, 0.28)} />
            ) : (
                <path d="M0,0 C1,-16 2,-32 1,-48" fill="none" stroke={SC} strokeWidth="1.3" strokeLinecap="round" />
            )}
            <Stage growing={growing} initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.45, 0.75, [0.22,1,0.36,1])}>
                <path d="M0,-18 C-7,-16 -10,-10 -7,-7 C-4,-6 0,-12 0,-18" fill={LC} opacity="0.85" />
                <path d="M1,-32 C7,-30 9,-24 7,-21 C4,-20 1,-25 1,-32"    fill={LC} opacity="0.80" />
            </Stage>
            <Stage growing={growing} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.55, 1.15, [0.22,1,0.36,1])}>
                {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
                    <ellipse key={a} cx="0" cy="-55" rx="2.2" ry="7" fill={flowerColor} opacity="0.92" transform={`rotate(${a}, 0, -48)`} />
                ))}
                <circle cx="0" cy="-48" r="6"   fill="#F2B818" />
                <circle cx="0" cy="-48" r="4.5" fill="#E8A010" />
                <circle cx="0" cy="-48" r="3"   fill="#D49008" />
                <circle cx="0" cy="-48" r="1.5" fill="#C08008" />
            </Stage>
        </svg>
    );

    // poppy
    return (
        <svg width="40" height="68" viewBox="-20 -66 40 68" style={{ filter: glow }} overflow="visible">
            <ellipse cx="0" cy="1" rx="4.5" ry="1.3" fill="rgba(0,0,0,0.28)" style={{ filter: 'blur(1.8px)' }} />
            {growing && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T(0.4, 0)}>
                    <motion.path d="M0,0 C1,7 1,14 0,20"     fill="none" stroke={RC} strokeWidth="1.0" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.36, 0.06)} />
                    <motion.path d="M0,9 C-4,11 -8,16 -9,19" fill="none" stroke={RC} strokeWidth="0.65" strokeLinecap="round" opacity="0.65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.30, 0.16)} />
                    <motion.path d="M0,13 C5,16 8,20 9,23"   fill="none" stroke={RC} strokeWidth="0.60" strokeLinecap="round" opacity="0.50" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.26, 0.23)} />
                </motion.g>
            )}
            {growing ? (
                <motion.path d="M0,0 C2,-16 5,-30 4,-44 C3,-52 0,-54 0,-56" fill="none" stroke={SC} strokeWidth="1.6" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={T(0.65, 0.28)} />
            ) : (
                <path d="M0,0 C2,-16 5,-30 4,-44 C3,-52 0,-54 0,-56" fill="none" stroke={SC} strokeWidth="1.6" strokeLinecap="round" />
            )}
            <Stage growing={growing} initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.45, 0.75, [0.22,1,0.36,1])}>
                <path d="M2,-20 C-4,-17 -8,-12 -5,-9 C-2,-8 2,-13 2,-20" fill={LC} opacity="0.82" />
                <path d="M3,-34 C8,-32 10,-27 7,-25 C4,-24 3,-29 3,-34"  fill={LC} opacity="0.70" />
            </Stage>
            <Stage growing={growing} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T(0.55, 1.15, [0.22,1,0.36,1])}>
                {[0,90,180,270].map(a => (
                    <ellipse key={a} cx="0" cy="-63" rx="9" ry="11" fill={flowerColor}
                        opacity={a === 90 || a === 270 ? 0.75 : 0.90}
                        transform={`rotate(${a}, 0, -56)`} />
                ))}
                <path d="M0,-56 C-4,-60 -6,-64 -5,-66" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeLinecap="round" />
                <path d="M0,-56 C 4,-60  6,-64  5,-66" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeLinecap="round" />
                <circle cx="0" cy="-56" r="5.5" fill="#0A0416" />
                <circle cx="0" cy="-56" r="4"   fill="#060210" />
                {[0,45,90,135,180,225,270,315].map((a, i) => {
                    const rad = a * Math.PI / 180;
                    return <circle key={i} cx={(Math.sin(rad) * 3.8).toFixed(2)} cy={(-56 + Math.cos(rad) * 3.8).toFixed(2)} r="0.65" fill="#F0E040" opacity="0.90" />;
                })}
                <circle cx="0" cy="-56" r="1.5" fill="#406020" opacity="0.95" />
            </Stage>
        </svg>
    );
}

function ForestSeed({ seed, isNew }) {
    const charSum = seed.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const depth   = getSeedDepth(seed.id);
    const dc      = DEPTH[depth];

    const flowerColor = getSeedFlowerColor(seed.id, seed.leaf_type);
    const bottomPx    = dc.bottomMin + ((charSum * 7) % dc.bottomRange);
    const swayDur     = 3.2 + (charSum % 6) * 0.4;
    const swayScale   = { sunflower: 0.7, tulip: 0.5, daisy: 1.1, poppy: 0.9 }[seed.leaf_type] ?? 1.0;
    const swayDeg     = (1.2 + (charSum % 3) * 0.8) * (1 - depth * 0.28) * swayScale;
    const swayDelay   = (charSum % 8) * 0.35 + (isNew ? 1.8 : 0);

    return (
        <div
            className="absolute"
            style={{
                left: `${seed.position_x}%`,
                bottom: `${bottomPx}px`,
                transform: `translateX(-50%) scale(${dc.scale})`,
                transformOrigin: 'bottom center',
                opacity: dc.opacity,
                filter: `brightness(${dc.brightness}) saturate(${dc.saturate}) blur(${dc.blur}px)`,
            }}
        >
            <motion.div
                style={{ transformOrigin: 'bottom center' }}
                animate={{ rotate: [0, swayDeg, 0, -swayDeg, 0] }}
                transition={{ duration: swayDur, repeat: Infinity, ease: 'easeInOut', delay: swayDelay }}
            >
                <div
                    className="group relative flex flex-col items-center"
                    style={{ pointerEvents: depth === 0 ? 'auto' : 'none', cursor: 'default' }}
                >
                    {depth === 0 && (
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                            <p className="text-[11px] tracking-[0.12em] uppercase font-ui font-medium text-foreground/85 bg-background/95 border border-white/15 px-2.5 py-1 rounded-sm">
                                {seed.name}
                            </p>
                        </div>
                    )}
                    <SeedSVG
                        type={seed.leaf_type}
                        glowing={isNew && depth === 0}
                        growing={isNew}
                        flowerColor={flowerColor}
                    />
                </div>
            </motion.div>
        </div>
    );
}

function SeedBed({ seeds, newSeed, frontY, midY, backY }) {
    const displaySeeds = seeds.slice(0, 48);
    const backSeeds  = displaySeeds.filter(s => getSeedDepth(s.id) === 2);
    const midSeeds   = displaySeeds.filter(s => getSeedDepth(s.id) === 1);
    const frontSeeds = displaySeeds.filter(s => getSeedDepth(s.id) === 0);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {[
                { group: backSeeds,  y: backY  },
                { group: midSeeds,   y: midY   },
                { group: frontSeeds, y: frontY },
            ].map(({ group, y }, i) => (
                <motion.div key={i} style={{ y, zIndex: i + 1 }} className="absolute inset-0">
                    {group.map(seed => (
                        <ForestSeed key={seed.id} seed={seed} isNew={newSeed?.id === seed.id} />
                    ))}
                </motion.div>
            ))}

            <AnimatePresence>
                {seeds.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.3em] uppercase text-foreground/35 font-ui font-medium pointer-events-none"
                        style={{ zIndex: 1, paddingBottom: '50px' }}
                    >
                        Your forest awaits
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Soil fill */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{ zIndex: 10, height: '44px', background: 'linear-gradient(to top, hsl(18,30%,5%) 0%, hsl(18,26%,7%) 50%, transparent 100%)' }} />
            {/* Soil seam */}
            <div className="absolute left-0 right-0 pointer-events-none"
                style={{ zIndex: 11, bottom: '43px', height: '1.5px',
                    background: 'linear-gradient(to right, transparent 0%, rgba(100,70,35,0.35) 10%, rgba(160,120,60,0.70) 50%, rgba(100,70,35,0.35) 90%, transparent 100%)',
                    filter: 'blur(0.5px)' }} />
            {/* Side fades */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 12, background: 'linear-gradient(to right, hsl(var(--background)) 0%, transparent 8%, transparent 92%, hsl(var(--background)) 100%)' }} />
        </div>
    );
}

export default function PlantYourSeed() {
    const sectionRef = useRef(null);
    const { data: settings } = useSiteSettings();
    const [name, setName]       = useState('');
    const [planted, setPlanted] = useState(false);
    const [seeds, setSeeds]     = useState([]);
    const [newSeed, setNewSeed] = useState(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const frontY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
    const midY   = useTransform(scrollYProgress, [0, 1], ['0%', '-4.5%']);
    const backY  = useTransform(scrollYProgress, [0, 1], ['0%', '-1.5%']);

    useEffect(() => {
        const saved = localStorage.getItem('soil_seeds');
        if (saved) { try { setSeeds(JSON.parse(saved)); } catch {} }
    }, []);

    const handlePlant = () => {
        if (!name.trim()) return;
        const seed = {
            id: Date.now().toString(),
            name: name.trim(),
            leaf_type: LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)],
            position_x: 4 + Math.random() * 92,
        };
        const updated = [seed, ...seeds];
        setSeeds(updated);
        localStorage.setItem('soil_seeds', JSON.stringify(updated));
        setNewSeed(seed);
        setPlanted(true);
    };

    const reset = () => { setPlanted(false); setName(''); setNewSeed(null); };

    const successFlowerColor = newSeed
        ? getSeedFlowerColor(newSeed.id, newSeed.leaf_type)
        : '#F5C030';

    return (
        <section ref={sectionRef} className="relative py-8 md:py-12 px-6 border-t border-white/[0.04]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-center">

                    {/* ── LEFT: Interaction ── */}
                    <div className="lg:w-[320px] xl:w-[360px] flex-shrink-0">
                        <ScrollReveal>
                            <p className="text-[11px] tracking-[0.38em] uppercase text-soil-sun mb-3 font-ui font-semibold">
                                ✦ &nbsp; {settings?.seed_eyebrow} &nbsp; ✦
                            </p>
                            <h2 className="font-display text-2xl md:text-3xl tracking-[0.08em] text-foreground mb-3 leading-tight">
                                {settings?.seed_heading}
                            </h2>
                            <p className="font-ui text-[15px] text-foreground/65 leading-relaxed mb-8 max-w-[280px] whitespace-pre-line">
                                {settings?.seed_body}
                            </p>
                        </ScrollReveal>

                        <AnimatePresence mode="wait">
                            {!planted ? (
                                <motion.div key="form"
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }}
                                    className="flex flex-col items-start gap-3"
                                >
                                    <label htmlFor="plant-seed-input" className="sr-only">
                                        Your name, a dream, or an intention
                                    </label>
                                    <input
                                        id="plant-seed-input"
                                        type="text"
                                        placeholder="A name, a dream, an intention…"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handlePlant()}
                                        maxLength={60}
                                        className="w-full bg-white/[0.03] border border-white/30 px-4 py-3 text-[15px] font-ui text-foreground placeholder:text-foreground/60 focus:outline-none focus:border-soil-sun/50 focus-visible:ring-2 focus-visible:ring-soil-sun focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-300 tracking-wide"
                                    />
                                    <div className="flex items-center gap-4">
                                        <button onClick={handlePlant} disabled={!name.trim()}
                                            className="px-8 py-3 border border-soil-sun/50 bg-soil-sun/5 text-[11px] tracking-[0.3em] uppercase font-ui font-semibold text-soil-sun hover:bg-soil-sun/10 hover:border-soil-sun/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-sun focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm">
                                            Plant
                                        </button>
                                        {seeds.length > 0 && (
                                            <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/55 font-ui font-medium">
                                                {seeds.length} {seeds.length === 1 ? 'seed' : 'seeds'}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="success"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex flex-col items-start gap-4"
                                >
                                    <SeedSVG
                                        type={newSeed?.leaf_type || 'daisy'}
                                        glowing
                                        growing
                                        flowerColor={successFlowerColor}
                                    />
                                    <div>
                                        <p className="font-display text-lg md:text-xl text-foreground/80 tracking-wide italic mb-1">
                                            "{newSeed?.name}"
                                        </p>
                                        <p className="text-[11px] tracking-[0.32em] uppercase text-soil-sun font-ui font-semibold">
                                            Planted. It grows with you.
                                        </p>
                                    </div>
                                    <button onClick={reset}
                                        className="text-[11px] tracking-[0.28em] uppercase text-foreground/55 hover:text-foreground/85 font-ui font-medium transition-colors duration-300">
                                        Plant another
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT: Seed bed ── */}
                    <div className="flex-1 relative rounded-sm overflow-hidden" style={{ height: '320px' }}>
                        <SeedBed seeds={seeds} newSeed={newSeed} frontY={frontY} midY={midY} backY={backY} />
                    </div>

                </div>
            </div>
        </section>
    );
}
