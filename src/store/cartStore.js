import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],
    isOpen: false,

    // ── Cart visibility ──────────────────────────────────────────────────────
    openCart:   () => set({ isOpen: true }),
    closeCart:  () => set({ isOpen: false }),
    toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

    // ── Item management ──────────────────────────────────────────────────────
    addItem: (product, size, quantity = 1) => {
        const { items } = get();
        const key = `${product.id}__${size}`;
        const existing = items.find(i => i.key === key);

        if (existing) {
            set({
                items: items.map(i =>
                    i.key === key ? { ...i, quantity: i.quantity + quantity } : i
                ),
                isOpen: true,
            });
        } else {
            set({
                items: [...items, { key, product, size, quantity }],
                isOpen: true,
            });
        }
    },

    removeItem: (key) => {
        set(s => ({ items: s.items.filter(i => i.key !== key) }));
    },

    updateQuantity: (key, quantity) => {
        if (quantity < 1) {
            get().removeItem(key);
            return;
        }
        set(s => ({
            items: s.items.map(i => i.key === key ? { ...i, quantity } : i),
        }));
    },

    clearCart: () => set({ items: [] }),

    // ── Derived ──────────────────────────────────────────────────────────────
    get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
    },
    get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    },
}));

export default useCartStore;
