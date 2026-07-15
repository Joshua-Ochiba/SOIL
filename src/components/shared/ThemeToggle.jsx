import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/store/themeStore';

/**
 * Light/dark toggle. Shown in the navbar on themeable routes only — Home and
 * Admin are locked to dark (see ThemeController), so the toggle is hidden there.
 */
export default function ThemeToggle({ className = '' }) {
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const isDark = theme === 'dark';

    return (
        <button
            data-hover
            data-magnetic
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`relative flex items-center justify-center w-8 h-8 rounded-sm text-foreground/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${className}`}
        >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
    );
}
