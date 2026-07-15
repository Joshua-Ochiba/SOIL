import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT MODAL
═══════════════════════════════════════════════════════════════════════════ */
export default function ContactModal({ isOpen, onClose }) {
    const [name,     setName]     = useState('');
    const [email,    setEmail]    = useState('');
    const [message,  setMessage]  = useState('');
    const [status,   setStatus]   = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const { data: settings } = useSiteSettings();

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setName(''); setEmail(''); setMessage('');
            setStatus('idle'); setErrorMsg('');
        }, 400);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) { setErrorMsg('Please fill in all fields.'); return; }
        if (!email.includes('@')) { setErrorMsg('Enter a valid email address.'); return; }
        setStatus('loading');
        setErrorMsg('');
        try {
            if (isSupabaseConfigured) {
                const { error } = await supabase
                    .from('contact_submissions')
                    .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);
                if (error) throw error;
            }
            setStatus('success');
        } catch (err) {
            console.error('Contact submission error:', err);
            setErrorMsg('Something went wrong. Please try emailing us directly.');
            setStatus('idle');
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
                    onClick={handleClose}
                >
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-2xl bg-card dark:bg-[#1a1510] rounded-2xl border border-foreground/[0.08] overflow-hidden"
                        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.70), inset 0 0 0 1px rgba(217,160,54,0.07)' }}
                    >
                        {/* ── Header ─────────────────────────────────── */}
                        <div className="relative flex items-start justify-between px-6 sm:px-8 pt-7 sm:pt-8 pb-5 sm:pb-6 border-b border-foreground/5">
                            <div>
                                <p className="text-[10px] tracking-[0.5em] uppercase text-accent font-ui font-bold mb-2">
                                    ✦ Start a Project ✦
                                </p>
                                <h2 className="font-display text-2xl md:text-3xl tracking-tight text-foreground">
                                    Let's build the future.
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="mt-1 p-1.5 text-foreground/40 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                                data-hover
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* ── Body ───────────────────────────────────── */}
                        <div className="relative px-6 sm:px-8 py-7 sm:py-8">
                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        className="flex flex-col items-center justify-center py-10 text-center gap-5"
                                    >
                                        <div className="w-14 h-14 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <p className="font-display text-xl text-foreground tracking-tight mb-2">Message received.</p>
                                            <p className="font-ui text-base text-foreground/65 leading-relaxed max-w-xs mx-auto">
                                                We'll be in touch. Something worth cultivating is already growing.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleClose}
                                            className="mt-2 px-8 py-3 rounded-lg border border-accent/40 text-accent text-[11px] tracking-[0.28em] uppercase font-ui font-semibold hover:bg-accent/10 transition-all duration-300"
                                        >
                                            Close
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-5"
                                        onSubmit={handleSubmit}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 font-ui font-medium">Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="bg-foreground/[0.03] border border-foreground/15 rounded-lg px-4 py-3.5 font-ui text-[15px] text-foreground outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-foreground/40"
                                                placeholder="Who are you?"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 font-ui font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="bg-foreground/[0.03] border border-foreground/15 rounded-lg px-4 py-3.5 font-ui text-[15px] text-foreground outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-foreground/40"
                                                placeholder="How do we reach you?"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[11px] tracking-[0.28em] uppercase text-foreground/70 font-ui font-medium">Message</label>
                                            <textarea
                                                rows={4}
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                className="bg-foreground/[0.03] border border-foreground/15 rounded-lg px-4 py-3.5 font-ui text-[15px] text-foreground outline-none focus:border-accent/50 transition-colors duration-300 resize-none placeholder:text-foreground/40"
                                                placeholder="What are we cultivating together?"
                                                required
                                            />
                                        </div>
                                        {errorMsg && (
                                            <p className="md:col-span-2 text-[11px] text-red-400/80 font-ui -mt-1">{errorMsg}</p>
                                        )}
                                        <div className="md:col-span-2 flex justify-end pt-1">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="flex items-center gap-2 px-10 py-3.5 rounded-lg border border-accent/40 text-accent text-[11px] tracking-[0.28em] uppercase font-ui font-semibold hover:bg-accent/15 transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none"
                                                data-hover
                                            >
                                                {status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                {status === 'loading' ? 'Sending…' : 'Send Message'}
                                            </motion.button>
                                        </div>
                                        {settings?.contact_email && (
                                            <p className="md:col-span-2 text-center text-[12px] text-foreground/45 font-ui pt-1">
                                                Or write to us directly at{' '}
                                                <a
                                                    href={`mailto:${settings.contact_email}`}
                                                    className="text-accent/80 hover:text-accent transition-colors underline-offset-2 hover:underline"
                                                >
                                                    {settings.contact_email}
                                                </a>
                                            </p>
                                        )}
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
