import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '@/components/shared/PageTransition';
import PageMeta from '@/components/shared/PageMeta';
import GrainOverlay from '@/components/soil/GrainOverlay';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePrice } from '@/hooks/usePrice';
import useCartStore from '@/store/cartStore';

const CATEGORY_LABEL = {
    attire:       'SOIL Attire',
    artifacts:    'SOIL Artifacts',
    collectibles: 'SOIL Collectibles',
};

// ── Mini card for related rows ─────────────────────────────────────────────────
function RelatedCard({ product }) {
    const price = usePrice();
    return (
        <Link to={`/studio/product/${product.id}`} className="group flex-shrink-0 w-44 sm:w-52">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-foreground/[0.06] mb-3 relative bg-foreground/[0.02]">
                {product.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    />
                )}
                {product.tag && (
                    <span className="absolute top-2 left-2 text-[8px] tracking-[0.25em] uppercase font-ui text-accent bg-accent/15 border border-accent/30 px-2 py-0.5 rounded-full font-medium">
                        {product.tag}
                    </span>
                )}
            </div>
            <p className="font-display text-sm text-foreground group-hover:text-accent/80 transition-colors tracking-wide truncate font-medium">{product.name}</p>
            <p className="font-ui text-sm text-accent font-semibold mt-0.5">{price.format(product)}</p>
        </Link>
    );
}

