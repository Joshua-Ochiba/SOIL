import { useState, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';

/**
 * Store filter + sort toolbar.
 *
 * Presentational only — Studio.jsx owns the filter state and does the actual
 * filtering/sorting in a useMemo. This component renders:
 *   • Sort dropdown (Featured / Price ↑ / Price ↓ / Newest / Name)
 *   • Dual-thumb price range slider (bounds derived from the catalog)
 *   • Availability segmented control (All / Going Fast)
 *   • Result count + Reset (only when a filter is active)
 *
 * Note: the public store only ever receives in-stock products (sold-out items
 * are hidden upstream), so "Going Fast" surfaces low-stock pieces rather than
 * toggling sold-out visibility.
 */

const SORT_OPTIONS = [
    { id: 'featured',   label: 'Featured' },
    { id: 'price-asc',  label: 'Price: Low → High' },
    { id: 'price-desc', label: 'Price: High → Low' },
    { id: 'newest',     label: 'Newest' },
    { id: 'name',       label: 'Name: A → Z' },
];

export default function StoreControls({
    count,
    sortBy, setSortBy,
    priceBounds, range, setRange,
    availability, setAvailability,
    formatBound = (n) => `₦${Number(n).toLocaleString()}`,
    isFiltered, onReset,
}) {
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);

    // Close the sort menu on outside click / Escape
    useEffect(() => {
        if (!sortOpen) return;
        const onClick = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setSortOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
    }, [sortOpen]);

    const [lo, hi] = priceBounds;
    const span = Math.max(1, hi - lo);
    const minPct = ((range[0] - lo) / span) * 100;
    const maxPct = ((range[1] - lo) / span) * 100;
    const sortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label || 'Featured';

    const setMin = (v) => setRange([Math.min(Number(v), range[1]), range[1]]);
    const setMax = (v) => setRange([range[0], Math.max(Number(v), range[0])]);

    return (
        <div className="flex flex-col gap-5">
            {/* Top row: count · availability · price · sort */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">

                {/* Result count */}
                <div className="flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-accent/60" />
                    {count} {count === 1 ? 'Piece' : 'Pieces'}
                </div>

                {/* Availability segmented control */}
                <div className="flex items-center rounded-xl border border-foreground/12 p-0.5" role="group" aria-label="Availability">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'low', label: 'Going Fast' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setAvailability(opt.id)}
                            aria-pressed={availability === opt.id}
                            className={`px-3.5 py-1.5 rounded-[10px] text-[10px] tracking-[0.22em] uppercase font-ui font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                                availability === opt.id
                                    ? 'bg-accent/12 text-accent'
                                    : 'text-foreground/55 hover:text-foreground/85'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Price range — pushed right on wide screens */}
                <div className="flex items-center gap-3 md:ml-auto">
                    <span className="text-[10px] tracking-[0.28em] uppercase text-foreground/45 font-ui font-medium whitespace-nowrap">
                        {formatBound(range[0])} – {formatBound(range[1])}
                    </span>
                    <div className="dual-range relative w-40 md:w-48" style={{ '--track-fill': '#D9A036' }}>
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[3px] rounded-full bg-foreground/25 dark:bg-foreground/12" />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-accent/70"
                            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                        />
                        <input
                            type="range" min={lo} max={hi} value={range[0]}
                            onChange={(e) => setMin(e.target.value)}
                            aria-label="Minimum price"
                        />
                        <input
                            type="range" min={lo} max={hi} value={range[1]}
                            onChange={(e) => setMax(e.target.value)}
                            aria-label="Maximum price"
                        />
                    </div>
                </div>

                {/* Sort dropdown */}
                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setSortOpen(o => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={sortOpen}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-foreground/15 text-[10px] tracking-[0.22em] uppercase font-ui font-medium text-foreground/75 hover:border-foreground/35 hover:text-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    >
                        <span className="text-foreground/45">Sort</span>
                        <span className="text-accent">{sortLabel}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {sortOpen && (
                        <ul
                            role="listbox"
                            className="absolute right-0 mt-2 z-30 w-[210px] max-w-[calc(100vw-2rem)] rounded-xl border border-foreground/12 bg-card dark:bg-[#0e0c0a]/97 backdrop-blur-md p-1.5 shadow-2xl shadow-black/50"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <li key={opt.id} role="option" aria-selected={sortBy === opt.id}>
                                    <button
                                        onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] tracking-[0.12em] uppercase font-ui transition-colors ${
                                            sortBy === opt.id
                                                ? 'bg-accent/12 text-accent'
                                                : 'text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Reset */}
                {isFiltered && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase font-ui font-medium text-foreground/45 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded"
                    >
                        <X className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            <style>{`
                .dual-range input[type=range] {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0;
                    width: 100%;
                    height: 18px;
                    margin: 0;
                    background: transparent;
                    pointer-events: none;
                    -webkit-appearance: none;
                    appearance: none;
                }
                .dual-range input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    pointer-events: auto;
                    height: 15px;
                    width: 15px;
                    border-radius: 9999px;
                    background: var(--track-fill);
                    border: 2px solid hsl(var(--background));
                    cursor: pointer;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
                }
                .dual-range input[type=range]::-moz-range-thumb {
                    pointer-events: auto;
                    height: 15px;
                    width: 15px;
                    border-radius: 9999px;
                    background: var(--track-fill);
                    border: 2px solid hsl(var(--background));
                    cursor: pointer;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
                }
                .dual-range input[type=range]:focus-visible::-webkit-slider-thumb {
                    outline: 2px solid rgba(217,160,54,0.6);
                    outline-offset: 2px;
                }
            `}</style>
        </div>
    );
}
