import { create } from 'zustand';

/**
 * Light / dark theme preference.
 *
 * Dark is the brand default (the original cinematic look). Light is opt-in and
 * complements the palette with warm ivory/sand tones. The choice is persisted so
 * it sticks across visits.
 *
 * NOTE: the Home/Origin page and the Admin area are FORCED to dark regardless of
 * this preference — that routing logic lives in <ThemeController> (App.jsx), which
 * is also what actually toggles the `.dark` class on <html>. This store only holds
 * the user's stated preference. The no-flash inline script in index.html reads the
 * same STORAGE_KEY on first paint so there's no light→dark flicker on load.
 */
const STORAGE_KEY = 'soil-theme';

const initial = (() => {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === 'light' ? 'light' : 'dark';
    } catch { return 'dark'; }
})();

const useThemeStore = create((set) => ({
    theme: initial,
    setTheme: (t) => {
        const next = t === 'light' ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
        set({ theme: next });
    },
    toggleTheme: () => set((s) => {
        const next = s.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
        return { theme: next };
    }),
}));

export default useThemeStore;
