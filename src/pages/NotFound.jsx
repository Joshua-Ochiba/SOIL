import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
    useEffect(() => { document.title = 'SOIL — Page Not Found'; }, []);

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="text-center flex flex-col items-center gap-8">

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-[10px] tracking-[0.6em] uppercase text-accent/40 font-ui"
                >
                    404 — Lost in the field
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-6xl md:text-9xl tracking-tighter text-foreground/20 leading-none"
                >
                    SOIL
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-ui text-base text-foreground/35 max-w-xs leading-relaxed"
                >
                    This seed hasn't been planted yet. Return to where the ground is fertile.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 border border-accent/30 px-8 py-4 text-[10px] tracking-[0.4em] uppercase font-ui text-accent/70 hover:text-accent hover:border-accent/60 transition-all duration-500"
                    >
                        Return to Origin
                    </Link>
                </motion.div>

            </div>
        </main>
    );
}
