import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, RotateCcw, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteSettings, useUpdateSiteSettings, DEFAULT_SETTINGS } from '@/hooks/useSiteSettings';

// Field definitions — drives the entire form.
// Group = section header in the UI. Multiline = textarea instead of input.
const FIELDS = [
    {
        group: 'Home — “What is SOIL”',
        items: [
            {
                key: 'definition_body',
                label: 'Definition body',
                hint: 'The paragraph under "A transformative ecosystem".',
                multiline: true,
            },
            {
                key: 'mission_quote',
                label: 'Mission quote',
                hint: 'The cinematic centered quote. Use \\n for line breaks if needed.',
                multiline: true,
            },
            {
                key: 'philosophy_body',
                label: 'Philosophy paragraph',
                hint: 'The longer "SOIL stays true to its roots…" paragraph.',
                multiline: true,
            },
        ],
    },
    {
        group: 'Studio Hero',
        items: [
            {
                key: 'studio_hero_body',
                label: 'Studio hero subhead',
                hint: 'Appears under "Wear What You Stand For" on the Studio page.',
                multiline: true,
            },
        ],
    },
    {
        group: 'Footer & Brand',
        items: [
            {
                key: 'footer_tagline',
                label: 'Footer tagline',
                hint: 'The italic tagline under the SOIL logo in the footer.',
                multiline: true,
            },
            {
                key: 'shipping_origin',
                label: 'Shipping origin string',
                hint: 'Shown on product pages and the studio trust bar (e.g. "Ships from Lagos, Nigeria").',
            },
        ],
    },
    {
        group: 'Contact & Social',
        items: [
            {
                key: 'contact_email',
                label: 'Public contact email',
                hint: 'The address customers can write to. (Form submissions still land in Messages — this is just for display.)',
                type: 'email',
            },
            {
                key: 'instagram_url',
                label: 'Instagram URL',
                hint: 'Full URL, including https://',
                type: 'url',
            },
            {
                key: 'twitter_url',
                label: 'Twitter / X URL',
                hint: 'Full URL, including https://',
                type: 'url',
            },
        ],
    },
    {
        group: 'Soundtrack (Spotify)',
        intro: 'Up to 3 tracks or playlists for the floating soundtrack player. Leave every URL blank to hide the player entirely. To get a URL: open Spotify → right-click any track, playlist, or album → Share → Copy link. Paste the link as-is — it works for tracks, playlists, or albums.',
        items: [
            {
                key: 'spotify_track_1_label',
                label: 'Track 1 — short name',
                hint: 'Short label shown on the player tab (e.g. "Active", "Roots", "Afro Hits"). Keep under 14 characters.',
            },
            {
                key: 'spotify_track_1_url',
                label: 'Track 1 — Spotify URL',
                hint: 'Paste a Spotify share link (track, playlist, or album).',
                type: 'url',
            },
            {
                key: 'spotify_track_2_label',
                label: 'Track 2 — short name',
                hint: 'Optional. Leave blank if you only want one track.',
            },
            {
                key: 'spotify_track_2_url',
                label: 'Track 2 — Spotify URL',
                hint: 'Optional second track / playlist / album link.',
                type: 'url',
            },
            {
                key: 'spotify_track_3_label',
                label: 'Track 3 — short name',
                hint: 'Optional third option.',
            },
            {
                key: 'spotify_track_3_url',
                label: 'Track 3 — Spotify URL',
                hint: 'Optional third track / playlist / album link.',
                type: 'url',
            },
        ],
    },
];

