import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, RotateCcw, Info, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteSettings, useUpdateSiteSettings, DEFAULT_SETTINGS } from '@/hooks/useSiteSettings';

/**
 * Origin Page tab — lets Duke edit every word on the home (Origin) page, with a
 * live styled preview beside each section so he sees roughly how it will look.
 *
 * It writes to the same `site_settings` row as the Settings tab (via
 * useUpdateSiteSettings), so changes go live immediately, no deploy needed.
 */

// Section definitions: each has editable fields + a Preview renderer that shows
// the draft text styled close to the real page.
const NAR_SYMBOLS = { 1: '✦', 2: '◇', 3: '⬡', 4: '◉', 5: '◈' };

export default function OriginPageTab() {
    const { data: settings, isLoading } = useSiteSettings();
    const updateSettings = useUpdateSiteSettings();

    const [draft, setDraft] = useState(settings || DEFAULT_SETTINGS);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (settings && !dirty) setDraft(settings);
    }, [settings, dirty]);

    const update = (key, value) => { setDraft(d => ({ ...d, [key]: value })); setDirty(true); };
    const resetField = (key) => { setDraft(d => ({ ...d, [key]: DEFAULT_SETTINGS[key] })); setDirty(true); };
    const val = (k) => draft[k] ?? '';

    const handleSave = async () => {
        try {
            // Only send the origin-page keys this tab owns
            const keys = SECTIONS.flatMap(s => s.fields.map(f => f.key));
            const payload = Object.fromEntries(keys.map(k => [k, draft[k]]));
            await updateSettings.mutateAsync(payload);
            setDirty(false);
            toast.success('Origin page updated. Changes are live.');
        } catch (err) {
            toast.error(err.message || 'Save failed.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 text-soil-sun/60 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            {/* Info banner */}
            <div className="mb-8 p-4 rounded-lg border border-soil-sun/20 bg-soil-sun/[0.04] flex gap-3">
                <Info className="w-4 h-4 text-soil-sun/70 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-ui text-sm text-white/80 leading-relaxed">
                        Every word on the home page, top to bottom. The preview on the right shows roughly
                        how each section looks on the live site. Changes go live the moment you save.
                    </p>
                    <p className="font-ui text-xs text-foreground/55 leading-relaxed mt-2">
                        Tip: in headings, press Enter to add a line break exactly where you want it.
                        Leave a field empty to restore its original wording.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-12">
                {SECTIONS.map(section => (
                    <section key={section.id}>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/[0.06]">
                            <h3 className="text-[11px] tracking-[0.32em] uppercase text-soil-sun font-ui font-semibold">
                                {section.title}
                            </h3>
                            {section.note && (
                                <span className="text-[11px] text-foreground/40 font-ui">· {section.note}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Inputs */}
                            <div className="flex flex-col gap-5">
                                {section.fields.map(f => (
                                    <FieldRow
                                        key={f.key}
                                        label={f.label}
                                        hint={f.hint}
                                        multiline={f.multiline}
                                        value={val(f.key)}
                                        isDefault={draft[f.key] === DEFAULT_SETTINGS[f.key]}
                                        onChange={(v) => update(f.key, v)}
                                        onReset={() => resetField(f.key)}
                                    />
                                ))}
                            </div>

                            {/* Live preview */}
                            <div className="lg:sticky lg:top-4 self-start w-full">
                                <div className="flex items-center gap-1.5 mb-2 text-[9px] tracking-[0.3em] uppercase text-foreground/30 font-ui">
                                    <Eye className="w-3 h-3" /> Preview
                                </div>
                                <div className="rounded-xl border border-white/[0.08] bg-[#0a0806] p-6 overflow-hidden">
                                    {section.Preview(val)}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* Save bar */}
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
                    {updateSettings.isPending
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                        : <><Save className="w-3.5 h-3.5" /> Save changes</>}
                </motion.button>
            </div>
        </div>
    );
}

// ── Section + preview definitions ───────────────────────────────────────────
const SECTIONS = [
    {
        id: 'hero',
        title: 'Hero',
        note: 'the opening title screen',
        fields: [
            { key: 'hero_eyebrow',     label: 'Eyebrow line', hint: 'Small line above the SOIL logo.' },
            { key: 'hero_scroll_hint', label: 'Scroll hint',  hint: 'The “scroll to explore” prompt.' },
        ],
        Preview: (v) => (
            <div className="flex flex-col items-center text-center py-6">
                <p className="text-[10px] tracking-[0.4em] uppercase text-soil-sun font-ui font-bold mb-4">{v('hero_eyebrow')}</p>
                <p className="font-display text-5xl text-[#fff6dc] font-black tracking-[0.15em]" style={{ textShadow: '3px 3px 0px rgba(217,160,54,0.3)' }}>SOIL</p>
                <p className="mt-6 text-[10px] tracking-[0.35em] uppercase text-white/55 font-ui">{v('hero_scroll_hint')}</p>
            </div>
        ),
    },
    ...[1, 2, 3, 4, 5].map(n => ({
        id: `nar${n}`,
        title: `Narrative — Chapter ${n}`,
        note: 'cinematic scroll story',
        fields: [
            { key: `nar${n}_label`,   label: 'Label',   hint: 'Small caption above the heading.' },
            { key: `nar${n}_heading`, label: 'Heading', hint: 'The large statement. Enter = line break.', multiline: true },
            { key: `nar${n}_body`,    label: 'Body',    hint: 'The supporting sentence beneath.', multiline: true },
        ],
        Preview: (v) => (
            <div className="py-2">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-soil-sun text-base">{NAR_SYMBOLS[n]}</span>
                    <p className="text-[11px] tracking-[0.4em] uppercase text-soil-sun font-ui font-semibold">{v(`nar${n}_label`)}</p>
                </div>
                <p className="font-ui font-bold text-2xl text-white leading-[1.1] mb-3 whitespace-pre-line tracking-tight">{v(`nar${n}_heading`)}</p>
                <p className="font-ui font-light text-sm text-white/65 leading-relaxed">{v(`nar${n}_body`)}</p>
            </div>
        ),
    })),
    {
        id: 'whatis',
        title: 'What is SOIL',
        note: 'the mission section',
        fields: [
            { key: 'whatis_eyebrow',     label: 'Eyebrow',          hint: 'Small caption (“What is SOIL”).' },
            { key: 'whatis_heading',     label: 'Heading',          hint: 'The large headline.' },
            { key: 'definition_body',    label: 'Definition',       hint: 'Paragraph under the headline.', multiline: true },
            { key: 'mission_quote',      label: 'Mission quote',    hint: 'The centred italic quote.', multiline: true },
            { key: 'philosophy_body',    label: 'Philosophy',       hint: 'The longer roots paragraph.', multiline: true },
            { key: 'whatis_axiom_label', label: 'Axiom label',      hint: 'Caption above the Igbo phrase.' },
            { key: 'whatis_axiom_line1', label: 'Igbo — line 1',    hint: 'First line of the proverb.' },
            { key: 'whatis_axiom_line2', label: 'Igbo — line 2',    hint: 'Second line of the proverb.' },
            { key: 'whatis_translation', label: 'Translation',      hint: 'English meaning beneath.', multiline: true },
        ],
        Preview: (v) => (
            <div className="flex flex-col items-center text-center gap-3 py-2">
                <p className="text-[10px] tracking-[0.4em] uppercase text-soil-sun/60 font-ui font-medium">{v('whatis_eyebrow')}</p>
                <p className="font-display text-2xl text-white/70 leading-tight">{v('whatis_heading')}</p>
                <p className="font-ui text-sm text-foreground/55 leading-relaxed max-w-xs whitespace-pre-line">{v('definition_body')}</p>
                <p className="font-display text-base italic text-soil-sun/75 leading-snug whitespace-pre-line mt-1">{v('mission_quote')}</p>
                <p className="font-ui text-sm text-foreground/55 leading-relaxed max-w-sm whitespace-pre-line">{v('philosophy_body')}</p>
                <p className="text-[10px] tracking-[0.4em] uppercase text-soil-sun/55 font-ui font-medium mt-2">{v('whatis_axiom_label')}</p>
                <p lang="ig" className="font-display text-base text-foreground/60 leading-tight uppercase tracking-[0.12em]">{v('whatis_axiom_line1')}</p>
                <p lang="ig" className="font-display text-base text-foreground/60 leading-tight uppercase tracking-[0.12em]">{v('whatis_axiom_line2')}</p>
                <p className="font-ui text-sm italic text-foreground/60 leading-relaxed max-w-xs mt-1">{v('whatis_translation')}</p>
            </div>
        ),
    },
    {
        id: 'layers',
        title: 'Five Layers',
        note: 'the ecosystem grid header',
        fields: [
            { key: 'layers_heading', label: 'Heading', hint: 'Section title above the five cards.' },
            { key: 'layers_intro',   label: 'Intro',   hint: 'Paragraph beneath the title.', multiline: true },
        ],
        Preview: (v) => (
            <div className="flex flex-col items-center text-center py-4">
                <p className="font-display text-3xl tracking-[0.1em] text-foreground">{v('layers_heading')}</p>
                <p className="mt-4 font-ui text-sm text-foreground/45 max-w-sm leading-relaxed whitespace-pre-line">{v('layers_intro')}</p>
            </div>
        ),
    },
    {
        id: 'seed',
        title: 'Plant Your Seed',
        note: 'the interactive forest',
        fields: [
            { key: 'seed_eyebrow', label: 'Eyebrow', hint: 'Caption between the ✦ marks.' },
            { key: 'seed_heading', label: 'Heading', hint: 'The section title.' },
            { key: 'seed_body',    label: 'Body',    hint: 'The invitation paragraph.', multiline: true },
        ],
        Preview: (v) => (
            <div className="py-2">
                <p className="text-[11px] tracking-[0.38em] uppercase text-soil-sun mb-3 font-ui font-semibold">✦ &nbsp; {v('seed_eyebrow')} &nbsp; ✦</p>
                <p className="font-display text-2xl tracking-[0.08em] text-foreground mb-3 leading-tight">{v('seed_heading')}</p>
                <p className="font-ui text-sm text-foreground/65 leading-relaxed max-w-[280px] whitespace-pre-line">{v('seed_body')}</p>
            </div>
        ),
    },
];

// ── Field row (mirrors the Settings tab style) ─────────────────────────────
function FieldRow({ label, hint, multiline, value, isDefault, onChange, onReset }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-[11px] tracking-[0.22em] uppercase font-ui font-semibold text-white/85">{label}</label>
                {!isDefault && (
                    <button onClick={onReset}
                        className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase font-ui text-foreground/45 hover:text-soil-sun/80 transition-colors"
                        title="Restore the default wording">
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>
            {hint && <p className="text-[12px] text-foreground/55 font-ui leading-relaxed">{hint}</p>}
            {multiline ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
                    className="bg-white/[0.03] border border-white/15 rounded-lg px-4 py-3 font-ui text-[15px] text-white outline-none focus:border-soil-sun/50 transition-colors duration-300 placeholder:text-foreground/35 resize-y min-h-[80px]"
                    placeholder="(leave empty for default)" />
            ) : (
                <input value={value} onChange={e => onChange(e.target.value)}
                    className="bg-white/[0.03] border border-white/15 rounded-lg px-4 py-3 font-ui text-[15px] text-white outline-none focus:border-soil-sun/50 transition-colors duration-300 placeholder:text-foreground/35"
                    placeholder="(leave empty for default)" />
            )}
        </div>
    );
}
