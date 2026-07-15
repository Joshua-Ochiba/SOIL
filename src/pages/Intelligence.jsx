import PageTransition from "@/components/shared/PageTransition";
import GrainOverlay from '@/components/soil/GrainOverlay';
import Footer from '@/components/soil/Footer';
import ScrollReveal from '@/components/soil/ScrollReveal';
import SectionDivider from '@/components/soil/SectionDivider';
import { useScroll, useTransform, motion } from 'framer-motion';
import ParticleDust from '@/components/soil/ParticleDust';
import { useRef, useEffect } from "react";
import useUIStore from '@/store/uiStore';
import PageMeta from '@/components/shared/PageMeta';

const SERVICES = [
    {
        num: '01',
        title: 'AI Strategic Systems',
        desc: 'Designing intelligent systems that help organisations think clearer, decide faster, and build with purpose.',
    },
    {
        num: '02',
        title: 'Consulting & Advisory',
        desc: 'Strategic guidance rooted in systems thinking — helping you see the whole picture and act with precision.',
    },
    {
        num: '03',
        title: 'Enterprise Solutions',
        desc: 'Custom-built technology solutions that solve real problems and create lasting structural advantage.',
    },
    {
        num: '04',
        title: 'Research & Intelligence',
        desc: 'Deep research that turns complexity into clarity — insights that drive transformation, not just information.',
    },
];

