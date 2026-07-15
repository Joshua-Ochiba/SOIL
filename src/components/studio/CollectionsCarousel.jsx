import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const COLLECTIONS = [
    {
        id: '01',
        title: 'SOIL Artifacts',
        sub: 'The Visual Language',
        desc: 'Archival prints and original works. Documents of a living visual language — limited, signed, and made to endure.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png',
    },
    {
        id: '02',
        title: 'SOIL Attire',
        sub: 'Worn With Purpose',
        desc: 'Heavyweight garments built to last a generation. Rooted in culture, worn with intention, designed for those who move with purpose.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png',
    },
    {
        id: '03',
        title: 'SOIL Collectibles',
        sub: 'Objects That Carry Meaning',
        desc: 'Handmade, limited, and intentional. Each piece is unique — shaped by hand, fired at high temperature, made to be kept.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/9b0ef27fd_generated_505071e9.png',
    },
    {
        id: '04',
        title: 'SOIL Spaces',
        sub: 'Environments That Foster Growth',
        desc: 'Physical and digital environments designed for indigenous culture to thrive. Where community gathers and ideas take root.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png',
    },
];

export default function CollectionsCarousel() {
    const [active, setActive] = useState(0);
    const [cardOffset, setCardOffset] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 310
    );
    const total = COLLECTIONS.length;

    // Keep offset in sync with window width
    useEffect(() => {
        const update = () => setCardOffset(window.innerWidth < 768 ? 200 : 310);
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const goNext = () => setActive(i => (i + 1) % total);
    const goPrev = () => setActive(i => (i - 1 + total) % total);

    const getOffset = (i) => {
        let offset = i - active;
        if (offset > total / 2)  offset -= total;
        if (offset < -total / 2) offset += total;
        return offset;
    };

    const handleDragEnd = (_, info) => {
        if (info.offset.x < -60) goNext();
        else if (info.offset.x > 60) goPrev();
    };

    return (
        <section className="py-20 md:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <p className="text-[9px] tracking-[0.5em] uppercase text-accent/50 font-ui mb-3">
                            {String(active + 1).padStart(2, '0')} &nbsp;/&nbsp; {String(total).padStart(2, '0')}
                        </p>
                        <div className="overflow-hidden">
                            <motion.h2
                                key={active}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="font-display text-4xl md:text-6xl tracking-tight text-foreground leading-[0.9]"
                            >
                                {COLLECTIONS[active].title}
                            </motion.h2>
                        </div>
                        <motion.p
                            key={`sub-${active}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="font-ui text-xs tracking-[0.25em] uppercase text-muted-foreground dark:text-foreground/35 mt-2"
                        >
                            {COLLECTIONS[active].sub}
                        </motion.p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={goPrev}
                            className="w-11 h-11 rounded-xl border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-accent/40 hover:text-accent transition-all duration-300">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={goNext}
                            className="w-11 h-11 rounded-xl border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-accent/40 hover:text-accent transition-all duration-300">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 3D coverflow stage */}
                <motion.div
                    className="relative flex items-center justify-center h-[340px] md:h-[520px] cursor-grab active:cursor-grabbing select-none"
                    style={{ perspective: '1400px', touchAction: 'none' }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                >
                    {COLLECTIONS.map((cat, i) => {
                        const offset   = getOffset(i);
                        const abs      = Math.abs(offset);
                        const isActive = offset === 0;
                        const isEdge   = abs === 1;

                        return (
                            <motion.div
                                key={cat.id}
                                animate={{
                                    x:       offset * cardOffset,
                                    rotateY: offset * -42,
                                    scale:   isActive ? 1 : isEdge ? 0.76 : 0.58,
                                    z:       isActive ? 0 : isEdge ? -160 : -300,
                                    opacity: isActive ? 1 : isEdge ? 0.55 : 0,
                                }}
                                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                onClick={() => !isActive && setActive(i)}
                                style={{
                                    position:       'absolute',
                                    transformStyle: 'preserve-3d',
                                    zIndex:         isActive ? 10 : 5 - abs,
                                    cursor:         isActive ? 'default' : 'pointer',
                                    pointerEvents:  abs > 1 ? 'none' : 'auto',
                                }}
                                className="w-[200px] md:w-[320px] aspect-[3/4] overflow-hidden rounded-2xl"
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover"
                                    style={{ filter: isActive ? 'grayscale(0%)' : 'grayscale(75%)' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                {isActive && (
                                    <motion.div
                                        key={`desc-${active}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="absolute bottom-0 left-0 right-0 p-5 md:p-7"
                                    >
                                        <p className="font-ui text-[11px] md:text-xs text-white/75 leading-relaxed">
                                            {cat.desc}
                                        </p>
                                        <div className="mt-4 w-8 h-[1px] bg-accent/50" />
                                    </motion.div>
                                )}

                                {isEdge && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-[9px] tracking-[0.3em] uppercase font-ui text-white/50">View</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Description + dots */}
                <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <motion.p
                        key={`fulldesc-${active}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-ui text-sm text-muted-foreground dark:text-foreground/35 max-w-md leading-relaxed"
                    >
                        {COLLECTIONS[active].desc}
                    </motion.p>

                    <div className="flex items-center gap-2">
                        {COLLECTIONS.map((_, i) => (
                            <button key={i} onClick={() => setActive(i)}
                                className={`rounded-full transition-all duration-400 ${
                                    i === active
                                        ? 'w-7 h-1.5 bg-accent'
                                        : 'w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40'
                                }`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
