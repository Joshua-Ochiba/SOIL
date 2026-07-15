import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import GrainOverlay from '@/components/soil/GrainOverlay';
import PageMeta from '@/components/shared/PageMeta';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatPrice } from '@/lib/currency';

export default function CheckoutSuccess() {
    const { clearCart } = useCartStore();
    const [searchParams]           = useSearchParams();
    const [orderItems, setOrderItems] = useState([]);
    const [orderId, setOrderId]       = useState('');
    const [customerInfo, setCustomerInfo] = useState(null);
    const [currency, setCurrency]     = useState('NGN');

    useEffect(() => {
        document.title = 'Order Confirmed — SOIL Studio';

        const saved     = localStorage.getItem('soil_last_order');
        // Paystack appends ?reference= (and ?trxref=) to the callback URL
        const reference = searchParams.get('reference') || searchParams.get('trxref');

        // Always clear cart + localStorage first
        clearCart();
        localStorage.removeItem('soil_last_order');

        if (!saved) return;

        const items = JSON.parse(saved);
        setOrderItems(items);

        const id    = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
        setOrderId(id);

        const isMock = import.meta.env.VITE_MOCK_CHECKOUT === 'true';

        // Verify the Paystack transaction to show the buyer their details
        const fetchCustomer = reference && !isMock
            ? fetch(`/api/verify-transaction?reference=${encodeURIComponent(reference)}`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
            : Promise.resolve(null);

        if (isSupabaseConfigured) {
            fetchCustomer.then(info => {
                if (info) {
                    setCustomerInfo(info);
                    if (info.currency) setCurrency(info.currency);
                }

                if (isMock) {
                    // Mock mode: no webhook fires, so save the order directly
                    supabase.from('orders').insert([{
                        id,
                        items,
                        total,
                        status:             'pending',
                        paystack_reference: null,
                        customer_name:      null,
                        customer_email:     null,
                        shipping_address:   null,
                    }]).then(({ error }) => {
                        if (error) console.error('Mock order save failed:', error.message);
                    });
                }
                // Live mode: the Paystack webhook (/api/webhook) is the authoritative
                // order writer — it uses the service role key and upserts by
                // paystack_reference. We intentionally do NOT double-write here.
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-background dark:bg-[#0a0806] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <PageMeta
                title="Order Confirmed — SOIL Studio"
                description="Your SOIL order is confirmed."
                noindex
            />

            {/* Grain */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <GrainOverlay />
            </div>

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(217,160,54,0.08) 0%, transparent 70%)' }} />

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
                    <div className="w-16 h-16 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-accent" />
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                >
                    <p className="text-[11px] tracking-[0.4em] uppercase text-accent font-ui font-semibold mb-3">
                        Order Confirmed
                    </p>
                    <h1 className="font-display text-3xl md:text-4xl tracking-tight text-foreground leading-tight mb-4">
                        Rooted in your hands soon.
                    </h1>
                    <p className="font-ui text-base text-foreground/65 leading-relaxed">
                        {customerInfo?.customer_name
                            ? `Thank you, ${customerInfo.customer_name.split(' ')[0]}. Your order is confirmed — we'll send tracking details once it ships from Lagos.`
                            : "Your order is confirmed. You'll receive an email receipt with tracking details once your order ships from Lagos."
                        }
                    </p>
                    {orderId && (
                        <p className="font-ui text-[11px] text-foreground/55 tracking-[0.2em] font-medium mt-3">
                            Order #{orderId.slice(-8).toUpperCase()}
                        </p>
                    )}
                </motion.div>

                {/* Order items snapshot */}
                {orderItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.55 }}
                        className="mt-8 border border-foreground/[0.06] rounded-2xl overflow-hidden"
                    >
                        {orderItems.map((item, i) => (
                            <div key={i}
                                className="flex items-center gap-4 px-5 py-4 border-b border-foreground/[0.04] last:border-0"
                            >
                                <div className="w-12 h-14 rounded-xl overflow-hidden border border-foreground/[0.06] flex-shrink-0">
                                    {item.image && (
                                        <img src={item.image} alt={item.name}
                                            className="w-full h-full object-cover grayscale" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-display text-sm text-foreground tracking-wide">{item.name}</p>
                                    <p className="text-[11px] tracking-[0.18em] uppercase text-foreground/60 font-ui font-medium mt-0.5">
                                        {item.size} · Qty {item.quantity}
                                    </p>
                                </div>
                                <p className="font-ui text-sm text-accent/80 flex-shrink-0">
                                    {formatPrice(item.price * item.quantity, currency)}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Divider */}
                <div className="mt-8 w-12 h-[1px] bg-accent/30 mx-auto" />

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mt-8 flex flex-col gap-3"
                >
                    <Link to="/studio">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-4 rounded-xl bg-accent/10 border border-accent/40 text-accent text-[11px] tracking-[0.3em] uppercase font-ui font-semibold hover:bg-accent/20 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Continue Shopping
                            <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </Link>
                    <Link to="/">
                        <button className="w-full py-3 text-[11px] tracking-[0.28em] uppercase font-ui font-medium text-foreground/55 hover:text-foreground/85 transition-colors">
                            Return to SOIL
                        </button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
