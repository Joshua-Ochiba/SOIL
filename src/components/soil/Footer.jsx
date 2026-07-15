import { Link, useLocation } from 'react-router-dom';
import { Globe, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayerIcon } from '../home/EcosystemPreview';
import useUIStore from '@/store/uiStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useSubscribeNewsletter } from '@/hooks/useNewsletter';

export default function Footer() {
    const { openContact } = useUIStore();
    const { data: settings } = useSiteSettings();
    const location = useLocation();
    const subscribe = useSubscribeNewsletter();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const lagosTime = time.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
    });

    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);

    const handleNewsletter = async (e) => {
        e.preventDefault();
        const val = email.trim();
        if (!val || !val.includes('@')) {
            toast.error('Enter a valid email address');
            return;
        }

        try {
            const result = await subscribe.mutateAsync({
                email: val,
                source: location.pathname,
            });
            setJoined(true);
            setEmail('');
            if (result.alreadySubscribed) {
                toast.success("You're already on the list.", {
                    description: "We'll be in touch when something worth knowing happens.",
                });
            } else {
                toast.success("You're on the list.", {
                    description: "We'll reach out when something worth knowing happens.",
                });
            }
        } catch (err) {
            toast.error(err.message || 'Could not save your email. Try again?');
        }
    };

    return (
        <footer className="relative bg-background pt-14 md:pt-24 pb-10 px-4 md:px-6 overflow-hidden">
            {/* Top Boundary Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* TOP SECTION: Branding & Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-12 md:mb-20">
                    <div className="lg:col-span-5">
                        <span className="font-display text-4xl md:text-6xl tracking-[0.15em] text-foreground/90 block leading-none mb-6">
                            S<span className="text-accent">O</span>IL
                        </span>
                        <p className="font-ui text-base md:text-lg text-muted-foreground dark:text-foreground/55 leading-relaxed max-w-sm italic mb-8 md:mb-10 whitespace-pre-line">
                            {settings?.footer_tagline}
                        </p>

                        {/* Newsletter */}
                        <div className="max-w-md">
                            <p className="text-[11px] tracking-[0.35em] uppercase text-accent mb-4 font-ui font-semibold">Join the Cultivation</p>
                            {joined ? (
                                <p className="font-ui text-sm text-accent/60 italic">You're on the list. We'll be in touch.</p>
                            ) : (
                                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="bg-foreground/[0.03] border border-foreground/10 rounded-sm px-4 py-4 text-sm font-ui text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/40 transition-colors w-full"
                                    />
                                    <button
                                        type="submit"
                                        disabled={subscribe.isPending}
                                        className="px-8 py-4 border border-accent/30 text-[11px] tracking-[0.28em] uppercase text-accent hover:bg-accent/10 transition-all duration-500 rounded-sm whitespace-nowrap font-ui font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {subscribe.isPending ? 'Joining…' : 'Join'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-4">
                            {/* Ecosystem Column */}
                            <div>
                                <h4 className="text-[11px] tracking-[0.35em] uppercase text-accent mb-8 font-ui font-semibold">Ecosystem</h4>
                                <nav className="flex flex-col gap-5">
                                    {[
                                        { id: 'intelligence', name: 'Intelligence', color: 'text-accent',         to: '/intelligence' },
                                        { id: 'studio',       name: 'Studio',       color: 'text-soil-earth',       to: '/studio' },
                                        { id: 'labs',         name: 'Labs',         color: 'text-soil-chlorophyll', to: null },
                                        { id: 'soilnomics',   name: 'Soilnomics',   color: 'text-soil-sand',        to: null },
                                        { id: 'foundation',   name: 'Foundation',   color: 'text-foreground/60',    to: null }
                                    ].map(item => item.to ? (
                                        <Link
                                            key={item.name}
                                            to={item.to}
                                            className="group flex items-center gap-4 font-ui text-sm text-muted-foreground dark:text-foreground/55 hover:text-foreground transition-all duration-300"
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                <LayerIcon id={item.id} color={item.color} />
                                            </div>
                                            {item.name}
                                        </Link>
                                    ) : (
                                        <button
                                            key={item.name}
                                            onClick={() => toast(`${item.name} is coming soon.`, { description: 'This branch of the ecosystem is still being cultivated.' })}
                                            className="group flex items-center gap-4 font-ui text-sm text-muted-foreground dark:text-foreground/50 hover:text-foreground/70 transition-all duration-300 text-left"
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center opacity-25 group-hover:opacity-50 transition-opacity">
                                                <LayerIcon id={item.id} color={item.color} />
                                            </div>
                                            {item.name}
                                            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground dark:text-foreground/40 ml-auto">Soon</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            {/* Connect Column */}
                            <div>
                                <h4 className="text-[11px] tracking-[0.35em] uppercase text-accent mb-8 font-ui font-semibold">Connect</h4>
                                <nav className="flex flex-col gap-5">
                                    <a
                                        href={settings?.instagram_url || 'https://instagram.com'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-4 font-ui text-sm text-muted-foreground dark:text-foreground/55 hover:text-foreground transition-all duration-300"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <LayerIcon id="instagram" color="text-accent" />
                                        </div>
                                        Instagram
                                    </a>
                                    <a
                                        href={settings?.twitter_url || 'https://x.com'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-4 font-ui text-sm text-muted-foreground dark:text-foreground/55 hover:text-foreground transition-all duration-300"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <LayerIcon id="twitter" color="text-accent" />
                                        </div>
                                        Twitter (X)
                                    </a>
                                    <button
                                        onClick={openContact}
                                        className="group flex items-center gap-4 font-ui text-sm text-muted-foreground dark:text-foreground/55 hover:text-foreground transition-all duration-300 text-left"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <LayerIcon id="email" color="text-accent" />
                                        </div>
                                        Email Us
                                    </button>
                                </nav>
                            </div>
                            {/* Resources Column (Hidden on mobile to keep 2 cols) */}
                            <div className="hidden md:block">
                                <h4 className="text-[11px] tracking-[0.35em] uppercase text-accent mb-8 font-ui font-semibold">Resources</h4>
                                <nav className="flex flex-col gap-4">
                                    <Link to="/" className="font-ui text-sm text-muted-foreground dark:text-foreground/55 hover:text-foreground transition-colors duration-300 flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5" /> The Origin
                                    </Link>
                                    <Link to="/" className="font-ui text-sm text-muted-foreground dark:text-foreground/55 hover:text-foreground transition-colors duration-300 flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" /> Manifesto
                                    </Link>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM BAR: Status & Meta */}
                <div className="pt-8 md:pt-12 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground dark:text-foreground/55 font-ui">
                                Lagos {lagosTime} — Cultivating
                            </p>
                        </div>
                        <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground dark:text-foreground/40 font-ui">
                            © {new Date().getFullYear()} SOIL Sons & Daughters
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy" className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground dark:text-foreground/40 hover:text-foreground/70 font-ui transition-colors">
                                Privacy
                            </Link>
                            <Link to="/terms" className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground dark:text-foreground/40 hover:text-foreground/70 font-ui transition-colors">
                                Terms
                            </Link>
                        </div>
                    </div>

                    <p className="text-[9px] tracking-[0.4em] uppercase text-accent/40 font-ui">
                        Rooted in Africa. Grown for the World.
                    </p>
                </div>

            </div>
        </footer>
    );
}