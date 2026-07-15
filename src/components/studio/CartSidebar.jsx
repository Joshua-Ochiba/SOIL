import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useCartStore from '@/store/cartStore';
import { usePrice } from '@/hooks/usePrice';

const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Other'];

export default function CartSidebar() {
    const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
    const price = usePrice();
    const [checkingOut, setCheckingOut] = useState(false);
    const [view, setView] = useState('cart');           // 'cart' | 'details'
    const [form, setForm] = useState({
        email: '', name: '', phone: '',
        line1: '', line2: '', city: '', state: '', postal_code: '', country: 'Nigeria',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // Cart total in the active currency
    const total = items.reduce((sum, i) => sum + price.value(i.product) * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);

    const close = () => { closeCart(); setView('cart'); };

    const startCheckout = () => {
        if (import.meta.env.VITE_MOCK_CHECKOUT === 'true') return runCheckout();
        setView('details');
    };

    const runCheckout = async () => {
        setCheckingOut(true);

        // Snapshot for the success page (display only — the webhook is authoritative)
        const snapshot = items.map(i => ({
            id:       i.product.id,
            name:     i.product.name,
            image:    i.product.image,
            size:     i.size,
            quantity: i.quantity,
            price:    price.value(i.product),
        }));
        localStorage.setItem('soil_last_order', JSON.stringify(snapshot));

        // ── Mock mode: bypass Paystack, go straight to success ──────────────────
        if (import.meta.env.VITE_MOCK_CHECKOUT === 'true') {
            setTimeout(() => { window.location.href = '/studio/success'; }, 600);
            return;
        }

        // ── Live mode: initialize a Paystack transaction, then redirect ─────────
        try {
            const origin = window.location.origin;
            const res = await fetch('/api/initialize-transaction', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    items:    items.map(i => ({ id: i.product.id, size: i.size, quantity: i.quantity })),
                    currency: price.currency,
                    customer: { email: form.email.trim(), name: form.name.trim(), phone: form.phone.trim() },
                    shipping: {
                        line1: form.line1.trim(), line2: form.line2.trim(),
                        city: form.city.trim(), state: form.state.trim(),
                        postal_code: form.postal_code.trim(), country: form.country,
                    },
                    callbackUrl: `${origin}/studio/success`,
                }),
            }).catch(() => { throw new Error('Checkout is not active yet. Payment keys need to be configured.'); });

            let data;
            try { data = await res.json(); }
            catch { throw new Error('Checkout is not active yet. Payment keys need to be configured.'); }

            if (!res.ok) throw new Error(data.error || 'Checkout failed. Please try again.');
            window.location.href = data.authorization_url;
        } catch (err) {
            localStorage.removeItem('soil_last_order');
            toast.error(err.message || 'Something went wrong. Please try again.');
            setCheckingOut(false);
        }
    };

    const submitDetails = (e) => {
        e.preventDefault();
        if (!form.email.trim())  return toast.error('Email is required.');
        if (!form.name.trim())   return toast.error('Please enter your full name.');
        if (!form.line1.trim() || !form.city.trim() || !form.country)
            return toast.error('Please complete your shipping address.');
        runCheckout();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-[2px]"
                        onClick={close}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-0 right-0 bottom-0 w-full sm:top-2 sm:right-2 sm:bottom-2 sm:max-w-[420px] z-[301] bg-card dark:bg-[#0e0c0a] border-l sm:border border-foreground/[0.07] sm:rounded-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-6 border-b border-foreground/[0.06]">
                            <div className="flex items-center gap-3">
                                {view === 'details' ? (
                                    <button onClick={() => setView('cart')}
                                        className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase font-ui text-foreground font-semibold hover:text-accent transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Details
                                    </button>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4 text-accent" />
                                        <p className="text-[12px] tracking-[0.32em] uppercase font-ui text-foreground font-semibold">
                                            Your Bag
                                        </p>
                                        {count > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-accent/25 border border-accent/50 text-[10px] font-ui text-accent font-bold flex items-center justify-center">
                                                {count}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <button
                                onClick={close}
                                className="w-8 h-8 flex items-center justify-center border border-foreground/15 text-foreground/65 hover:text-foreground hover:border-foreground/40 transition-all duration-300 rounded-md"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* ── DETAILS VIEW ──────────────────────────────────────── */}
                        {view === 'details' ? (
                            <form id="checkout-details" onSubmit={submitDetails} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
                                <p className="text-[11px] tracking-[0.28em] uppercase text-accent/70 font-ui font-semibold">Contact</p>
                                <CartInput label="Email *" type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@email.com" />
                                <CartInput label="Full name *" value={form.name} onChange={v => set('name', v)} placeholder="First and last name" />
                                <CartInput label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="Optional" />

                                <p className="text-[11px] tracking-[0.28em] uppercase text-accent/70 font-ui font-semibold mt-2">Shipping address</p>
                                <CartInput label="Address line 1 *" value={form.line1} onChange={v => set('line1', v)} placeholder="Street address" />
                                <CartInput label="Address line 2" value={form.line2} onChange={v => set('line2', v)} placeholder="Apt, suite (optional)" />
                                <div className="grid grid-cols-2 gap-3">
                                    <CartInput label="City *" value={form.city} onChange={v => set('city', v)} />
                                    <CartInput label="State / Region" value={form.state} onChange={v => set('state', v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <CartInput label="Postal code" value={form.postal_code} onChange={v => set('postal_code', v)} />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui font-medium">Country *</label>
                                        <select value={form.country} onChange={e => set('country', e.target.value)}
                                            className="bg-foreground/[0.04] border border-foreground/12 text-foreground text-sm font-ui px-3 py-2.5 outline-none focus:border-accent/40 transition-colors rounded-lg appearance-none cursor-pointer">
                                            {COUNTRIES.map(c => <option key={c} value={c} className="bg-card dark:bg-[#0e0c0a]">{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            /* ── CART VIEW ─────────────────────────────────────── */
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <AnimatePresence>
                                    {items.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-full gap-4 text-center"
                                        >
                                            <ShoppingBag className="w-10 h-10 text-foreground/10" />
                                            <p className="font-ui text-base text-foreground/65 font-medium">Your bag is empty.</p>
                                            <p className="font-ui text-sm text-foreground/45 max-w-[220px] leading-relaxed">
                                                Add something from the store below.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {items.map(item => (
                                                <motion.div
                                                    key={item.key}
                                                    layout
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                                                    className="flex gap-4"
                                                >
                                                    {/* Image */}
                                                    <div className="w-20 h-24 flex-shrink-0 overflow-hidden rounded-xl border border-foreground/[0.06]">
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover grayscale"
                                                        />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <p className="font-display text-sm text-foreground tracking-wide leading-tight font-semibold">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/70 font-ui font-medium mt-1">
                                                                Size {item.size}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            {/* Quantity */}
                                                            <div className="flex items-center border border-foreground/10">
                                                                <button
                                                                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                                                    className="w-7 h-7 flex items-center justify-center text-foreground/65 hover:text-foreground transition-colors"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="w-7 text-center text-sm font-ui text-foreground font-semibold">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                                                    className="w-7 h-7 flex items-center justify-center text-foreground/65 hover:text-foreground transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            {/* Price */}
                                                            <p className="font-ui text-sm text-accent font-semibold">
                                                                {price.formatAmount(price.value(item.product) * item.quantity)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Remove */}
                                                    <button
                                                        onClick={() => removeItem(item.key)}
                                                        className="self-start mt-0.5 text-foreground/45 hover:text-foreground transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="px-6 py-6 border-t border-foreground/[0.06] flex flex-col gap-5">
                                {/* Subtotal */}
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] tracking-[0.28em] uppercase text-foreground/75 font-ui font-semibold">Subtotal</p>
                                    <p className="font-display text-2xl text-foreground font-semibold">{price.formatAmount(total)}</p>
                                </div>

                                <p className="text-[12px] text-foreground/55 font-ui leading-relaxed">
                                    {view === 'details'
                                        ? 'You\'ll complete payment securely on Paystack.'
                                        : 'Shipping and taxes calculated at checkout.'}
                                </p>

                                {/* CTA */}
                                <motion.button
                                    whileHover={checkingOut ? {} : { opacity: 0.88 }}
                                    whileTap={checkingOut ? {} : { scale: 0.99 }}
                                    onClick={view === 'details' ? undefined : startCheckout}
                                    type={view === 'details' ? 'submit' : 'button'}
                                    form={view === 'details' ? 'checkout-details' : undefined}
                                    disabled={checkingOut}
                                    className="w-full py-4 rounded-xl bg-accent text-accent-foreground text-[12px] tracking-[0.32em] uppercase font-ui font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-200"
                                >
                                    {checkingOut ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Preparing…
                                        </>
                                    ) : view === 'details' ? (
                                        `Pay ${price.formatAmount(total)}`
                                    ) : (
                                        `Checkout — ${price.formatAmount(total)}`
                                    )}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

// ── Small labelled input for the checkout details form ──────────────────────────
function CartInput({ label, value, onChange, type = 'text', placeholder }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui font-medium">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-foreground/[0.04] border border-foreground/12 text-foreground text-sm font-ui px-3 py-2.5 outline-none focus:border-accent/40 transition-colors rounded-lg placeholder:text-foreground/25"
            />
        </div>
    );
}
