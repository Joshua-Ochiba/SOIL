import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { usePrice } from '@/hooks/usePrice';

export default function ProductModal({ product, onClose }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const addItem = useCartStore(s => s.addItem);
    const price = usePrice();

    // Detect mobile once at mount — safe for a pure client-side SPA
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

    const handleAdd = () => {
        if (!selectedSize) return;
        addItem(product, selectedSize, quantity);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 1200);
    };

    const needsSize = product.sizes.length > 1 && product.sizes[0] !== 'One Size';
    const categoryLabel =
        product.category === 'attire'      ? 'SOIL Attire'      :
        product.category === 'artifacts'   ? 'SOIL Artifacts'   : 'SOIL Collectibles';

    return createPortal(
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Shell — bottom sheet on mobile, centered on desktop */}
            <div className={`fixed inset-0 z-[401] flex pointer-events-none ${
                isMobile ? 'items-end' : 'items-center justify-center px-4'
            }`}>
                <motion.div
                    initial={{ opacity: 0, y: isMobile ? '100%' : 40, scale: isMobile ? 1 : 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: isMobile ? '100%' : 24, scale: isMobile ? 1 : 0.98 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full bg-[#0e0c0a] border border-white/[0.07] overflow-hidden pointer-events-auto ${
                        isMobile
                            ? 'rounded-t-2xl flex flex-col max-h-[92vh]'
                            : 'max-w-3xl rounded-2xl'
                    }`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Mobile drag handle */}
                    {isMobile && (
                        <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
                            <div className="w-9 h-1 bg-white/20 rounded-full" />
                        </div>
                    )}

                    {/* Inner layout */}
                    <div className={`flex ${
                        isMobile ? 'flex-col flex-1 overflow-hidden' : 'flex-col md:flex-row max-h-[80vh]'
                    }`}>
                        {/* Image */}
                        <div className={`relative overflow-hidden flex-shrink-0 ${
                            isMobile
                                ? 'h-52 w-full'
                                : 'md:w-[45%] aspect-[4/3] md:aspect-auto'
                        }`}>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale"
                            />
                            {!isMobile && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0e0c0a]/40 hidden md:block" />
                            )}
                            {/* Mobile: bottom fade so details panel doesn't hard-cut the image */}
                            {isMobile && (
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0e0c0a]/60" />
                            )}
                        </div>

                        {/* Details — scrollable */}
                        <div className={`flex-1 overflow-y-auto flex flex-col gap-5 ${
                            isMobile ? 'px-5 pt-4 pb-6' : 'p-6 md:p-8'
                        }`}>
                            {/* Header row */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/35 font-ui mb-1.5">
                                        {categoryLabel}
                                    </p>
                                    {product.tag && (
                                        <span className="inline-block px-2 py-0.5 border border-soil-sun/30 text-[8px] tracking-[0.25em] uppercase text-soil-sun/70 font-ui mb-1.5">
                                            {product.tag}
                                        </span>
                                    )}
                                    <h2 className="font-display text-xl md:text-2xl tracking-wide text-white leading-tight">
                                        {product.name}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center border border-white/10 text-foreground/40 hover:text-white hover:border-white/30 transition-all duration-300 flex-shrink-0 ml-4"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Price */}
                            <p className="font-display text-2xl text-soil-sun/90">
                                {price.format(product)}{' '}
                                <span className="text-sm text-foreground/30 font-ui">{price.currency}</span>
                            </p>

                            {/* Description */}
                            <p className="font-ui text-sm text-foreground/50 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Details bullets */}
                            <div>
                                <p className="text-[9px] tracking-[0.35em] uppercase text-foreground/30 font-ui mb-2">Details</p>
                                <ul className="flex flex-col gap-1.5">
                                    {product.details.map((d, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="text-soil-sun/40 text-xs">—</span>
                                            <span className="font-ui text-xs text-foreground/45">{d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Size selector */}
                            <div>
                                <p className="text-[9px] tracking-[0.35em] uppercase text-foreground/30 font-ui mb-3">
                                    {needsSize ? `Size${selectedSize ? ` — ${selectedSize}` : ''}` : 'Size'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-3 py-2 rounded-lg border text-[10px] tracking-[0.2em] uppercase font-ui transition-all duration-300 ${
                                                selectedSize === size
                                                    ? 'border-soil-sun/60 bg-soil-sun/10 text-soil-sun'
                                                    : 'border-white/10 text-foreground/40 hover:border-white/30 hover:text-foreground/70'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-4">
                                <p className="text-[9px] tracking-[0.35em] uppercase text-foreground/30 font-ui">Qty</p>
                                <div className="flex items-center border border-white/10">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 flex items-center justify-center text-foreground/40 hover:text-white transition-colors"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-9 text-center text-sm font-ui text-foreground/70">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-9 h-9 flex items-center justify-center text-foreground/40 hover:text-white transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Add to Bag CTA */}
                            <motion.button
                                whileHover={!added ? { scale: 1.01 } : {}}
                                whileTap={!added ? { scale: 0.99 } : {}}
                                onClick={handleAdd}
                                disabled={needsSize && !selectedSize}
                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 border text-[10px] tracking-[0.4em] uppercase font-ui transition-all duration-500 ${
                                    added
                                        ? 'border-green-500/40 bg-green-500/10 text-green-400'
                                        : needsSize && !selectedSize
                                        ? 'border-white/10 text-foreground/20 cursor-not-allowed'
                                        : 'border-soil-sun/40 bg-soil-sun/5 text-soil-sun hover:bg-soil-sun/15'
                                }`}
                            >
                                {added ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        Added to Bag
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        {needsSize && !selectedSize ? 'Select a Size' : 'Add to Bag'}
                                    </>
                                )}
                            </motion.button>

                            {/* iOS safe-area bottom buffer */}
                            {isMobile && <div className="h-2" />}
                        </div>
                    </div>
                </motion.div>
            </div>
        </>,
        document.body
    );
}
