import { create } from 'zustand';

const useUIStore = create((set) => ({
    contactOpen: false,
    openContact:  () => set({ contactOpen: true }),
    closeContact: () => set({ contactOpen: false }),

    // Shared visibility of the home-page letterbox bars (0–1). Updated every
    // scroll frame by CinematicOverlay while on Home, reset to 0 on unmount.
    // Navbar reads this to crossfade between its embedded letterbox mode
    // (white bold nav text sitting on the black letterbox bar) and its
    // normal pill mode (rounded, blurred, scroll-driven).
    letterboxOpacity: 0,
    setLetterboxOpacity: (v) => set({ letterboxOpacity: v }),
}));

export default useUIStore;
