import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import GrainOverlay from '@/components/soil/GrainOverlay';
import ThemeToggle from '@/components/shared/ThemeToggle';
import useCartStore from '@/store/cartStore';
import useUIStore from '@/store/uiStore';
import useThemeStore from '@/store/themeStore';

const NAV_ITEMS = [
    { label: 'Origin', path: '/' },
    { label: 'Intelligence', path: '/intelligence' },
    { label: 'Studio', path: '/studio' },
    { label: 'Cultivate', path: '/cultivate' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();
    const { openCart, items } = useCartStore();
    const { openContact } = useUIStore();
    // Home-letterbox visibility — drives a crossfade between this navbar's
    // two modes: the pill (rounded glass, scroll-driven) when the letterbox
    // is down, and an embedded mode (white bold nav riding the black letterbox
    // bar, no pill chrome) when the letterbox is up.
    const letterboxOpacity = useUIStore((s) => s.letterboxOpacity);
    const isStudio = location.pathname === '/studio';
    const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

    // Reveal gate — the Home loading screen lives inside the lazy-loaded Home
    // chunk, so during the Suspense window the navbar would paint over the dark
    // fallback BEFORE the loader mounts (a brief flash). On Home we keep the
    // navbar hidden until the loader fires `soil:loaded`; every other route
    // shows it immediately. A safety timeout prevents it being trapped hidden.
    const isHome = location.pathname === '/';
    // Nav chrome is dark on Home (always) and whenever dark theme is active;
    // light pages get a translucent cream pill with dark text.
    const theme = useThemeStore((s) => s.theme);
    const darkNav = isHome || theme === 'dark';
    const [revealed, setRevealed] = useState(!isHome);
    useEffect(() => {
        if (!isHome) { setRevealed(true); return; }
        setRevealed(false);
        const reveal = () => setRevealed(true);
        window.addEventListener('soil:loaded', reveal);
        const fallback = setTimeout(reveal, 8000);
        return () => { window.removeEventListener('soil:loaded', reveal); clearTimeout(fallback); };
    }, [isHome]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const navBg           = useTransform(scrollY, [0, 150], darkNav
                                ? ['rgba(20,16,12,0)',   'rgba(20,16,12,0.88)']
                                : ['rgba(237,230,215,0)', 'rgba(237,230,215,0.92)']);
    const navBlur         = useTransform(scrollY, [0, 150], ['blur(0px)',           'blur(14px)']);
    const navWidth        = useTransform(scrollY, [0, 150], ['100%',               typeof window !== 'undefined' && window.innerWidth < 768 ? '94%' : '65%']);
    const navRadius       = useTransform(scrollY, [0, 150], [0,                    9999]);
    const navTop          = useTransform(scrollY, [0, 150], [0,                    14]);
    const navPy           = useTransform(scrollY, [0, 150], [20,                   12]);
    const navBoxShadow    = useTransform(scrollY, [0, 150], ['inset 0 0 0 1px rgba(217,160,54,0)', 'inset 0 0 0 1px rgba(217,160,54,0.2)']);

    return (
        <div
            style={{
                opacity: revealed ? 1 : 0,
                pointerEvents: revealed ? undefined : 'none',
                transition: 'opacity 0.8s ease',
            }}
        >
            {/* ─── PILL NAVBAR — existing, scroll-driven, fades out as letterbox rises ─── */}
            {/* inert when faded out so keyboard/SR users don't tab into the
                invisible mode (the embedded letterbox nav is active instead). */}
            <div
                className="fixed top-0 left-0 right-0 z-[100] flex justify-center"
                style={{
                    opacity: 1 - letterboxOpacity,
                    pointerEvents: letterboxOpacity > 0.5 ? 'none' : 'auto',
                }}
                {...(letterboxOpacity > 0.5 ? { inert: '' } : {})}
            >
                <motion.header
                    style={{
                        width:            navWidth,
                        borderRadius:     navRadius,
                        backgroundColor:  navBg,
                        backdropFilter:   navBlur,
                        marginTop:        navTop,
                        paddingTop:       navPy,
                        paddingBottom:    navPy,
                        boxShadow:        navBoxShadow,
                        transition:       'none',
                    }}
                    className="flex items-center justify-between px-4 md:px-10 pointer-events-auto"
                >
                    {/* Logo */}
                    <Link
                        data-magnetic
                        data-hover
                        to="/"
                        className="font-display text-xl tracking-[0.2em] text-foreground hover:text-accent transition-colors z-[110]"
                        onClick={() => setIsOpen(false)}
                    >
                        <span
                            className="font-display font-black tracking-[0.22em] text-foreground"
                            style={{ textShadow: '2px 2px 0px rgba(217,160,54,0.4), 4px 4px 0px rgba(0,0,0,0.2)' }}
                        >
                            SOIL
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                data-magnetic
                                data-hover
                                key={item.label}
                                to={item.path}
                                className="font-ui text-[11px] tracking-[0.28em] uppercase text-foreground/85 py-2 px-1 rounded-sm hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all font-medium"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            data-magnetic
                            data-hover
                            onClick={() => openContact()}
                            className="font-ui text-[10px] tracking-[0.3em] uppercase text-foreground/75 py-2 px-1 rounded-sm hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
                        >
                            Contact
                        </button>

                        {/* Theme toggle — hidden on Home (locked dark) */}
                        {!isHome && <ThemeToggle />}

                        {/* Cart icon — only on /studio */}
                        {isStudio && (
                            <button
                                data-hover
                                onClick={openCart}
                                className="relative flex items-center justify-center w-8 h-8 text-foreground/70 hover:text-accent transition-colors duration-300"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-background text-[8px] font-ui flex items-center justify-center leading-none">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Mobile: Cart icon (studio only) + Hamburger */}
                    <div className="md:hidden flex items-center gap-2 z-[110]">
                        {isStudio && (
                            <button
                                data-hover
                                onClick={openCart}
                                className="relative p-2 text-foreground/70 hover:text-accent transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-accent text-background text-[7px] font-ui flex items-center justify-center leading-none">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}
                        {!isHome && <ThemeToggle />}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isOpen}
                        className="md:hidden z-[110] p-3 rounded-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        data-hover
                    >
                        <div className="w-6 flex flex-col gap-1.5">
                            <motion.span animate={isOpen ? { rotate: 45, y: 7 }  : { rotate: 0, y: 0 }}  className="w-full h-0.5 bg-current block" />
                            <motion.span animate={isOpen ? { opacity: 0 }        : { opacity: 1 }}        className="w-full h-0.5 bg-current block" />
                            <motion.span animate={isOpen ? { rotate: -45, y: -7 }: { rotate: 0, y: 0 }}  className="w-full h-0.5 bg-current block" />
                        </div>
                    </button>
                </motion.header>
            </div>

            {/* ─── EMBEDDED LETTERBOX NAVBAR — rides the black top bar while */}
            {/* the home-page letterbox is up; same layout as the pill but no  */}
            {/* glass/blur/radius, white bold text, sits inside the 6vh/8vh   */}
            {/* letterbox bar. Crossfades with the pill via letterboxOpacity. */}
            <div
                className="fixed top-0 left-0 right-0 z-[100] flex justify-center"
                style={{
                    opacity: letterboxOpacity,
                    pointerEvents: letterboxOpacity > 0.5 ? 'auto' : 'none',
                }}
                {...(letterboxOpacity > 0.5 ? {} : { inert: '' })}
            >
                <header className="w-full flex items-center justify-between px-4 md:px-10 min-h-[44px] py-2">
                    {/* Logo */}
                    <Link
                        data-magnetic
                        data-hover
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="font-display text-xl tracking-[0.22em] font-black text-white"
                    >
                        SOIL
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                data-magnetic
                                data-hover
                                key={item.label}
                                to={item.path}
                                className="font-ui text-[11px] tracking-[0.28em] uppercase text-white font-semibold py-3 px-2 rounded-sm hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            data-magnetic
                            data-hover
                            onClick={() => openContact()}
                            className="font-ui text-[10px] tracking-[0.3em] uppercase text-white font-semibold py-3 px-2 rounded-sm hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                        >
                            Contact
                        </button>
                    </div>

                    {/* Mobile hamburger — same toggle as the pill */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isOpen}
                        className="md:hidden z-[110] p-3 rounded-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        data-hover
                    >
                        <div className="w-6 flex flex-col gap-1.5">
                            <motion.span animate={isOpen ? { rotate: 45, y: 7 }  : { rotate: 0, y: 0 }}  className="w-full h-0.5 bg-current block" />
                            <motion.span animate={isOpen ? { opacity: 0 }        : { opacity: 1 }}        className="w-full h-0.5 bg-current block" />
                            <motion.span animate={isOpen ? { rotate: -45, y: -7 }: { rotate: 0, y: 0 }}  className="w-full h-0.5 bg-current block" />
                        </div>
                    </button>
                </header>
            </div>

            {/* Fullscreen Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center"
                    >
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <GrainOverlay />
                        </div>

                        <nav className="relative z-10 flex flex-col items-center gap-6">
                            {NAV_ITEMS.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className="text-2xl sm:text-3xl font-display tracking-widest uppercase text-foreground/80 hover:text-accent transition-colors block py-2"
                                        data-hover
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + NAV_ITEMS.length * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <button
                                    onClick={() => { setIsOpen(false); openContact(); }}
                                    className="text-2xl sm:text-3xl font-display tracking-widest uppercase text-foreground/80 hover:text-accent transition-colors py-2"
                                    data-hover
                                >
                                    Contact
                                </button>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
