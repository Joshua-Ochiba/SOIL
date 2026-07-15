import { useLocation } from 'react-router-dom';
import useThemeStore from '@/store/themeStore';

/**
 * The EFFECTIVE theme — mirrors ThemeController's logic (App.jsx). Home (/) and
 * Admin (/admin*) are always dark regardless of the user's preference; every
 * other route follows the stored theme. Use this (not the raw store value) for
 * anything that must match what's actually painted — e.g. the dust-particle
 * atmosphere, which is exclusive to dark mode.
 */
export default function useIsDark() {
    const theme = useThemeStore((s) => s.theme);
    const { pathname } = useLocation();
    return pathname === '/' || pathname.startsWith('/admin') || theme === 'dark';
}
