import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageTransition from '../components/shared/PageTransition';
import ParticleDust from '../components/soil/ParticleDust';
import SectionDivider from '../components/soil/SectionDivider';
import Footer from '../components/soil/Footer';
import ScrollReveal from '@/components/soil/ScrollReveal';
import PageMeta from '@/components/shared/PageMeta';

const LAYERS = [
    {
        id: '01',
        name: 'SOIL Labs',
        position: 'The Innovation Layer',
        feelings: ['Curiosity', 'Excitement', 'Invention', 'Momentum', 'Purpose'],
        icon: '⬡',
        color: '#2d5a27', // soil-chlorophyll
        desc: 'Where ideas become systems and experiments become products. The innovation arm of SOIL, exploring how technology, AI, and design can be used to build meaningful tools for the future.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/9b0ef27fd_generated_505071e9.png'
    },
    {
        id: '02',
        name: 'Soilnomics',
        position: 'The Economic Layer',
        feelings: ['Possibility', 'Structure', 'Empowerment', 'Sustainability', 'Pragmatism'],
        color: '#c5a059', // accent
        desc: 'Exploring how value is created, circulated, and sustained. The SOIL layer concerned with enterprise, economic participation, ownership, and building durable systems of prosperity.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png'
    },
    {
        id: '03',
        name: 'SOIL Foundation',
        position: 'The Social Layer',
        feelings: ['Faith', 'Trust', 'Sincerity', 'Love', 'Legacy'],
        color: '#a08763', // warm stone — readable on parchment + dark
        desc: 'The social impact layer of SOIL. Supporting communities, creating access, and contributing to the human side of transformation through initiatives that serve beyond commerce.',
        image: 'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png'
    }
];
export default function Cultivate() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    return (
        <PageTransition>
            <PageMeta
                title="SOIL Ecosystem — The Living Network"
                description="Each layer feeds the others. Culture drives innovation. Innovation funds research. Research strengthens culture. Explore the SOIL Ecosystem."
                canonicalPath="/cultivate"
            />
            <main ref={containerRef} className="bg-background min-h-screen text-foreground selection:bg-accent/30 overflow-hidden">
                <div className='relative z-20'>
                    <ParticleDust progress={scrollYProgress} count={200} fadeRange={[0, 0.1]} />

                    {/* HERO SECTION */}
                    <motion.section
                        style={{ opacity: heroOpacity }}
                        className="relative h-screen flex items-center justify-center px-4 md:px-6 overflow-hidden"
                    >
                        {/* Atmospheric Background Image */}
                        <motion.div
                            style={{ scale: heroScale }}
                            className="absolute inset-0 z-0"
                        >
                            <img
                                src="https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/9b0ef27fd_generated_505071e9.png"
                                alt="Ecosystem Backdrop"
                                className="w-full h-full object-cover opacity-40 grayscale"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
                        </motion.div>

                        <div className="relative z-10 text-center max-w-5xl">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="text-[11px] md:text-[13px] tracking-[0.45em] uppercase text-accent mb-8 font-ui font-semibold"
                            >
                                The Living Network
                            </motion.p>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="font-display text-5xl md:text-9xl tracking-tighter text-foreground leading-[0.85]"
                            >
                                SOIL <br />
                                <span className="text-accent/90 italic">Ecosystem</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="font-ui text-lg md:text-xl text-foreground/60 mt-12 max-w-2xl mx-auto leading-relaxed"
                            >
                                Each layer feeds the others. Culture drives innovation. Innovation funds research. Research strengthens culture.                            </motion.p>
                        </div>

                        {/* Scroll Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                        >
                            <div className="w-[1px] h-12 bg-gradient-to-b from-accent/40 to-transparent" />
                            <p className="text-[11px] tracking-[0.35em] uppercase text-accent/70 font-ui font-medium">Scroll to Explore</p>
                        </motion.div>
                    </motion.section>

                    <SectionDivider label="Layers of SOIL" />
                    <section className='py-16 md:py-60 px-4 md:px-6'>
                        <div className="max-w-5xl mx-auto">
                            {LAYERS.map((layer, index) => (
                                <div key={layer.id} className='relative mb-20 md:mb-80 last:mb-0'>
                                    {/* Vertical Tether Line */}
                                    {index !== LAYERS.length - 1 && (
                                        <div className='absolute left-0 md:left-1/2 top-20 bottom-[-80px] md:bottom-[-320px] w-px bg-gradient-to-b from-accent/20 to-transparent pointer-events-none' />
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 items-start">
                                        <ScrollReveal>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className='relative aspect-[4/3] md:aspect-[4/5] overflow-hidden group shadow-2xl shadow-black/50'
                                            >
                                                <div className='absolute inset-0 z-10 opacity-20 group-hover:opacity-10 transition-opacity duration-1000'
                                                    style={{ backgroundColor: layer.color }}
                                                />
                                                <motion.img
                                                    src={layer.image}
                                                    alt={layer.name}
                                                    loading="lazy"
                                                    style={{
                                                        scale: 1.2,
                                                        y: useTransform(scrollYProgress, [0, 1], [-50, 50])
                                                    }}
                                                    className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0"
                                                />
                                                {/* Floating Index Number */}
                                                <motion.span
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                                                    className='absolute top-8 left-8 z-20 font-display text-4xl text-foreground/40 group-hover:text-accent transition-colors duration-500'
                                                >
                                                    {layer.id}
                                                </motion.span>
                                            </motion.div>

                                        </ScrollReveal>
                                        {/* Content Side */}
                                        <div className='pt-6 md:pt-20'>
                                            <ScrollReveal delay={0.2}>
                                                <p className="text-[11px] tracking-[0.35em] uppercase mb-3 font-ui font-semibold" style={{ color: layer.color }}>
                                                    {layer.position}
                                                </p>

                                                <h2 className="font-display text-4xl md:text-8xl tracking-tighter text-foreground mb-6 md:mb-10 leading-none">
                                                    {layer.name}
                                                </h2>

                                                <div className='flex gap-2 md:gap-4 mb-6 md:mb-12 flex-wrap'>
                                                    {layer.feelings?.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 md:px-3 py-1 border border-foreground/15 text-[10px] tracking-[0.2em] uppercase text-foreground/65 font-ui font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}

                                                </div>
                                                <p className="font-ui text-base md:text-2xl text-foreground/70 leading-relaxed max-w-lg">
                                                    {layer.desc}
                                                </p>
                                                <div className="mt-7 md:mt-10">
                                                    <motion.div
                                                        whileHover={{ scale: 1.01 }}
                                                        className="inline-block px-8 py-4 border border-accent/30 text-sm tracking-[0.2em] uppercase text-foreground/65 font-ui font-medium hover:text-foreground hover:border-foreground/40 transition-colors duration-500 rounded-sm"
                                                    >
                                                        Coming Soon
                                                    </motion.div>
                                                </div>
                                            </ScrollReveal>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="py-20 md:py-60 px-4 md:px-6 text-center">
                        <ScrollReveal>
                            <div className="inline-block px-4 py-1 border border-accent/20 bg-accent/[0.02] mb-12">
                                <p className="text-[11px] tracking-[0.4em] uppercase text-accent font-ui font-semibold">
                                    Participate
                                </p>
                            </div>

                            <h2 className="font-display text-4xl md:text-7xl tracking-tighter text-foreground mb-12">
                                The soil is ready. <br />
                                <span className="text-accent italic">Will you plant?</span>
                            </h2>

                            <div className="w-px h-24 bg-gradient-to-b from-accent/30 to-transparent mx-auto mb-16" />

                            <p className="font-ui text-xl md:text-2xl text-foreground/40 max-w-2xl mx-auto italic">
                                "Transformation is not an event, but a process of cultivation. Join us as we build the infrastructure for the next thousand years."
                            </p>
                        </ScrollReveal>
                    </section>

                    <Footer />

                </div>
            </main>
        </PageTransition>
    );
}