export default function Intelligence() {
    const { openContact } = useUIStore();
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

    return (
        <PageTransition>
            <PageMeta
                title="SOIL Intelligence — The Neural Layer"
                description="Helping organisations unlock clarity, capability, and transformation through AI, systems thinking, and strategic execution. Intelligence is not just data — it is discernment."
                canonicalPath="/intelligence"
            />
            <main
                ref={containerRef}
                className="relative bg-background
                 overflow-x-hidden "
            >
                {/* Fixed Background Layers */}
                <div className='fixed inset-0 z-0'>
                    <div className='absolute inset-0 bg-background' />

                    {/* ── LIGHT-MODE MATERIAL ATMOSPHERE (no particles) ──────────
                        Depth comes from the surface itself: uneven hand-made paper
                        tone, a settled darker base, soft edge-darkening like an aged
                        leaf, and a whisper of fibre felt more than seen. */}
                    <div className='absolute inset-0 dark:hidden pointer-events-none'>
                        {/* Tonal paper — warm illumination above, cooler settling below.
                            Breathes via TRANSFORM (composited) so scroll stays smooth. */}
                        <div
                            className='absolute inset-0 archive-breathe'
                            style={{
                                background:
                                    'radial-gradient(115% 80% at 50% -12%, hsl(42 50% 96% / 0.7), transparent 55%),' +
                                    'radial-gradient(120% 95% at 50% 120%, hsl(28 28% 62% / 0.24), transparent 60%)',
                            }}
                        />
                        {/* Edge settling — baked radial vignette (replaces the expensive
                            blurred inset box-shadow that was repainting on every scroll). */}
                        <div
                            className='absolute inset-0'
                            style={{ background: 'radial-gradient(135% 115% at 50% 48%, transparent 58%, hsl(30 30% 44% / 0.18))' }}
                        />
                        {/* Fibre — barely-there paper grain. */}
                        <div className='absolute inset-0 archive-grain opacity-[0.04]' />
                    </div>
                </div>

                {/*Cinematic Overlays */}
                <div className="fixed inset-0 z-10 pointer-events-none mix-blend-overlay opacity-30">
                    <GrainOverlay />
                </div>

                {/*Content Layer*/}
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
                                src="https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png"
                                alt="Intelligence Backdrop"
                                className="w-full h-full object-cover opacity-20 dark:opacity-45"
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
                                The Neural Layer
                            </motion.p>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="font-display text-5xl md:text-9xl tracking-tighter text-foreground leading-[0.85]"
                            >
                                SOIL <br />
                                <span className="text-accent/90 italic">Intelligence</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="font-ui text-lg md:text-xl text-muted-foreground dark:text-foreground/70 mt-12 max-w-2xl mx-auto leading-relaxed"
                            >
                                Helping organisations unlock clarity, capability, and transformation through AI, systems thinking, and strategic execution.
                            </motion.p>
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

                    <section className="py-16 px-6">
                        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8">
                            {['Trust', 'Clarity', 'Professionalism', 'Intelligence', 'Sophistication', 'Grace'].map((word, i) => (
                                <ScrollReveal key={word} delay={i * 0.08}>
                                    <span className="font-ui text-sm tracking-[0.28em] uppercase text-muted-foreground dark:text-foreground/55 hover:text-accent transition-colors duration-700 font-medium">
                                        {word}
                                    </span>
                                </ScrollReveal>
                            ))}
                        </div>
                    </section>

                    <SectionDivider label="Our Capabilities" />

                    <section className="py-16 md:py-40 px-4 md:px-6">
                        <div className="max-w-6xl mx-auto">
                            {/* Light: separated parchment leaves with bronze rules.
                                Dark: original hairline grid (preserved via dark: overrides). */}
                            <div className="grid md:grid-cols-2 gap-5 md:gap-6 dark:gap-px
                            bg-transparent dark:bg-foreground/5 dark:border dark:border-foreground/5">
                                {SERVICES.map((service, index) => (
                                    <div
                                        key={service.num}
                                        className="group relative overflow-hidden transition-all duration-700
                                        bg-card dark:bg-background
                                        border border-accent/30 dark:border-transparent
                                        rounded-sm dark:rounded-none
                                        p-9 md:p-14 dark:p-6 dark:md:p-16
                                        shadow-[0_2px_14px_-10px_hsl(30_35%_22%/0.22)] dark:shadow-none
                                        hover:border-accent/45 hover:bg-card dark:hover:bg-foreground/[0.02]
                                        hover:shadow-[0_12px_36px_-14px_hsl(34_50%_22%/0.42)] dark:hover:shadow-none"
                                    >
                                        <ScrollReveal delay={index * 0.1}>
                                            {/* DARK: original faint inline numeral */}
                                            <p className="hidden dark:block font-display text-5xl md:text-6xl text-accent/5
                                            group-hover:text-accent/15 transition-colors duration-700 mb-8">
                                                {service.num}
                                            </p>

                                            {/* LIGHT: oversized engraved watermark numeral (archival marker) */}
                                            <span
                                                aria-hidden="true"
                                                className="dark:hidden absolute -top-6 right-1 md:right-3 font-display
                                                text-[7rem] md:text-[10rem] leading-none text-accent/[0.16]
                                                group-hover:text-accent/25 transition-colors duration-700 select-none pointer-events-none"
                                                style={{ textShadow: '0 1px 0 hsl(40 45% 98% / 0.7)' }}
                                            >
                                                {service.num}
                                            </span>

                                            {/* LIGHT: manuscript-style index label */}
                                            <p className="dark:hidden relative font-ui text-[10px] tracking-[0.45em] uppercase text-accent/80 mb-6">
                                                Nº {service.num}
                                            </p>

                                            {/* Content */}
                                            <h3 className="relative font-display text-2xl md:text-4xl tracking-tight text-foreground mb-4 md:mb-6">
                                                {service.title}
                                            </h3>

                                            <p className="relative font-ui text-base md:text-lg text-muted-foreground dark:text-foreground/60
                                            leading-relaxed max-w-sm">
                                                {service.desc}
                                            </p>

                                            {/* Bronze underline that draws on hover */}
                                            <div className="absolute bottom-0 left-0 h-[2px] dark:h-[1px] bg-accent/50 dark:bg-accent/40
                                            scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left w-full" />
                                        </ScrollReveal>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <SectionDivider label="Philosophy" />

                    <section className="relative py-20 md:py-60 px-4 md:px-6 overflow-hidden">
                        {/* Subtle Background Atmosphere */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <ScrollReveal>
                                <p className="text-[11px] md:text-[13px] tracking-[0.35em] uppercase text-accent mb-12 font-ui font-semibold">
                                    The SOIL Axiom
                                </p>

                                <h2 className="font-display text-3xl md:text-6xl lg:text-7xl tracking-[0.1rem] text-foreground leading-[1.1] mb-8 md:mb-16">
                                    Intelligence is not just data. <br />
                                    <span className="text-accent italic">It is discernment.</span>
                                </h2>
                            </ScrollReveal>

                            <div className="w-px h-24 bg-gradient-to-b from-accent/30 to-transparent mx-auto mb-16" />

                            <ScrollReveal delay={0.3}>
                                <p className="font-ui text-xl md:text-2xl text-muted-foreground dark:text-foreground/50 leading-relaxed max-w-2xl mx-auto italic">
                                    "We believe that the most powerful systems are those that respect indigenous memory while leveraging frontier technology. This is the SOIL approach to intelligence."
                                </p>
                            </ScrollReveal>
                        </div>
                    </section>

                    <section className="py-16 md:py-32 px-4 md:px-6 text-center">
                        <ScrollReveal>
                            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-8 font-ui">
                                Ready to begin?
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl tracking-[0.08em] text-foreground">
                                Let's cultivate clarity.
                            </h2>
                            <motion.button
                                onClick={openContact}
                                data-hover
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-12 px-12 py-5 border border-accent/40 text-accent text-sm tracking-[0.2em] uppercase font-ui hover:bg-accent/10 transition-colors duration-500 rounded-xl"
                            >
                                Begin a Conversation
                            </motion.button>
                        </ScrollReveal>
                    </section>
                    <Footer />


                </div>

            </main>
        </PageTransition>
    )
}