// src/pages/Studio.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import PageTransition from '../components/shared/PageTransition';
import GrainOverlay from '@/components/soil/GrainOverlay';
import Footer from '@/components/soil/Footer';
import ScrollReveal from '@/components/soil/ScrollReveal';
import SectionDivider from '@/components/soil/SectionDivider';
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import ParticleDust from '@/components/soil/ParticleDust';
import ProductCard from '@/components/studio/ProductCard';
import CartSidebar from '@/components/studio/CartSidebar';
import CollectionsCarousel from '@/components/studio/CollectionsCarousel';
import StoreControls from '@/components/studio/StoreControls';
import CurrencySwitcher from '@/components/studio/CurrencySwitcher';
import PageMeta from '@/components/shared/PageMeta';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePrice } from '@/hooks/usePrice';

const FILTER_TABS = [
    { id: 'all',         label: 'All' },
    { id: 'attire',      label: 'Attire' },
    { id: 'artifacts',   label: 'Artifacts' },
    { id: 'collectibles',label: 'Collectibles' },
];

const LOW_STOCK = 5; // matches the "Only N Left" badge threshold in ProductCard

export default function Studio() {
    const containerRef = useRef(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [availability, setAvailability] = useState('all');
    const [range, setRange] = useState(null); // [min, max] — set once products load

    const { data: allProducts = [], isLoading: productsLoading } = useProducts();
    const { data: settings } = useSiteSettings();

    // Price bounds derived from the live catalog (rounded outward)
    const priceBounds = useMemo(() => {
        if (!allProducts.length) return [0, 100];
        const prices = allProducts.map(p => p.price);
        return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
    }, [allProducts]);

    // Initialise / re-sync the slider to the catalog bounds when they change
    useEffect(() => {
        setRange(prev => prev == null ? priceBounds : prev);
    }, [priceBounds]);

    const activeRange = range || priceBounds;
    const price = usePrice();

    const isFiltered =
        activeCategory !== 'all' ||
        availability !== 'all' ||
        sortBy !== 'featured' ||
        activeRange[0] > priceBounds[0] ||
        activeRange[1] < priceBounds[1];

    const resetFilters = () => {
        setActiveCategory('all');
        setAvailability('all');
        setSortBy('featured');
        setRange(priceBounds);
    };

    // Single pass: category → price → availability filters, then sort
    const filteredProducts = useMemo(() => {
        let list = allProducts;
        if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
        list = list.filter(p => p.price >= activeRange[0] && p.price <= activeRange[1]);
        if (availability === 'low') {
            list = list.filter(p => p.stockCount != null && p.stockCount > 0 && p.stockCount <= LOW_STOCK);
        }

        const sorted = [...list];
        switch (sortBy) {
            case 'price-asc':  sorted.sort((a, b) => a.price - b.price); break;
            case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
            case 'newest':     sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
            case 'name':       sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'featured':
            default:           sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
        }
        return sorted;
    }, [allProducts, activeCategory, activeRange, availability, sortBy]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    return (
        <PageTransition>
            <PageMeta
                title="SOIL Studio — The Culture Layer"
                description="Wear what you stand for. Culturally rooted, intentionally made — SOIL Attire, Artifacts, and Collectibles. Each piece carries a story that started long before you were born."
                canonicalPath="/studio"
            />
            <main
                ref={containerRef}
                className="relative bg-background
                 overflow-x-hidden min-h-screen"
            >

                {/* Fixed Background Layers */}
                <div className='fixed inset-0 z-0'>
                    <div className='absolute inset-0 bg-background dark:bg-stone-950' />
                </div>

                {/*Cinematic Overlays */}
                <div className="fixed inset-0 z-10 pointer-events-none mix-blend-overlay opacity-30">
                    <GrainOverlay />
                </div>

                {/*Content Layer*/}
                <div className='relative z-20'>
                    <ParticleDust progress={scrollYProgress} count={200} fadeRange={[0, 0.1]} />

                    {/* ── HERO — Editorial split ─────────────────────────── */}
                    <motion.section
                        style={{ opacity: heroOpacity }}
                        className="relative min-h-screen flex items-center overflow-hidden"
                    >
                        {/* Right: full-bleed image panel */}
                        <motion.div
                            style={{ scale: heroScale }}
                            className="absolute right-0 top-0 bottom-0 w-full md:w-[58%] z-0"
                        >
                            <img
                                src="https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png"
                                alt="SOIL Studio"
                                className="w-full h-full object-cover"
                                fetchpriority="high"
                                decoding="async"
                            />
                            {/* Mobile: full-image dark overlay for text legibility */}
                            <div className="absolute inset-0 bg-background/75 dark:bg-stone-950/55 md:hidden" />
                            {/* Desktop: left-to-right blend */}
                            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent dark:from-stone-950 dark:via-stone-950/60 hidden md:block" />
                            {/* Dark vignette top + bottom */}
                            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80 dark:from-stone-950/60 dark:to-stone-950/80" />
                        </motion.div>

                        {/* Left: text content */}
                        <div className="relative z-10 w-full md:w-[52%] px-6 md:px-16 py-32 md:py-0 flex flex-col justify-center">

                            <motion.p
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-[11px] tracking-[0.42em] uppercase text-accent font-ui font-semibold mb-6"
                            >
                                SOIL Studio — The Culture Layer
                            </motion.p>

                            <motion.h1
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                className="font-display text-[clamp(3.5rem,8vw,7rem)] tracking-tighter text-foreground leading-[0.88] mb-8"
                            >
                                Wear What<br />
                                You{' '}
                                <span className="text-accent/90 italic">Stand For.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.9, delay: 0.85 }}
                                className="font-ui text-base text-foreground/60 max-w-sm leading-relaxed mb-10 whitespace-pre-line"
                            >
                                {settings?.studio_hero_body}
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.05 }}
                                className="flex flex-wrap items-center gap-3"
                            >
                                <button
                                    data-hover
                                    onClick={() => document.getElementById('store')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-3.5 rounded-xl bg-accent text-background text-[11px] tracking-[0.28em] uppercase font-ui font-semibold hover:bg-accent/85 transition-all duration-300"
                                >
                                    Shop the Collection
                                </button>
                                <button
                                    data-hover
                                    onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-3.5 rounded-xl border border-foreground/20 text-foreground/75 text-[11px] tracking-[0.28em] uppercase font-ui font-medium hover:border-foreground/40 hover:text-foreground transition-all duration-300"
                                >
                                    Explore Collections
                                </button>
                            </motion.div>
                        </div>

                        {/* Scroll indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
                        >
                            <div className="w-[1px] h-10 bg-gradient-to-b from-accent/40 to-transparent" />
                            <p className="text-[10px] tracking-[0.35em] uppercase text-accent/55 font-ui font-medium">Scroll</p>
                        </motion.div>
                    </motion.section>

                    {/* ── TRUST BAR ──────────────────────────────────────────── */}
                    <div className="relative z-10 border-y border-foreground/[0.05] py-3.5 overflow-hidden bg-foreground/[0.01]">
                        <div
                            className="flex gap-14 whitespace-nowrap"
                            style={{ animation: 'marquee 28s linear infinite' }}
                        >
                            {[
                                'Premium Quality', 'Ships from Lagos', 'Worldwide Delivery',
                                'Limited Editions', 'Handmade in Africa', 'Cultural Artifacts',
                                'Rooted in Purpose', 'Premium Quality', 'Ships from Lagos',
                                'Worldwide Delivery', 'Limited Editions', 'Handmade in Africa',
                                'Cultural Artifacts', 'Rooted in Purpose',
                            ].map((item, i) => (
                                <span key={i} className="flex items-center gap-14 text-[10px] tracking-[0.3em] uppercase text-foreground/50 font-ui font-medium flex-shrink-0">
                                    {item}
                                    <span className="text-accent/30">✦</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <style>{`
                        @keyframes marquee {
                            from { transform: translateX(0); }
                            to   { transform: translateX(-50%); }
                        }
                    `}</style>

                    <div id="collections">
                        <SectionDivider label="Collections" />
                        <CollectionsCarousel />
                    </div>

                    {/* ── THE STORE ─────────────────────────────────────────── */}
                    <SectionDivider label="The Store" />

                    <section id="store" className="py-16 md:py-28 px-4 md:px-6">
                        <div className="max-w-7xl mx-auto">

                            {/* Store Header */}
                            <ScrollReveal>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                                    <div>
                                        <p className="text-[11px] tracking-[0.4em] uppercase text-accent font-ui font-semibold mb-3">SOIL Studio</p>
                                        <h2 className="font-display text-3xl md:text-5xl tracking-tight text-foreground leading-[0.9]">
                                            The Collection
                                        </h2>
                                        <p className="font-ui text-base text-foreground/65 mt-3 max-w-sm leading-relaxed">
                                            Culturally grounded. Modern. Intentional.
                                        </p>
                                    </div>

                                    {/* Category Filters */}
                                    <div className="flex flex-wrap gap-2">
                                        {FILTER_TABS.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveCategory(tab.id)}
                                                className={`px-4 py-2 rounded-xl border text-[10px] tracking-[0.28em] uppercase font-ui font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                                                    activeCategory === tab.id
                                                        ? 'border-accent/60 bg-accent/10 text-accent'
                                                        : 'border-foreground/15 text-foreground/60 hover:border-foreground/35 hover:text-foreground/85'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Filter + sort toolbar */}
                            {!productsLoading && allProducts.length > 0 && (
                                <ScrollReveal>
                                    <div className="mb-10 pb-6 border-b border-foreground/[0.06] flex flex-col gap-5">
                                        <div className="flex justify-end">
                                            <CurrencySwitcher />
                                        </div>
                                        <StoreControls
                                            count={filteredProducts.length}
                                            sortBy={sortBy} setSortBy={setSortBy}
                                            priceBounds={priceBounds} range={activeRange} setRange={setRange}
                                            availability={availability} setAvailability={setAvailability}
                                            formatBound={(n) => price.formatAmount(n)}
                                            isFiltered={isFiltered} onReset={resetFilters}
                                        />
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Product Grid */}
                            {productsLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="aspect-[3/4] rounded-2xl bg-foreground/[0.04] mb-4" />
                                            <div className="h-3 bg-foreground/[0.04] rounded w-3/4 mb-2" />
                                            <div className="h-2 bg-foreground/[0.03] rounded w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                            )}

                            {/* Empty state */}
                            {!productsLoading && filteredProducts.length === 0 && (
                                <div className="text-center py-24">
                                    {isFiltered ? (
                                        <>
                                            <p className="font-ui text-base text-foreground/55">No pieces match these filters.</p>
                                            <button
                                                onClick={resetFilters}
                                                className="mt-5 px-5 py-2.5 rounded-xl border border-accent/40 text-[10px] tracking-[0.28em] uppercase text-accent font-ui font-semibold hover:bg-accent/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                            >
                                                Clear Filters
                                            </button>
                                        </>
                                    ) : (
                                        <p className="font-ui text-base text-foreground/45">Nothing here yet.</p>
                                    )}
                                </div>
                            )}

                            {/* Bottom note */}
                            <div className="mt-20 pt-10 border-t border-foreground/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui font-medium">
                                    {settings?.shipping_origin || 'Ships from Lagos, Nigeria'}
                                </p>
                                <p className="text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui font-medium">
                                    Worldwide delivery available
                                </p>
                            </div>
                        </div>
                    </section>

                    <Footer />

                    {/* Cart sidebar (portal) */}
                    <CartSidebar />
                </div>

            </main>
        </PageTransition>
    )

}