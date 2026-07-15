import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrice } from '@/hooks/usePrice';

export default function ProductCard({ product }) {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();
    const price = usePrice();

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/studio/product/${product.id}`)}
            data-hover
        >
            {/* Image */}
            <div className="relative overflow-hidden aspect-[3/4] mb-4 rounded-2xl">
                <div className="absolute inset-0 scale-105 group-hover:scale-100 transition-transform duration-700 ease-out">
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-700" />
                </div>

                {/* Tag */}
                {product.tag && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="px-2 py-1 border border-accent/50 bg-background/80 text-[9px] tracking-[0.25em] uppercase text-accent font-ui font-semibold">
                            {product.tag}
                        </span>
                    </div>
                )}

                {/* Stock badge — only renders when count is tracked AND ≤ 5 */}
                {product.stockCount != null && product.stockCount <= 5 && (
                    <div className="absolute top-3 right-3 z-10">
                        {product.stockCount === 0 ? (
                            <span className="px-2 py-1 border border-red-400/50 bg-background/80 text-[9px] tracking-[0.25em] uppercase text-red-400/85 font-ui font-semibold">
                                Sold Out
                            </span>
                        ) : (
                            <span className="px-2 py-1 border border-amber-400/50 bg-background/80 text-[9px] tracking-[0.25em] uppercase text-amber-400/85 font-ui font-semibold">
                                Only {product.stockCount} Left
                            </span>
                        )}
                    </div>
                )}

                {/* Desktop hover overlay */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
                    transition={{ duration: 0.25 }}
                    className="hidden sm:flex absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent items-center gap-2 pointer-events-none"
                >
                    <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px] tracking-[0.25em] uppercase font-ui text-white/95 font-semibold">
                        View Product
                    </span>
                </motion.div>

                {/* Mobile tap hint */}
                <div className="sm:hidden absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-accent/70" />
                    <span className="text-[10px] tracking-[0.22em] uppercase font-ui text-white/85 font-medium">
                        Tap to view
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="px-0.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-display text-sm md:text-[15px] tracking-wide text-foreground leading-snug font-medium">
                        {product.name}
                    </p>
                    <p className="font-ui text-sm text-accent font-medium flex-shrink-0">
                        {price.format(product)}
                    </p>
                </div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-foreground/60 font-ui font-medium">
                    {product.category === 'attire' ? 'SOIL Attire' :
                     product.category === 'artifacts' ? 'Artifact' : 'Collectible'}
                </p>
            </div>
        </motion.div>
    );
}
