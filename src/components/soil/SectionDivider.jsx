import React from 'react';
import { motion } from 'framer-motion';

export default function SectionDivider({ label }) {
    return (
        <div className="relative py-6 flex items-center justify-center">
            <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
            />
            {label && (
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative px-8 bg-background text-[12px] tracking-[0.6em] uppercase text-muted-foreground dark:text-foreground/80 font-ui font-medium"
                >
                    {label}
                </motion.span>
            )}
        </div>
    );
}