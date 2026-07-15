import { usePrice } from '@/hooks/usePrice';

/**
 * Naira / Dollar toggle. Hidden entirely when USD checkout is turned off in
 * Settings, so the store is simply Naira-only until USD is enabled.
 */
export default function CurrencySwitcher({ className = '' }) {
    const { currency, setCurrency, usdEnabled } = usePrice();
    if (!usdEnabled) return null;

    const options = [
        { id: 'NGN', label: '₦ NGN' },
        { id: 'USD', label: '$ USD' },
    ];

    return (
        <div className={`flex items-center rounded-xl border border-foreground/12 p-0.5 ${className}`} role="group" aria-label="Currency">
            {options.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => setCurrency(opt.id)}
                    aria-pressed={currency === opt.id}
                    className={`px-3 py-1.5 rounded-[10px] text-[10px] tracking-[0.18em] uppercase font-ui font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                        currency === opt.id
                            ? 'bg-accent/15 text-accent'
                            : 'text-foreground/55 hover:text-foreground/85'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
