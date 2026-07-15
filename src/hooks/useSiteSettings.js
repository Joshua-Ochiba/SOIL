import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Defaults — these match what's currently hardcoded on the live site ──
// These are the fallback values rendered if Supabase is unreachable, the
// `site_settings` row is missing, or a specific field is null/empty.
// Never delete these — they're the safety net.
export const DEFAULT_SETTINGS = {
    // Home — "What is SOIL"
    definition_body:    'A living, rooted system of ideas, people, projects and values — connected by one purpose.',
    mission_quote:      '"To cultivate sustainable solutions\nfor Africa and the World."',
    philosophy_body:    'SOIL stays true to its roots — drawing ancient wisdom from African heritage, cultivating a lens that life is a journey, a cycle of growth that enriches the soil for the next seed.',

    // Studio hero
    studio_hero_body:   'Culturally rooted. Intentionally made. Every piece carries a story that started long before you were born.',

    // Footer / brand
    footer_tagline:     '"Cultivating the future through ancestral wisdom and modern intelligence."',
    shipping_origin:    'Ships from Lagos, Nigeria',

    // Contact + social
    contact_email:      'hello@soil.land',
    instagram_url:      'https://instagram.com',
    twitter_url:        'https://x.com',

    // Spotify soundtrack — paste Spotify share links (track, playlist, or album).
    // Leave empty to hide that slot from the player. If all three are empty,
    // the floating player doesn't render at all.
    spotify_track_1_label: '',
    spotify_track_1_url:   '',
    spotify_track_2_label: '',
    spotify_track_2_url:   '',
    spotify_track_3_label: '',
    spotify_track_3_url:   '',

    // ── Payments & currency ──────────────────────────────────────────────────
    // Naira is the base currency. usd_checkout_enabled shows the ₦/$ switcher and
    // allows USD checkout (requires USD enabled on the Paystack account).
    // usd_rate converts Naira prices to USD when a product has no explicit USD price.
    usd_checkout_enabled: true,
    usd_rate:             1600,

    // ── Origin (home) page copy — edited in Admin → Origin Page ──────────────
    // Hero
    hero_eyebrow:      'Sons & Daughters of the Indigenous Land',
    hero_scroll_hint:  'Scroll to explore',
    // Cinematic narrative chapters (scroll story)
    nar1_label:   'The Eagle',
    nar1_heading: 'From the highest vantage,\nit all begins.',
    nar1_body:    'Before the journey, there is perspective. The eagle sees what others cannot — the full landscape of what is possible.',
    nar2_label:   'The Flight',
    nar2_heading: 'Roots reach\nbefore they rise.',
    nar2_body:    'SOIL anchors itself in African indigenous knowledge, memory, and wisdom — the invisible infrastructure of our future.',
    nar3_label:   'The Seed',
    nar3_heading: 'Everything begins\nin the soil.',
    nar3_body:    'Small. Dense. Full of potential. Waiting to be met by the right conditions. The seed does not rush its own becoming.',
    nar4_label:   'The Root',
    nar4_heading: 'Growth is not instant.\nIt is earned.',
    nar4_body:    'Through patience, pressure, and purpose — something new breaks through. Innovation shaped by culture.',
    nar5_label:   'The Fruit',
    nar5_heading: 'We cultivate\nfor future generations.',
    nar5_body:    'The measure of a tree is not its height — it is the shade it provides for those who come after. SOIL builds for what endures.',
    // "What is SOIL" section
    whatis_eyebrow:     'What is SOIL',
    whatis_heading:     'A transformative ecosystem',
    whatis_axiom_label: 'At its core',
    whatis_axiom_line1: 'IJE DI MKPA KARIA EBE A NA-AGA',
    whatis_axiom_line2: 'NA ONYE I GA-ABU IHE KACHA MKPA',
    whatis_translation: '"The journey is more important than the destination — and who you become matters most."',
    // Five Layers section header
    layers_heading: 'Five Layers',
    layers_intro:   'An interconnected network where each part feeds the other. Culture drives innovation. Innovation funds research. Research strengthens culture.',
    // Plant Your Seed
    seed_eyebrow: 'Your Forest',
    seed_heading: 'Plant Your Seed',
    seed_body:    'Leave your name or an intention. It grows here — yours alone, each time you return.',
};

// Merge fetched data with defaults — any null/empty string falls back to default
function mergeWithDefaults(row) {
    if (!row) return DEFAULT_SETTINGS;
    const merged = { ...DEFAULT_SETTINGS };
    for (const [key, value] of Object.entries(row)) {
        if (value !== null && value !== '' && key in DEFAULT_SETTINGS) {
            merged[key] = value;
        }
    }
    return merged;
}

// ── Public hook — every page can call this safely ─────────────────────────
export function useSiteSettings() {
    return useQuery({
        queryKey: ['site-settings'],
        queryFn: async () => {
            if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();
            if (error) {
                console.warn('[useSiteSettings] fetch failed — using defaults', error);
                return DEFAULT_SETTINGS;
            }
            return mergeWithDefaults(data);
        },
        // Cache long — copy changes rarely
        staleTime: 1000 * 60 * 10,
        // Always have something to render — defaults shown while loading
        placeholderData: DEFAULT_SETTINGS,
    });
}

// ── Admin mutation — update the single row ─────────────────────────────────
export function useUpdateSiteSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (updates) => {
            // Empty strings → null so DB stores them clean. Non-string values
            // (the currency toggle/rate) pass through untouched.
            const payload = Object.fromEntries(
                Object.entries(updates).map(([k, v]) =>
                    [k, typeof v === 'string' ? (v.trim() === '' ? null : v) : v]
                )
            );
            const { data, error } = await supabase
                .from('site_settings')
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', 1)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['site-settings'] }),
    });
}
