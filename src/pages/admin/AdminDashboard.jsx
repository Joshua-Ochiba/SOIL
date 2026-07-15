import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, LogOut, Edit2, Trash2, AlertTriangle,
    CheckCircle2, XCircle, Package, ShoppingBag,
    ChevronDown, ChevronUp, Mail, Truck, ExternalLink, Settings,
    Users, Download, Copy, Plug, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useAdminOrders, useUpdateOrder } from '@/hooks/useOrders';
import { useAdminMessages } from '@/hooks/useMessages';
import { useNewsletterSubscribers, useDeleteSubscriber } from '@/hooks/useNewsletter';
import ProductForm from '@/components/admin/ProductForm';
import SettingsTab from '@/components/admin/SettingsTab';
import ConnectionsTab from '@/components/admin/ConnectionsTab';
import OriginPageTab from '@/components/admin/OriginPageTab';
import PageMeta from '@/components/shared/PageMeta';

// Currency symbol for order/price displays (NGN is the store's base currency)
const curSym = (c) => (String(c).toUpperCase() === 'USD' ? '$' : '₦');

const CATEGORY_LABEL = {
    attire:       'Attire',
    artifacts:    'Artifacts',
    collectibles: 'Collectibles',
};

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   color: 'text-amber-400/80',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30' },
    paid:      { label: 'Paid',      color: 'text-blue-400/80',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30' },
    fulfilled: { label: 'Fulfilled', color: 'text-green-400/80',   bg: 'bg-green-400/10',   border: 'border-green-400/30' },
    shipped:   { label: 'Shipped',   color: 'text-purple-400/80',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30' },
    cancelled: { label: 'Cancelled', color: 'text-red-400/70',     bg: 'bg-red-400/10',     border: 'border-red-400/30' },
};

const STATUS_FLOW = ['pending', 'paid', 'fulfilled', 'shipped', 'cancelled'];

export default function AdminDashboard() {
    const { user, signOut } = useAuth();
    const [tab, setTab]     = useState('products');
    const { data: messages = [] } = useAdminMessages();

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/admin';
    };

    return (
        <div className="min-h-screen bg-[#0a0806] text-foreground">
            <PageMeta title="Admin Dashboard — SOIL" noindex />

            {/* Header */}
            <header className="border-b border-white/[0.06] px-4 md:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-display text-lg tracking-[0.25em] text-[#fff6dc] font-black"
                          style={{ textShadow: '2px 2px 0px rgba(217,160,54,0.4)' }}>SOIL</span>
                    <span className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui border-l border-white/[0.06] pl-4 hidden sm:inline">
                        Studio Admin
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-foreground/30 font-ui hidden md:block">{user?.email}</span>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-ui text-foreground/30 hover:text-foreground/70 transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden md:block">Log out</span>
                    </button>
                </div>
            </header>

            {/* Tab bar — horizontally scrollable on mobile so every tab is reachable */}
            <div className="border-b border-white/[0.06] px-4 md:px-6 overflow-x-auto admin-tabs-scroll">
                <div className="flex gap-0 w-max md:w-auto">
                    {[
                        { id: 'products',    label: 'Products',    icon: Package },
                        { id: 'orders',      label: 'Orders',      icon: ShoppingBag },
                        { id: 'messages',    label: 'Messages',    icon: Mail, badge: messages.length },
                        { id: 'subscribers', label: 'Subscribers', icon: Users },
                        { id: 'origin',      label: 'Origin Page', icon: FileText },
                        { id: 'settings',    label: 'Settings',    icon: Settings },
                        { id: 'setup',       label: 'Setup',       icon: Plug },
                    ].map(({ id, label, icon: Icon, badge }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 md:px-5 py-4 text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase font-ui border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                                tab === id
                                    ? 'border-soil-sun text-soil-sun'
                                    : 'border-transparent text-foreground/35 hover:text-foreground/60'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            {label}
                            {badge > 0 && (
                                <span className="ml-0.5 w-4 h-4 rounded-full bg-soil-sun/20 border border-soil-sun/30 text-soil-sun text-[8px] flex items-center justify-center font-ui flex-shrink-0">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <style>{`
                    .admin-tabs-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                    .admin-tabs-scroll::-webkit-scrollbar { display: none; }
                `}</style>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {tab === 'products'    ? <ProductsTab />
                    : tab === 'orders'      ? <OrdersTab />
                    : tab === 'messages'    ? <MessagesTab />
                    : tab === 'subscribers' ? <SubscribersTab />
                    : tab === 'origin'      ? <OriginPageTab />
                    : tab === 'setup'       ? <ConnectionsTab />
                    : <SettingsTab />}
            </div>
        </div>
    );
}

// ── Products tab (existing logic) ─────────────────────────────────────────────
function ProductsTab() {
    const { data: products = [], isLoading } = useAdminProducts();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const [formOpen, setFormOpen]           = useState(false);
    const [editProduct, setEditProduct]     = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filterCat, setFilterCat]         = useState('all');
    const [search, setSearch]               = useState('');

    const openNew  = () => { setEditProduct(null); setFormOpen(true); };
    const openEdit = (p) => { setEditProduct(p);   setFormOpen(true); };

    const handleSave = async (formData) => {
        try {
            if (editProduct) {
                await updateProduct.mutateAsync({ id: editProduct.id, ...formData });
                toast.success('Product updated.');
            } else {
                const id = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
                await createProduct.mutateAsync({ id, ...formData });
                toast.success('Product added to the store.');
            }
            setFormOpen(false);
        } catch (err) {
            toast.error(err.message || 'Something went wrong.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct.mutateAsync(id);
            toast.success('Product removed.');
            setDeleteConfirm(null);
        } catch (err) {
            toast.error(err.message || 'Delete failed.');
        }
    };

    const visible = products.filter(p => {
        const matchCat = filterCat === 'all' || p.category === filterCat;
        const matchQ   = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchQ;
    });

    const inStock  = products.filter(p => p.inStock).length;
    const featured = products.filter(p => p.featured).length;
    const saving   = createProduct.isPending || updateProduct.isPending;

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Stat label="Total Products" value={products.length} />
                <Stat label="In Stock"        value={inStock} accent />
                <Stat label="Featured"        value={featured} />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products…"
                        className="bg-white/[0.04] border border-white/10 text-white text-sm font-ui px-4 py-2.5 outline-none focus:border-soil-sun/30 transition-colors placeholder:text-foreground/20 flex-1 rounded-lg"
                    />
                    <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2.5 border border-soil-sun/40 bg-soil-sun/10 text-soil-sun text-[10px] tracking-[0.3em] uppercase font-ui hover:bg-soil-sun/20 transition-all rounded-lg flex-shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </motion.button>
                </div>
                <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto">
                    <div className="flex gap-2 w-max md:w-auto">
                        {['all', 'attire', 'artifacts', 'collectibles'].map(c => (
                            <button key={c} onClick={() => setFilterCat(c)}
                                className={`px-3 py-2 border text-[9px] tracking-[0.25em] uppercase font-ui transition-all duration-200 rounded-lg whitespace-nowrap ${
                                    filterCat === c
                                        ? 'border-soil-sun/50 bg-soil-sun/10 text-soil-sun'
                                        : 'border-white/10 text-foreground/35 hover:border-white/20'
                                }`}>
                                {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product list */}
            {isLoading ? (
                <div className="text-center py-20 text-foreground/25 font-ui text-sm">Loading products…</div>
            ) : visible.length === 0 ? (
                <div className="text-center py-20 text-foreground/20 font-ui text-sm">
                    {search ? 'No products match your search.' : 'No products yet — add your first one above.'}
                </div>
            ) : (
                <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                    {/* Desktop header */}
                    <div className="hidden md:grid grid-cols-[56px_1fr_110px_80px_70px_90px_88px] gap-4 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                        {['', 'Name', 'Category', 'Price', 'Tag', 'Stock', ''].map((h, i) => (
                            <span key={i} className="text-[8px] tracking-[0.4em] uppercase text-foreground/25 font-ui">{h}</span>
                        ))}
                    </div>
                    <AnimatePresence initial={false}>
                        {visible.map(p => (
                            <motion.div key={p.id} layout
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                            >
                                {/* Mobile card */}
                                <div className="md:hidden flex items-start gap-3 px-4 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <div className="w-14 h-16 rounded-lg overflow-hidden border border-white/[0.06] flex-shrink-0">
                                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full bg-white/[0.04]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-display text-sm text-white tracking-wide truncate">{p.name}</p>
                                        <p className="text-[9px] tracking-[0.2em] uppercase text-foreground/35 font-ui mt-0.5">{CATEGORY_LABEL[p.category]}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="font-ui text-sm text-soil-sun/80">₦{Number(p.price).toLocaleString()}</span>
                                            {p.tag && <span className="text-[9px] tracking-[0.2em] uppercase text-soil-sun/60 font-ui">{p.tag}</span>}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <button onClick={() => updateProduct.mutate({ id: p.id, ...p, inStock: !p.inStock })}
                                                className="flex items-center gap-1.5 text-[9px] font-ui transition-colors">
                                                {p.inStock
                                                    ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500/70" /><span className="text-green-500/70">In Stock</span></>
                                                    : <><XCircle className="w-3.5 h-3.5 text-red-400/50" /><span className="text-red-400/50">Out of Stock</span></>}
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg text-foreground/30 hover:text-soil-sun hover:border-soil-sun/30 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setDeleteConfirm(p.id)} className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg text-foreground/30 hover:text-red-400 hover:border-red-400/30 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Desktop row */}
                                <div className="hidden md:grid grid-cols-[56px_1fr_110px_80px_70px_90px_88px] gap-4 items-center px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <div className="w-12 h-14 overflow-hidden border border-white/[0.06] flex-shrink-0">
                                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full bg-white/[0.04]" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-display text-sm text-white tracking-wide truncate">{p.name}</p>
                                    </div>
                                    <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/35 font-ui">{CATEGORY_LABEL[p.category]}</span>
                                    <span className="font-ui text-sm text-soil-sun/80">₦{Number(p.price).toLocaleString()}</span>
                                    <span className={`text-[9px] tracking-[0.2em] uppercase font-ui ${p.tag ? 'text-soil-sun/70' : 'text-foreground/20'}`}>{p.tag || '—'}</span>
                                    <button onClick={() => updateProduct.mutate({ id: p.id, ...p, inStock: !p.inStock })}
                                        className="flex items-center gap-1.5 text-[9px] font-ui transition-colors hover:opacity-70">
                                        {p.inStock
                                            ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500/70" /><span className="text-green-500/70">In Stock</span></>
                                            : <><XCircle className="w-3.5 h-3.5 text-red-400/50" /><span className="text-red-400/50">Out</span></>}
                                    </button>
                                    <div className="flex items-center gap-2 justify-end">
                                        <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center border border-white/10 text-foreground/30 hover:text-soil-sun hover:border-soil-sun/30 transition-all"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => setDeleteConfirm(p.id)} className="w-7 h-7 flex items-center justify-center border border-white/10 text-foreground/30 hover:text-red-400 hover:border-red-400/30 transition-all"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Product form modal */}
            <AnimatePresence>
                {formOpen && (
                    <ProductForm product={editProduct} onSave={handleSave}
                        onClose={() => setFormOpen(false)} saving={saving} />
                )}
            </AnimatePresence>

            {/* Delete confirmation */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80" onClick={() => setDeleteConfirm(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-[#0e0c0a] border border-white/[0.07] rounded-xl p-6 w-full max-w-sm text-center">
                            <AlertTriangle className="w-8 h-8 text-red-400/70 mx-auto mb-4" />
                            <p className="font-display text-base text-white mb-2">Remove this product?</p>
                            <p className="font-ui text-xs text-foreground/40 mb-6">This will permanently delete it from the store.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 border border-white/10 text-[10px] tracking-[0.3em] uppercase font-ui text-foreground/40 hover:text-foreground/70 transition-colors rounded-lg">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 py-2.5 border border-red-400/30 bg-red-400/10 text-red-400 text-[10px] tracking-[0.3em] uppercase font-ui hover:bg-red-400/20 transition-all rounded-lg">
                                    {deleteProduct.isPending ? 'Removing…' : 'Remove'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

// ── Orders tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
    const { data: orders = [], isLoading } = useAdminOrders();
    const updateOrder = useUpdateOrder();
    const [expanded, setExpanded] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const visible = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const counts = STATUS_FLOW.reduce((acc, s) => {
        acc[s] = orders.filter(o => o.status === s).length;
        return acc;
    }, {});

    const handleStatus = async (id, status) => {
        try {
            await updateOrder.mutateAsync({ id, status });
            toast.success(`Order marked as ${STATUS_CONFIG[status].label}.`);
        } catch {
            toast.error('Failed to update status.');
        }
    };

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                <Stat label="Total Orders" value={orders.length} />
                <Stat label="Pending"   value={counts.pending}   warn={counts.pending > 0} />
                <Stat label="Paid"      value={counts.paid}      accent />
                <Stat label="Fulfilled" value={counts.fulfilled} />
                <Stat label="Shipped"   value={counts.shipped} />
            </div>

            {/* Status filter */}
            <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto mb-6">
                <div className="flex gap-2 w-max md:w-auto">
                    {['all', ...STATUS_FLOW].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 border text-[9px] tracking-[0.25em] uppercase font-ui transition-all duration-200 rounded-lg whitespace-nowrap ${
                                statusFilter === s
                                    ? 'border-soil-sun/50 bg-soil-sun/10 text-soil-sun'
                                    : 'border-white/10 text-foreground/35 hover:border-white/20'
                            }`}>
                            {s === 'all' ? `All (${orders.length})` : `${STATUS_CONFIG[s].label} (${counts[s]})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order list */}
            {isLoading ? (
                <div className="text-center py-20 text-foreground/25 font-ui text-sm">Loading orders…</div>
            ) : visible.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingBag className="w-10 h-10 text-foreground/10 mx-auto mb-4" />
                    <p className="font-ui text-sm text-foreground/20">
                        {statusFilter === 'all' ? 'No orders yet.' : `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} orders.`}
                    </p>
                </div>
            ) : (
                <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                    <AnimatePresence initial={false}>
                        {visible.map(order => {
                            const cfg       = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const isOpen    = expanded === order.id;
                            const shortId   = order.id.slice(-8).toUpperCase();
                            const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                            const date      = new Date(order.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            });

                            return (
                                <motion.div key={order.id} layout
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                                    className="border-b border-white/[0.04] last:border-0"
                                >
                                    {/* Row */}
                                    <div
                                        className="flex items-center gap-3 px-4 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        onClick={() => setExpanded(isOpen ? null : order.id)}
                                    >
                                        {/* Order ID + date */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className="font-ui text-sm text-white tracking-wide">#{shortId}</p>
                                                <span className={`px-2 py-0.5 rounded-full border text-[8px] tracking-[0.2em] uppercase font-ui ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-foreground/30 font-ui mt-0.5">
                                                {date} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                {order.customer_email && ` · ${order.customer_email}`}
                                            </p>
                                        </div>

                                        {/* Total */}
                                        <p className="font-display text-base text-soil-sun/80 flex-shrink-0">
                                            {curSym(order.currency)}{Number(order.total).toLocaleString()}
                                        </p>

                                        {/* Expand toggle */}
                                        <div className="text-foreground/25 flex-shrink-0">
                                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {/* Expanded detail */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-5 flex flex-col gap-5 border-t border-white/[0.04]">

                                                    {/* Items */}
                                                    <div className="pt-4">
                                                        <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui mb-3">Items</p>
                                                        <div className="flex flex-col gap-3">
                                                            {Array.isArray(order.items) && order.items.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-3">
                                                                    {item.image && (
                                                                        <div className="w-10 h-12 rounded-lg overflow-hidden border border-white/[0.06] flex-shrink-0">
                                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-display text-sm text-white truncate">{item.name}</p>
                                                                        <p className="text-[9px] tracking-[0.2em] uppercase text-foreground/35 font-ui">
                                                                            {item.size} · Qty {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-ui text-sm text-soil-sun/70 flex-shrink-0">
                                                                        {curSym(order.currency)}{(item.price * item.quantity).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Customer info (populated by the Paystack webhook) */}
                                                    {(order.customer_email || order.shipping_address) && (
                                                        <div>
                                                            <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui mb-2">Customer</p>
                                                            {order.customer_email && (
                                                                <p className="font-ui text-sm text-foreground/60">{order.customer_name || '—'} · {order.customer_email}</p>
                                                            )}
                                                            {order.shipping_address && (
                                                                <p className="font-ui text-xs text-foreground/35 mt-1">
                                                                    {[
                                                                        order.shipping_address.line1,
                                                                        order.shipping_address.city,
                                                                        order.shipping_address.country,
                                                                    ].filter(Boolean).join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Tracking */}
                                                    <TrackingSection order={order} updateOrder={updateOrder} />

                                                    {/* Status actions */}
                                                    <div>
                                                        <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui mb-3">Update Status</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {STATUS_FLOW.filter(s => s !== order.status).map(s => {
                                                                const c = STATUS_CONFIG[s];
                                                                return (
                                                                    <button key={s}
                                                                        onClick={() => handleStatus(order.id, s)}
                                                                        disabled={updateOrder.isPending}
                                                                        className={`px-3 py-1.5 rounded-lg border text-[9px] tracking-[0.2em] uppercase font-ui transition-all duration-200 ${c.color} ${c.bg} ${c.border} hover:opacity-80 disabled:opacity-40`}
                                                                    >
                                                                        → {c.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Paystack reference */}
                                                    {order.paystack_reference && (
                                                        <a
                                                            href="https://dashboard.paystack.com/#/transactions"
                                                            target="_blank" rel="noopener noreferrer"
                                                            title={`Ref: ${order.paystack_reference}`}
                                                            className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase font-ui text-foreground/25 hover:text-soil-sun/60 transition-colors"
                                                        >
                                                            View in Paystack ({order.paystack_reference.slice(-8)})
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}

// ── Messages tab ─────────────────────────────────────────────────────────────
function MessagesTab() {
    const { data: messages = [], isLoading } = useAdminMessages();
    const [expanded, setExpanded] = useState(null);

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <Stat label="Total Messages" value={messages.length} />
                <Stat label="Latest"
                    value={messages.length > 0
                        ? new Date(messages[0].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '—'}
                />
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-foreground/25 font-ui text-sm">Loading messages…</div>
            ) : messages.length === 0 ? (
                <div className="text-center py-20">
                    <Mail className="w-10 h-10 text-foreground/10 mx-auto mb-4" />
                    <p className="font-ui text-sm text-foreground/20">No messages yet. They'll show up here when someone fills in the contact form.</p>
                </div>
            ) : (
                <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                    <AnimatePresence initial={false}>
                        {messages.map(msg => {
                            const isOpen = expanded === msg.id;
                            const date   = new Date(msg.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            });
                            const time = new Date(msg.created_at).toLocaleTimeString('en-GB', {
                                hour: '2-digit', minute: '2-digit',
                            });

                            return (
                                <motion.div key={msg.id} layout
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                                    className="border-b border-white/[0.04] last:border-0"
                                >
                                    {/* Row */}
                                    <div
                                        className="flex items-center gap-3 px-4 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        onClick={() => setExpanded(isOpen ? null : msg.id)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-soil-sun/10 border border-soil-sun/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-soil-sun/70 text-[11px] font-display uppercase">
                                                {msg.name?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-ui text-sm text-white truncate">{msg.name}</p>
                                            <p className="text-[10px] text-foreground/30 font-ui truncate">{msg.email}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[10px] text-foreground/25 font-ui">{date}</p>
                                            <p className="text-[9px] text-foreground/15 font-ui">{time}</p>
                                        </div>
                                        <div className="text-foreground/25 flex-shrink-0">
                                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {/* Expanded */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-5 pt-3 border-t border-white/[0.04]">
                                                    <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui mb-2">Message</p>
                                                    <p className="font-ui text-sm text-foreground/60 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    <div className="mt-4 flex gap-3 flex-wrap">
                                                        <a
                                                            href={`mailto:${msg.email}?subject=Re: Your message to SOIL`}
                                                            className="flex items-center gap-2 px-4 py-2 border border-soil-sun/25 bg-soil-sun/5 rounded-lg text-soil-sun text-[9px] tracking-[0.25em] uppercase font-ui hover:bg-soil-sun/15 transition-all duration-200"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                            Reply to {msg.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}

// ── Subscribers tab ───────────────────────────────────────────────────────────
function SubscribersTab() {
    const { data: subs = [], isLoading } = useNewsletterSubscribers();
    const deleteSub = useDeleteSubscriber();
    const [search, setSearch] = useState('');

    const filtered = subs.filter(s =>
        !search || s.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleCopyAll = async () => {
        const emails = subs.map(s => s.email).join(', ');
        await navigator.clipboard.writeText(emails);
        toast.success(`${subs.length} email${subs.length === 1 ? '' : 's'} copied.`);
    };

    const handleExportCsv = () => {
        const rows = [
            ['email', 'source', 'subscribed_at'],
            ...subs.map(s => [
                s.email,
                s.source || '',
                new Date(s.created_at).toISOString(),
            ]),
        ];
        const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soil-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('CSV downloaded.');
    };

    const handleDelete = async (sub) => {
        if (!window.confirm(`Remove ${sub.email} from the list?`)) return;
        try {
            await deleteSub.mutateAsync(sub.id);
            toast.success('Removed.');
        } catch (err) {
            toast.error(err.message || 'Could not remove.');
        }
    };

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Stat label="Total Subscribers" value={subs.length} accent={subs.length > 0} />
                <Stat label="This Week" value={subs.filter(s => Date.now() - new Date(s.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length} />
                <Stat label="This Month" value={subs.filter(s => Date.now() - new Date(s.created_at).getTime() < 30 * 24 * 60 * 60 * 1000).length} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by email…"
                    className="bg-white/[0.04] border border-white/10 text-white text-sm font-ui px-4 py-2.5 outline-none focus:border-soil-sun/30 transition-colors placeholder:text-foreground/35 flex-1 rounded-lg"
                />
                <button
                    onClick={handleCopyAll}
                    disabled={subs.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-foreground/75 text-[10px] tracking-[0.3em] uppercase font-ui hover:border-white/30 hover:text-white transition-all rounded-lg flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                    title="Copy every subscriber email, comma-separated"
                >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy All</span>
                </button>
                <button
                    onClick={handleExportCsv}
                    disabled={subs.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 border border-soil-sun/40 bg-soil-sun/10 text-soil-sun text-[10px] tracking-[0.3em] uppercase font-ui hover:bg-soil-sun/20 transition-all rounded-lg flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="py-16 text-center text-foreground/45 font-ui text-sm">Loading subscribers…</div>
            ) : subs.length === 0 ? (
                <div className="py-16 text-center">
                    <Users className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
                    <p className="font-ui text-base text-foreground/60">No subscribers yet.</p>
                    <p className="font-ui text-sm text-foreground/40 mt-1">When someone joins via the footer form, they'll show up here.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center font-ui text-sm text-foreground/45">No emails match "{search}".</div>
            ) : (
                <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="hidden sm:grid grid-cols-[1fr_140px_180px_80px] gap-4 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                        <span className="text-[10px] tracking-[0.28em] uppercase font-ui font-semibold text-foreground/55">Email</span>
                        <span className="text-[10px] tracking-[0.28em] uppercase font-ui font-semibold text-foreground/55">From Page</span>
                        <span className="text-[10px] tracking-[0.28em] uppercase font-ui font-semibold text-foreground/55">Subscribed</span>
                        <span className="text-[10px] tracking-[0.28em] uppercase font-ui font-semibold text-foreground/55 text-right">Actions</span>
                    </div>
                    {filtered.map((sub) => (
                        <div key={sub.id}
                            className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_140px_180px_80px] gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="font-ui text-sm text-white truncate">{sub.email}</p>
                                <p className="sm:hidden text-[10px] tracking-[0.2em] uppercase font-ui text-foreground/45 mt-0.5">
                                    {sub.source || '—'} · {new Date(sub.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="hidden sm:block font-ui text-xs text-foreground/55 truncate">
                                {sub.source || '—'}
                            </p>
                            <p className="hidden sm:block font-ui text-xs text-foreground/55">
                                {new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleDelete(sub)}
                                    className="w-7 h-7 flex items-center justify-center text-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-md"
                                    title="Remove subscriber"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

// ── Tracking section (inside expanded order) ──────────────────────────────────
const CARRIERS = ['DHL', 'UPS', 'FedEx', 'GIGL', 'Sendbox', 'Other'];

function TrackingSection({ order, updateOrder }) {
    const hasTracking = order.tracking_number && order.tracking_carrier;
    const [editing,  setEditing]  = useState(!hasTracking);
    const [carrier,  setCarrier]  = useState(order.tracking_carrier || '');
    const [number,   setNumber]   = useState(order.tracking_number  || '');
    const [saving,   setSaving]   = useState(false);

    const handleSave = async () => {
        if (!carrier || !number.trim()) {
            toast.error('Select a carrier and enter a tracking number.');
            return;
        }
        setSaving(true);
        try {
            await updateOrder.mutateAsync({
                id: order.id,
                tracking_carrier: carrier,
                tracking_number:  number.trim(),
                // Auto-advance status to 'shipped' when tracking is added
                ...(order.status !== 'shipped' && order.status !== 'cancelled'
                    ? { status: 'shipped' }
                    : {}),
            });
            toast.success('Tracking saved — order marked as shipped.');
            setEditing(false);
        } catch {
            toast.error('Failed to save tracking.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui mb-3 flex items-center gap-2">
                <Truck className="w-3 h-3" />
                Tracking
            </p>

            {hasTracking && !editing ? (
                /* Read-only view */
                <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <div>
                        <p className="font-ui text-sm text-white">
                            {order.tracking_carrier}
                            <span className="text-foreground/40 mx-2">·</span>
                            <span className="tracking-wider">{order.tracking_number}</span>
                        </p>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-foreground/25 font-ui mt-0.5">
                            Tracking added
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => {
                                setCarrier(order.tracking_carrier);
                                setNumber(order.tracking_number);
                                setEditing(true);
                            }}
                            className="text-[9px] tracking-[0.2em] uppercase font-ui text-foreground/30 hover:text-soil-sun/70 transition-colors"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            ) : (
                /* Edit form */
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Carrier select */}
                    <select
                        value={carrier}
                        onChange={e => setCarrier(e.target.value)}
                        className="bg-white/[0.04] border border-white/10 text-white text-[11px] font-ui px-3 py-2.5 outline-none focus:border-soil-sun/30 transition-colors rounded-lg sm:w-36 flex-shrink-0 appearance-none cursor-pointer"
                    >
                        <option value="" disabled className="bg-[#0e0c0a]">Carrier</option>
                        {CARRIERS.map(c => (
                            <option key={c} value={c} className="bg-[#0e0c0a]">{c}</option>
                        ))}
                    </select>

                    {/* Tracking number */}
                    <input
                        type="text"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        placeholder="Tracking number"
                        className="flex-1 bg-white/[0.04] border border-white/10 text-white text-[11px] font-ui px-3 py-2.5 outline-none focus:border-soil-sun/30 transition-colors placeholder:text-foreground/20 rounded-lg tracking-wider"
                    />

                    {/* Save */}
                    <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={handleSave}
                        disabled={saving || !carrier || !number.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-purple-400/30 bg-purple-400/10 text-purple-400 text-[9px] tracking-[0.25em] uppercase font-ui hover:bg-purple-400/20 transition-all rounded-lg flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {saving ? (
                            <><span className="w-3 h-3 border border-purple-400/60 border-t-transparent rounded-full animate-spin" />Saving…</>
                        ) : (
                            <><Truck className="w-3 h-3" />Save &amp; Ship</>
                        )}
                    </motion.button>

                    {/* Cancel edit (only if tracking already exists) */}
                    {hasTracking && (
                        <button onClick={() => setEditing(false)}
                            className="text-[9px] font-ui text-foreground/25 hover:text-foreground/50 transition-colors px-2">
                            ✕
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Shared stat card ──────────────────────────────────────────────────────────
function Stat({ label, value, accent, warn }) {
    return (
        <div className="border border-white/[0.06] px-4 py-4 rounded-xl">
            <p className="text-[9px] tracking-[0.4em] uppercase text-foreground/25 font-ui mb-1">{label}</p>
            <p className={`font-display text-2xl ${warn ? 'text-amber-400/80' : accent ? 'text-green-400/80' : 'text-white'}`}>
                {value}
            </p>
        </div>
    );
}
