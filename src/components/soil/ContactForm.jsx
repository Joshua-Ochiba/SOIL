import React, { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactForm() {
    const [name, setName]       = useState('');
    const [email, setEmail]     = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;
        setSubmitted(true);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
                    >
                        <ScrollReveal>
                            <div className="text-center mb-10 md:mb-20">
                                <p className="text-[12px] tracking-[0.4em] uppercase text-accent mb-6 font-ui font-bold">
                                    ✦ Start a Project ✦
                                </p>
                                <h2 className="font-display text-3xl md:text-6xl tracking-tight text-foreground">
                                    Let's build the future.
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 font-ui font-medium">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="bg-foreground/[0.02] border border-foreground/10 p-4 md:p-5 text-base font-ui text-foreground outline-none focus:border-accent/40 transition-colors duration-500"
                                        placeholder="Who are you?"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 font-ui font-medium">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="bg-foreground/[0.02] border border-foreground/10 p-4 md:p-5 text-base font-ui text-foreground outline-none focus:border-accent/40 transition-colors duration-500"
                                        placeholder="How do we reach you?"
                                    />
                                </div>
                                <div className="flex flex-col gap-3 md:col-span-2">
                                    <label className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 font-ui font-medium">Message</label>
                                    <textarea
                                        rows={5}
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        required
                                        className="bg-foreground/[0.02] border border-foreground/10 p-4 md:p-5 text-base font-ui text-foreground outline-none focus:border-accent/40 transition-colors duration-500 resize-none"
                                        placeholder="What are we cultivating together?"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-center mt-6 md:mt-12">
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full md:w-auto px-10 md:px-16 py-5 border border-accent/50 text-accent text-[11px] tracking-[0.28em] uppercase font-ui font-semibold hover:bg-accent/10 transition-all duration-500 group relative overflow-hidden"
                                        data-hover
                                    >
                                        <span className="relative z-10">Send Message</span>
                                        <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    </motion.button>
                                </div>
                            </form>
                        </ScrollReveal>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center text-center py-16 md:py-28 gap-8"
                    >
                        {/* Glowing glyph */}
                        <motion.div
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                        >
                            <div className="absolute inset-0 blur-2xl bg-accent/20 rounded-full scale-150" />
                            <div className="relative w-16 h-16 border border-accent/40 flex items-center justify-center">
                                <span className="font-display text-accent text-2xl leading-none">✦</span>
                            </div>
                        </motion.div>

                        {/* Eyebrow */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="text-[11px] tracking-[0.45em] uppercase text-accent font-ui font-semibold"
                        >
                            Message Received
                        </motion.p>

                        {/* Headline */}
                        <motion.h3
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="font-display text-4xl md:text-6xl tracking-tight text-foreground leading-tight"
                        >
                            Welcome to <span className="italic text-accent/90">SOIL.</span>
                        </motion.h3>

                        {/* Body */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.85, duration: 0.9 }}
                            className="font-ui text-base md:text-lg text-foreground/45 max-w-sm leading-relaxed"
                        >
                            Your message has been planted. We'll be in touch as the seed grows.
                        </motion.p>

                        {/* Bottom line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="w-16 h-px bg-accent/30 origin-center"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
