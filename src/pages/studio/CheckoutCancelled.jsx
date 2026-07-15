import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import GrainOverlay from '@/components/soil/GrainOverlay';
import PageMeta from '@/components/shared/PageMeta';
import useCartStore from '@/store/cartStore';

export default function CheckoutCancelled() {
    document.title = 'Order Cancelled — SOIL Studio';
    const { openCart } = useCartStore();

    return (
        <div className="min-h-screen bg-background dark:bg-[#0a0806] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <PageMeta
                title="Order Cancelled — SOIL Studio"
                description="Your SOIL order was cancelled."
                noindex
            />

            {/* Grain */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <GrainOverlay />
            </div>

            {/* Ambient glow — cooler, more muted */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(217,160,54,0.04) 0%, transparent 70%)' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-center mb-8"
                >
                    <div className="w-16 h-16 rounded-full border border-foreground/10 bg-foreground/[0.04] flex items-center justify-center">
                        <XCircle className="w-7 h-7 text-foreground/55" />
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                >
                    <p className="text-[11px] tracking-[0.4em] uppercase text-foreground/60 font-ui font-semibold mb-3">
                        Order Cancelled
                    </p>
                    <h1 className="font-display text-3xl md:text-4xl tracking-tight text-foreground leading-tight mb-4">
                        No worries — your bag is still waiting.
                    </h1>
                    <p className="font-ui text-base text-foreground/65 leading-relaxed">
                        You left before completing your order. Everything you selected is still in your bag, ready when you are.
                    </p>
                </motion.div>

                {/* Divider */}
                <div className="mt-8 w-12 h-[1px] bg-foreground/10 mx-auto" />

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                    className="mt-8 flex flex-col gap-3"
                >
                    <Link to="/studio">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={openCart}
                            className="w-full py-4 rounded-xl bg-accent/10 border border-accent/40 text-accent text-[11px] tracking-[0.3em] uppercase font-ui font-semibold hover:bg-accent/20 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Return to Bag
                        </motion.button>
                    </Link>
                    <Link to="/studio">
                        <button className="w-full py-3 text-[11px] tracking-[0.28em] uppercase font-ui font-medium text-foreground/55 hover:text-foreground/85 transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="w-3 h-3" />
                            Continue Shopping
                        </button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
