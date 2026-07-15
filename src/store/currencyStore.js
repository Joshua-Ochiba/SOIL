import { create } from 'zustand';

/**
 * Which currency the shopper is browsing/paying in.
 *
 * NGN (Naira) is the store's base currency and the default. USD is offered as an
 * option (see Admin → Settings → Payments & Currency). The choice is persisted so
 * it sticks across visits.
 */
const STORAGE_KEY = 'soil_currency';

const initial = (() => {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === 'USD' ? 'USD' : 'NGN';
    } catch { return 'NGN'; }
})();

const useCurrencyStore = create((set) => ({
    currency: initial,
    setCurrency: (c) => {
        const next = c === 'USD' ? 'USD' : 'NGN';
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
        set({ currency: next });
    },
}));

export default useCurrencyStore;