// ── Horizontal related row ─────────────────────────────────────────────────────
function RelatedRow({ title, products }) {
    if (!products.length) return null;
    return (
        <section className="py-12 border-t border-foreground/[0.04]">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <p className="text-[11px] tracking-[0.4em] uppercase text-accent font-ui font-semibold mb-6">{title}</p>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {products.map(p => <RelatedCard key={p.id} product={p} />)}
                </div>
            </div>
        </section>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: allProducts = [], isLoading } = useProducts();
    const { data: settings } = useSiteSettings();
    const { addItem, openCart } = useCartStore();
    const price = usePrice();

    const product = allProducts.find(p => p.id === id);

    // Color variants — hidden until product.colors is populated via admin
    const colors  = product?.colors || [];
    const [activeColorIdx, setActiveColorIdx] = useState(0);

    // Derived image — switches with color selection
    const activeImage = colors.length > 0
        ? (colors[activeColorIdx]?.image || product?.image)
        : product?.image;

    // Size + quantity
    const sizes = product?.sizes || ['S', 'M', 'L', 'XL'];
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity]         = useState(1);

    // Related products
    const similar = useMemo(() =>
        allProducts.filter(p => p.id !== id && p.category === product?.category).slice(0, 6),
        [allProducts, id, product?.category]
    );
    const alsoViewed = useMemo(() =>
        allProducts.filter(p => p.id !== id && p.category !== product?.category).slice(0, 6),
        [allProducts, id, product?.category]
    );

    // Note: title is now handled by <PageMeta> below instead of document.title — Helmet keeps it in sync with React.

    // Reset size when product changes
    useEffect(() => { setSelectedSize(null); setQuantity(1); setActiveColorIdx(0); }, [id]);

    // Effective stock state
    const stockTracked  = product?.stockCount != null;
    const stockLeft     = stockTracked ? product.stockCount : Infinity;
    const isPurchasable = product?.inStock && stockLeft > 0;
    const isLowStock    = stockTracked && stockLeft > 0 && stockLeft <= 5;

    const handleAddToBag = () => {
        if (!selectedSize) {
            toast.error('Select a size first');
            return;
        }
        if (stockTracked && quantity > stockLeft) {
            toast.error(`Only ${stockLeft} left — adjust quantity.`);
            return;
        }
        addItem(product, selectedSize, quantity);
        toast.success(`${product.name} added to your bag`, {
            action: { label: 'View Bag', onClick: openCart },
        });
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background dark:bg-[#0a0806] flex items-center justify-center">
                <div className="w-6 h-6 border border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────────────────────────
    if (!isLoading && !product) {
        return (
            <div className="min-h-screen bg-background dark:bg-[#0a0806] flex flex-col items-center justify-center gap-4 px-4">
                <p className="font-ui text-base text-foreground/55">Product not found.</p>
                <Link to="/studio" className="text-[11px] tracking-[0.28em] uppercase font-ui text-accent/80 hover:text-accent transition-colors font-medium">
                    ← Back to Studio
                </Link>
            </div>
        );
    }

    const linePrice = product ? price.formatAmount(product.price * quantity) : '0';

    // Build Product structured data — JSON-LD lets Google show rich product cards in search
    const productJsonLd = {
        '@context':    'https://schema.org',
        '@type':       'Product',
        name:          product.name,
        description:   product.description || `${product.name} — SOIL Studio`,
        image:         product.image ? [product.image] : undefined,
        sku:           product.id,
        brand:         { '@type': 'Brand', name: 'SOIL' },
        offers: {
            '@type':         'Offer',
            priceCurrency:   'NGN',
            price:           product.price,
            availability:    isPurchasable
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <PageTransition>
            <PageMeta
                title={`${product.name} — SOIL Studio`}
                description={product.description?.slice(0, 200) || `${product.name} — culturally rooted, intentionally made. Shop ${CATEGORY_LABEL[product.category]} at SOIL Studio.`}
                image={product.image}
                type="product"
                canonicalPath={`/studio/product/${product.id}`}
            >
                <script type="application/ld+json">
                    {JSON.stringify(productJsonLd)}
                </script>
            </PageMeta>
            <div className="min-h-screen bg-background dark:bg-[#0a0806] relative">

                {/* Grain */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.15] z-0">
                    <GrainOverlay />
                </div>

                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none z-0"
                    style={{ background: 'radial-gradient(ellipse 60% 40% at 30% 40%, rgba(217,160,54,0.04) 0%, transparent 60%)' }} />

                <div className="relative z-10">

                    {/* ── Back link ── */}
                    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-2">
                        <Link
                            to="/studio"
                            className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase font-ui text-foreground/60 hover:text-accent transition-colors duration-300 group font-medium"
                        >
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                            Studio
                        </Link>
                    </div>

                    {/* ── Main product grid ── */}
                    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-start">

                            {/* ── Left: Image ── */}
                            <div className="md:sticky md:top-28">
                                {/* Image frame */}
                                <div
                                    className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-foreground/[0.02] border border-foreground/[0.06]"
                                    style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)' }}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={activeImage}
                                            src={activeImage}
                                            alt={product.name}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="w-full h-full object-cover"
                                            style={{ filter: 'grayscale(20%) contrast(1.05)' }}
                                        />
                                    </AnimatePresence>

                                    {/* Tag badge */}
                                    {product.tag && (
                                        <div className="absolute top-4 left-4">
                                            <span className="text-[10px] tracking-[0.25em] uppercase font-ui font-semibold text-accent bg-background/80 dark:bg-[#0a0806]/80 border border-accent/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                                {product.tag}
                                            </span>
                                        </div>
                                    )}

                                    {/* Subtle inner border shine */}
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                                        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }} />
                                </div>

                                {/* ── Color dots — hidden until product.colors is populated ── */}
                                {colors.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center gap-4 mt-6 justify-center"
                                    >
                                        <p className="text-[10px] tracking-[0.3em] uppercase font-ui text-foreground/55 font-medium mr-2">
                                            {colors[activeColorIdx]?.name}
                                        </p>
                                        {colors.map((c, i) => (
                                            <motion.button
                                                key={i}
                                                onClick={() => setActiveColorIdx(i)}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="relative w-5 h-5 rounded-full transition-all duration-300 focus:outline-none"
                                                style={{ background: c.hex }}
                                                title={c.name}
                                            >
                                                {activeColorIdx === i && (
                                                    <motion.span
                                                        layoutId="color-ring"
                                                        className="absolute -inset-1.5 rounded-full border border-foreground/50"
                                                    />
                                                )}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* ── Right: Details ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col gap-7 pt-2 md:pt-6"
                            >
                                {/* Category + Name + Price */}
                                <div>
                                    <p className="text-[11px] tracking-[0.4em] uppercase text-accent font-ui font-semibold mb-3">
                                        {CATEGORY_LABEL[product.category]}
                                    </p>
                                    <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-foreground leading-tight mb-5">
                                        {product.name}
                                    </h1>
                                    <p className="font-display text-3xl text-accent font-semibold">
                                        {price.format(product)}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-foreground/[0.08]" />

                                {/* Description */}
                                <p className="font-ui text-base md:text-[17px] text-foreground/75 leading-relaxed">
                                    {product.description}
                                </p>

                                {/* Details list */}
                                {product.details?.length > 0 && (
                                    <ul className="flex flex-col gap-2.5">
                                        {product.details.map((d, i) => (
                                            <li key={i} className="flex items-start gap-3 font-ui text-[15px] text-foreground/65 leading-relaxed">
                                                <span className="text-accent/60 mt-0.5 flex-shrink-0">—</span>
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Divider */}
                                <div className="h-px bg-foreground/[0.08]" />

                                {/* Size selector */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[11px] tracking-[0.35em] uppercase text-foreground/75 font-ui font-semibold">Size</p>
                                        {!selectedSize && (
                                            <p className="text-[11px] tracking-[0.15em] text-foreground/50 font-ui italic">Select a size</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map(s => (
                                            <motion.button
                                                key={s}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => setSelectedSize(s)}
                                                className={`min-w-[52px] h-12 px-4 rounded-lg border font-ui text-[13px] tracking-[0.18em] uppercase font-semibold transition-all duration-200 ${
                                                    selectedSize === s
                                                        ? 'border-accent bg-accent/20 text-accent'
                                                        : 'border-foreground/20 text-foreground/75 hover:border-foreground/40 hover:text-foreground'
                                                }`}
                                            >
                                                {s}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <p className="text-[11px] tracking-[0.35em] uppercase text-foreground/75 font-ui font-semibold mb-3">Quantity</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-foreground/15 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="w-11 h-11 flex items-center justify-center text-foreground/65 hover:text-foreground hover:bg-foreground/[0.06] transition-all"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-11 text-center font-ui text-base text-foreground font-semibold">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(stockLeft, q + 1))}
                                                disabled={stockTracked && quantity >= stockLeft}
                                                className="w-11 h-11 flex items-center justify-center text-foreground/65 hover:text-foreground hover:bg-foreground/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {quantity > 1 && (
                                            <p className="font-ui text-sm text-foreground/65 font-medium">
                                                {linePrice} total
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Low-stock notice */}
                                {isLowStock && (
                                    <p className="text-[12px] tracking-[0.15em] uppercase text-amber-400/85 font-ui font-semibold -mb-2">
                                        Only {stockLeft} left
                                    </p>
                                )}

                                {/* Add to Bag */}
                                <motion.button
                                    whileHover={{ opacity: 0.88 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleAddToBag}
                                    disabled={!isPurchasable}
                                    className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-ui text-[12px] tracking-[0.32em] uppercase font-bold flex items-center justify-center gap-3 transition-opacity duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    {!product.inStock
                                        ? 'Unavailable'
                                        : stockLeft === 0
                                        ? 'Sold Out'
                                        : `Add to Bag — ${linePrice}`}
                                </motion.button>

                                {/* Payment trust note */}
                                <p className="text-center text-[11px] tracking-[0.18em] text-foreground/50 font-ui">
                                    Secured by Paystack · {settings?.shipping_origin || 'Ships from Lagos'}
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    {/* ── Related sections ── */}
                    <RelatedRow title="Similar Items" products={similar} />
                    <RelatedRow title="Others Also Viewed" products={alsoViewed} />

                    {/* ── Minimal footer ── */}
                    <footer className="border-t border-foreground/[0.04] mt-4 px-4 md:px-8 py-8">
                        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Link to="/studio"
                                className="font-display text-base tracking-[0.2em] text-foreground/55 hover:text-accent/80 transition-colors duration-300"
                            >
                                S<span className="text-accent/70">O</span>IL
                            </Link>
                            <p className="text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui">
                                © {new Date().getFullYear()} SOIL Sons & Daughters
                            </p>
                            <Link to="/"
                                className="text-[10px] tracking-[0.28em] uppercase font-ui font-medium text-foreground/55 hover:text-accent transition-colors duration-300"
                            >
                                Return to SOIL
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </PageTransition>
    );
}
