import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import PageMeta from '@/components/shared/PageMeta';

export default function AdminLogin() {
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);
    const { user, signIn }          = useAuth();
    const navigate                  = useNavigate();

    useEffect(() => {
        if (user) navigate('/admin/dashboard', { replace: true });
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        setError('');

        // Safety timeout — if Supabase doesn't respond in 12s, unblock the UI
        const timeout = setTimeout(() => {
            setError('Request timed out. Check your connection and try again.');
            setLoading(false);
        }, 12000);

        try {
            const { error: err } = await signIn(email, password, rememberMe);
            clearTimeout(timeout);
            if (err) {
                setError('Invalid email or password.');
                setLoading(false);
            }
            // on success, useEffect above handles redirect
        } catch {
            clearTimeout(timeout);
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0806] flex items-center justify-center px-4">
            <PageMeta title="Admin Login — SOIL" noindex />

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(217,160,54,0.06) 0%, transparent 70%)' }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-sm"
            >
                {/* Logo */}
                <div className="text-center mb-10">
                    <p className="font-display text-2xl tracking-[0.25em] text-[#fff6dc] font-black mb-1"
                       style={{ textShadow: '2px 2px 0px rgba(217,160,54,0.4)' }}>
                        SOIL
                    </p>
                    <p className="text-[9px] tracking-[0.5em] uppercase text-soil-sun/40 font-ui">
                        Studio Admin
                    </p>
                </div>

                {!isSupabaseConfigured ? (
                    <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-5 text-center">
                        <p className="font-ui text-xs text-amber-400/70 leading-relaxed">
                            Supabase is not configured yet.<br />
                            Add <code className="text-amber-400">VITE_SUPABASE_URL</code> and{' '}
                            <code className="text-amber-400">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                            <code className="text-amber-400">.env</code> file to activate the admin.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-ui">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-white/[0.04] border border-white/10 text-white text-sm font-ui px-4 py-3 outline-none focus:border-soil-sun/40 transition-colors placeholder:text-foreground/20"
                                placeholder="admin@soil.studio"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] tracking-[0.4em] uppercase text-foreground/30 font-ui">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-white/[0.04] border border-white/10 text-white text-sm font-ui px-4 py-3 outline-none focus:border-soil-sun/40 transition-colors placeholder:text-foreground/20"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {/* Remember me */}
                        <label className="flex items-center gap-3 cursor-pointer group mt-1">
                            <div
                                onClick={() => setRememberMe(v => !v)}
                                className={`w-4 h-4 border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                                    rememberMe
                                        ? 'border-soil-sun/60 bg-soil-sun/15'
                                        : 'border-white/15 bg-transparent'
                                }`}
                            >
                                {rememberMe && (
                                    <svg className="w-2.5 h-2.5 text-soil-sun" fill="none" viewBox="0 0 10 10">
                                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <span
                                onClick={() => setRememberMe(v => !v)}
                                className="text-[10px] tracking-[0.25em] uppercase font-ui text-foreground/35 group-hover:text-foreground/55 transition-colors select-none"
                            >
                                Remember me for 30 days
                            </span>
                        </label>

                        {/* Error */}
                        {error && (
                            <p className="text-[11px] text-red-400/80 font-ui">{error}</p>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3.5 border border-soil-sun/40 bg-soil-sun/5 text-soil-sun text-[10px] tracking-[0.4em] uppercase font-ui hover:bg-soil-sun/15 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </motion.button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