export default function SettingsTab() {
    const { data: settings, isLoading } = useSiteSettings();
    const updateSettings = useUpdateSiteSettings();

    const [draft, setDraft] = useState(settings || DEFAULT_SETTINGS);
    const [dirty, setDirty] = useState(false);

    // Sync draft when remote data lands (e.g. after first fetch or after save)
    useEffect(() => {
        if (settings && !dirty) setDraft(settings);
    }, [settings, dirty]);

    const update = (key, value) => {
        setDraft(d => ({ ...d, [key]: value }));
        setDirty(true);
    };

    const handleSave = async () => {
        try {
            await updateSettings.mutateAsync(draft);
            setDirty(false);
            toast.success('Site settings saved. Changes are live.');
        } catch (err) {
            toast.error(err.message || 'Save failed.');
        }
    };

    const handleResetField = (key) => {
        setDraft(d => ({ ...d, [key]: DEFAULT_SETTINGS[key] }));
        setDirty(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 text-soil-sun/60 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            {/* Info banner */}
            <div className="mb-8 p-4 rounded-lg border border-soil-sun/20 bg-soil-sun/[0.04] flex gap-3">
                <Info className="w-4 h-4 text-soil-sun/70 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-ui text-sm text-white/80 leading-relaxed">
                        Edit public-facing copy and links across the site. Changes go live immediately after you save — no deploy needed.
                    </p>
                    <p className="font-ui text-xs text-foreground/55 leading-relaxed mt-2">
                        Leave a field empty to use the original default. The site never breaks if a field is blank.
                    </p>
                </div>
            </div>

            {/* Payments & currency — custom controls (toggle + number) */}
            <section className="mb-10">
                <h3 className="text-[11px] tracking-[0.32em] uppercase text-soil-sun font-ui font-semibold mb-3 pb-2 border-b border-white/[0.06]">
                    Payments &amp; Currency
                </h3>
                <p className="text-[13px] text-foreground/65 font-ui leading-relaxed mb-5">
                    The store charges in Naira (₦) by default. Turn on USD to also let customers pay in
                    dollars — this requires USD to be enabled on your Paystack account. The exchange rate
                    converts Naira prices to USD for any product without its own dollar price.
                </p>
                <div className="flex flex-col gap-6">
                    {/* USD toggle */}
                    <div className="flex items-center justify-between border border-white/[0.08] rounded-lg px-4 py-3.5">
                        <div>
                            <p className="text-[12px] tracking-[0.12em] uppercase font-ui font-semibold text-white/85">Enable USD checkout</p>
                            <p className="text-[12px] text-foreground/50 font-ui mt-0.5">Shows the ₦ / $ switcher and lets customers pay in dollars.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => update('usd_checkout_enabled', !(draft.usd_checkout_enabled !== false))}
                            aria-pressed={draft.usd_checkout_enabled !== false}
                            className={`w-11 h-6 rounded-full transition-colors duration-300 relative flex-shrink-0 ${
                                draft.usd_checkout_enabled !== false ? 'bg-soil-sun/50' : 'bg-white/10'
                            }`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${
                                draft.usd_checkout_enabled !== false ? 'left-[22px] bg-soil-sun' : 'left-0.5 bg-white/40'
                            }`} />
                        </button>
                    </div>

                    {/* Exchange rate */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] tracking-[0.22em] uppercase font-ui font-semibold text-white/85">
                            Exchange rate (₦ per $1)
                        </label>
                        <p className="text-[12px] text-foreground/55 font-ui leading-relaxed">
                            e.g. 1600 means a ₦160,000 item shows as $100. Used only when a product has no explicit USD price.
                        </p>
                        <input
                            type="number" min="1" step="1"
                            value={draft.usd_rate ?? 1600}
                            onChange={e => update('usd_rate', e.target.value === '' ? '' : Number(e.target.value))}
                            className="bg-white/[0.03] border border-white/15 rounded-lg px-4 py-3 font-ui text-[15px] text-white outline-none focus:border-soil-sun/50 transition-colors duration-300 max-w-[200px]"
                            placeholder="1600"
                        />
                    </div>
                </div>
            </section>

            {/* Fields */}
            <div className="flex flex-col gap-10">
                {FIELDS.map(({ group, intro, items }) => (
                    <section key={group}>
                        <h3 className="text-[11px] tracking-[0.32em] uppercase text-soil-sun font-ui font-semibold mb-3 pb-2 border-b border-white/[0.06]">
                            {group}
                        </h3>
                        {intro && (
                            <p className="text-[13px] text-foreground/65 font-ui leading-relaxed mb-5">
                                {intro}
                            </p>
                        )}
                        <div className="flex flex-col gap-6">
                            {items.map(({ key, label, hint, multiline, type }) => (
                                <FieldRow
                                    key={key}
                                    label={label}
                                    hint={hint}
                                    multiline={multiline}
                                    type={type}
                                    value={draft[key] ?? ''}
                                    isDefault={draft[key] === DEFAULT_SETTINGS[key]}
                                    onChange={(v) => update(key, v)}
                                    onReset={() => handleResetField(key)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Save bar — sticky at bottom */}
            <div className="sticky bottom-0 -mx-4 md:-mx-6 mt-10 px-4 md:px-6 py-4 bg-[#0a0806]/95 backdrop-blur-md border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-[11px] tracking-[0.2em] uppercase font-ui font-medium text-foreground/55">
                    {dirty ? 'Unsaved changes' : 'All saved'}
                </p>
                <motion.button
                    whileHover={dirty && !updateSettings.isPending ? { scale: 1.01 } : {}}
                    whileTap={dirty && !updateSettings.isPending ? { scale: 0.99 } : {}}
                    onClick={handleSave}
                    disabled={!dirty || updateSettings.isPending}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-soil-sun text-[#0a0806] text-[11px] tracking-[0.3em] uppercase font-ui font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                    {updateSettings.isPending ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving…
                        </>
                    ) : (
                        <>
                            <Save className="w-3.5 h-3.5" />
                            Save changes
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}

// ── Individual field row ───────────────────────────────────────────────────
function FieldRow({ label, hint, multiline, type = 'text', value, isDefault, onChange, onReset }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[11px] tracking-[0.22em] uppercase font-ui font-semibold text-white/85">
                    {label}
                </label>
                {!isDefault && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase font-ui text-foreground/45 hover:text-soil-sun/80 transition-colors"
                        title="Restore the default value"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </div>
            {hint && (
                <p className="text-[12px] text-foreground/55 font-ui leading-relaxed">
                    {hint}
                </p>
            )}
            {multiline ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={3}
                    className="bg-white/[0.03] border border-white/15 rounded-lg px-4 py-3 font-ui text-[15px] text-white outline-none focus:border-soil-sun/50 transition-colors duration-300 placeholder:text-foreground/35 resize-y min-h-[80px]"
                    placeholder="(leave empty for default)"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="bg-white/[0.03] border border-white/15 rounded-lg px-4 py-3 font-ui text-[15px] text-white outline-none focus:border-soil-sun/50 transition-colors duration-300 placeholder:text-foreground/35"
                    placeholder="(leave empty for default)"
                />
            )}
        </div>
    );
}
