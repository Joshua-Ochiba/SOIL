import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Lightweight cookie notice — discloses cookie use, records the visitor's
 * choice in localStorage, and links to the Privacy Policy. Shows once, then
 * stays dismissed. Positioned bottom-left so it never collides with the
 * Spotify player button (bottom-right).
 */
const KEY = 'soil_cookie_consent';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        try { if (!localStorage.getItem(KEY)) setShow(true); } catch { /* private mode */ }
    }, []);

    const decide = (value) => {
        try { localStorage.setItem(KEY, value); } catch { /* ignore */ }
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed bottom-4 left-4 right-20 md:right-auto md:left-5 md:max-w-sm z-[160] bg-card dark:bg-[#0e0c0a]/97 backdrop-blur-md border border-foreground/[0.1] rounded-2xl p-4 shadow-2xl shadow-black/50"
                    role="dialog"
                    aria-label="Cookie notice"
                >
                    <p className="font-ui text-[12.5px] text-foreground/70 leading-relaxed">
                        We use essential cookies, and the embedded Spotify player may set its
                        own. See our{' '}
                        <Link to="/privacy" className="text-accent/85 hover:text-accent underline underline-offset-2">
                            Privacy Policy
                        </Link>.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={() => decide('declined')}
                            className="flex-1 py-2 text-[10px] tracking-[0.25em] uppercase font-ui text-foreground/55 hover:text-foreground border border-foreground/10 hover:border-foreground/20 rounded-lg transition-all"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => decide('accepted')}
                            className="flex-1 py-2 text-[10px] tracking-[0.25em] uppercase font-ui font-semibold text-background bg-accent hover:bg-accent/90 rounded-lg transition-all"
                        >
                            Accept
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
