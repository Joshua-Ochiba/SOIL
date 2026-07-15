import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
    { value: 'attire',       label: 'SOIL Attire' },
    { value: 'artifacts',    label: 'SOIL Artifacts' },
    { value: 'collectibles', label: 'SOIL Collectibles' },
];

const SIZE_PRESETS = {
    attire:       ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    artifacts:    ['A3', 'A2', 'A1', '60×80cm', '80×100cm'],
    collectibles: ['One Size', 'Small', 'Medium', 'Large'],
};

const TAG_OPTIONS = ['', 'New', 'Limited', 'Handmade', 'Sold Out'];

const EMPTY_FORM = {
    name:        '',
    category:    'attire',
    price:       '',  // Naira (base price)
    priceUsd:    '',  // optional USD override; blank = auto-convert from Naira
    description: '',
    details:     [],
    sizes:       [],
    image:       '',
    inStock:     true,
    stockCount:  '', // '' = unlimited; integer = tracked
    featured:    false,
    tag:         '',
};

export default function ProductForm({ product, onSave, onClose, saving }) {
    const [form, setForm]           = useState(EMPTY_FORM);
    const [detailInput, setDetailInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imgPreview, setImgPreview] = useState('');
    const fileRef = useRef(null);

    // Populate form when editing
    useEffect(() => {
        if (product) {
            setForm({
                name:        product.name        || '',
                category:    product.category    || 'attire',
                price:       product.price       || '',
                priceUsd:    product.priceUsd == null ? '' : String(product.priceUsd),
                description: product.description || '',
                details:     product.details     || [],
                sizes:       product.sizes       || [],
                image:       product.image       || '',
                inStock:     product.inStock     ?? true,
                stockCount:  product.stockCount == null ? '' : String(product.stockCount),
                featured:    product.featured    ?? false,
                tag:         product.tag         || '',
            });
            setImgPreview(product.image || '');
        } else {
            setForm(EMPTY_FORM);
            setImgPreview('');
        }
    }, [product]);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    // ── Details array ────────────────────────────────────────────────────────
    const addDetail = () => {
        if (!detailInput.trim()) return;
        set('details', [...form.details, detailInput.trim()]);
        setDetailInput('');
    };

    const removeDetail = (i) =>
        set('details', form.details.filter((_, idx) => idx !== i));

    // ── Sizes toggles ─────────────────────────────────────────────────────────
    const toggleSize = (size) => {
        const current = form.sizes;
        set('sizes', current.includes(size)
            ? current.filter(s => s !== size)
            : [...current, size]);
    };

    // ── Image upload to Supabase Storage ────────────────────────────────────
    const handleImageFile = async (file) => {
        if (!file) return;
        const ext      = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        setUploading(true);
        setImgPreview(URL.createObjectURL(file));

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { upsert: true });

        if (error) {
            toast.error('Image upload failed: ' + error.message);
            setImgPreview(form.image);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path);
            set('image', publicUrl);
            setImgPreview(publicUrl);
            toast.success('Image uploaded');
        }
        setUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.category) {
            toast.error('Name, category, and price are required.');
            return;
        }
        onSave({
            ...form,
            price:    Number(form.price),
            priceUsd: form.priceUsd === '' ? null : Number(form.priceUsd),
        });
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-2xl max-h-[90vh] bg-[#0e0c0a] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                    <div>
                        <p className="text-[9px] tracking-[0.4em] uppercase text-soil-sun/50 font-ui">
                            {product ? 'Edit Product' : 'New Product'}
                        </p>
                        <p className="font-display text-lg text-white tracking-wide mt-0.5">
                            {product ? product.name : 'Add to Collection'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center border border-white/10 text-foreground/40 hover:text-white hover:border-white/30 transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Name + Category row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Product Name *">
                                <input value={form.name} onChange={e => set('name', e.target.value)}
                                    className={inputCls} placeholder="e.g. SOIL Field Jacket" required />
                            </Field>
                            <Field label="Category *">
                                <select value={form.category} onChange={e => set('category', e.target.value)}
                                    className={inputCls}>
                                    {CATEGORY_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Price + Tag row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Price — Naira ₦ *">
                                <input type="number" min="0" step="1" value={form.price}
                                    onChange={e => set('price', e.target.value)}
                                    className={inputCls} placeholder="e.g. 150000" required />
                            </Field>
                            <Field label="Tag">
                                <select value={form.tag} onChange={e => set('tag', e.target.value)}
                                    className={inputCls}>
                                    {TAG_OPTIONS.map(t => (
                                        <option key={t} value={t}>{t || '— None —'}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Optional USD override */}
                        <Field
                            label="USD price (optional)"
                            hint="Leave blank to auto-convert from the Naira price using the exchange rate in Settings. Set a value to fix the exact dollar price for this item."
                        >
                            <input type="number" min="0" step="0.01" value={form.priceUsd}
                                onChange={e => set('priceUsd', e.target.value)}
                                className={inputCls} placeholder="Auto from Naira" />
                        </Field>

                        {/* Description */}
                        <Field label="Description">
                            <textarea value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={3} className={`${inputCls} resize-none`}
                                placeholder="Short product description…" />
                        </Field>

                        {/* Details list */}
                        <Field label="Details (bullet points)">
                            <div className="flex gap-2 mb-2">
                                <input value={detailInput}
                                    onChange={e => setDetailInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDetail())}
                                    className={`${inputCls} flex-1`} placeholder="e.g. 450gsm French terry — press Enter" />
                                <button type="button" onClick={addDetail}
                                    className="w-10 h-10 border border-white/10 flex items-center justify-center text-foreground/40 hover:text-soil-sun hover:border-soil-sun/40 transition-all flex-shrink-0">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {form.details.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-ui text-foreground/50">
                                        <span className="text-soil-sun/40">—</span>
                                        <span className="flex-1">{d}</span>
                                        <button type="button" onClick={() => removeDetail(i)}
                                            className="text-foreground/20 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Field>

                        {/* Sizes */}
                        <Field label="Available Sizes">
                            <div className="flex flex-wrap gap-2">
                                {SIZE_PRESETS[form.category]?.map(size => (
                                    <button key={size} type="button" onClick={() => toggleSize(size)}
                                        className={`px-3 py-1.5 border text-[10px] tracking-[0.2em] uppercase font-ui transition-all duration-200 ${
                                            form.sizes.includes(size)
                                                ? 'border-soil-sun/60 bg-soil-sun/10 text-soil-sun'
                                                : 'border-white/10 text-foreground/35 hover:border-white/25'
                                        }`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* Image upload */}
                        <Field label="Product Image">
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => fileRef.current?.click()}
                                className="relative border border-dashed border-white/15 hover:border-soil-sun/30 transition-colors cursor-pointer rounded-lg overflow-hidden"
                            >
                                {imgPreview ? (
                                    <div className="relative h-40">
                                        <img src={imgPreview} alt="preview"
                                            className="w-full h-full object-cover grayscale" />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-soil-sun animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-32 flex flex-col items-center justify-center gap-2 text-foreground/25">
                                        <Upload className="w-5 h-5" />
                                        <p className="text-[10px] tracking-[0.2em] uppercase font-ui">
                                            Drop image or click to upload
                                        </p>
                                    </div>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                onChange={e => handleImageFile(e.target.files[0])} />
                        </Field>

                        {/* Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Toggle label="In Stock" checked={form.inStock}
                                onChange={v => set('inStock', v)} />
                            <Toggle label="Featured" checked={form.featured}
                                onChange={v => set('featured', v)} />
                        </div>

                        {/* Stock count */}
                        <Field
                            label="Stock Count"
                            hint="Leave blank for unlimited stock. Enter a number to track inventory — auto-decrements after each sale."
                        >
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={form.stockCount}
                                onChange={e => set('stockCount', e.target.value)}
                                className={inputCls}
                                placeholder="Unlimited"
                            />
                        </Field>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-5 py-2.5 border border-white/10 text-[10px] tracking-[0.3em] uppercase font-ui text-foreground/40 hover:text-foreground/70 transition-colors">
                        Cancel
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        type="submit" form="product-form" disabled={saving || uploading}
                        className="px-6 py-2.5 border border-soil-sun/40 bg-soil-sun/10 text-soil-sun text-[10px] tracking-[0.3em] uppercase font-ui hover:bg-soil-sun/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Small helpers ────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-white/[0.04] border border-white/10 text-white text-sm font-ui px-3 py-2.5 outline-none focus:border-soil-sun/40 transition-colors placeholder:text-foreground/20';

function Field({ label, hint, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.32em] uppercase text-foreground/55 font-ui font-medium">
                {label}
            </label>
            {hint && (
                <p className="text-[12px] text-foreground/50 font-ui leading-relaxed">{hint}</p>
            )}
            {children}
        </div>
    );
}

function Toggle({ label, checked, onChange }) {
    return (
        <div className="flex items-center justify-between border border-white/[0.06] px-4 py-3">
            <span className="text-[10px] tracking-[0.3em] uppercase font-ui text-foreground/45">{label}</span>
            <button type="button" onClick={() => onChange(!checked)}
                className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${
                    checked ? 'bg-soil-sun/40' : 'bg-white/10'
                }`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                    checked ? 'left-5 bg-soil-sun' : 'left-0.5 bg-white/30'
                }`} />
            </button>
        </div>
    );
}
