-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL — Site Settings (single-row CMS)
-- ─────────────────────────────────────────────────────────────────────────────
-- One editable row of public-facing copy.  Front-end pulls this on mount and
-- falls back to hardcoded defaults if the row is missing or any field is null,
-- so the site never breaks if the table is empty.
--
-- Idempotent: safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
    id                  integer PRIMARY KEY DEFAULT 1,

    -- Home — "What is SOIL" moment
    definition_body     text,
    mission_quote       text,
    philosophy_body     text,

    -- Studio hero
    studio_hero_body    text,

    -- Footer / brand
    footer_tagline      text,
    shipping_origin     text,

    -- Contact + social
    contact_email       text,
    instagram_url       text,
    twitter_url         text,

    -- Spotify soundtrack (up to 3 tracks/playlists in the floating player)
    spotify_track_1_label text,
    spotify_track_1_url   text,
    spotify_track_2_label text,
    spotify_track_2_url   text,
    spotify_track_3_label text,
    spotify_track_3_url   text,

    updated_at          timestamptz DEFAULT now(),

    -- Enforce single-row constraint
    CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- Seed the single row (no-op if it already exists)
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── RLS — public read, authenticated write ─────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read site_settings"     ON site_settings;
DROP POLICY IF EXISTS "auth update site_settings"     ON site_settings;

CREATE POLICY "public read site_settings"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "auth update site_settings"
    ON site_settings FOR UPDATE
    TO authenticated
    USING (true) WITH CHECK (true);

-- ── Additive: add Spotify columns to existing rows (safe on re-run) ─────────
-- If you already ran an earlier version of this file, these will add the
-- new columns without touching existing data.
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS spotify_track_1_label text,
    ADD COLUMN IF NOT EXISTS spotify_track_1_url   text,
    ADD COLUMN IF NOT EXISTS spotify_track_2_label text,
    ADD COLUMN IF NOT EXISTS spotify_track_2_url   text,
    ADD COLUMN IF NOT EXISTS spotify_track_3_label text,
    ADD COLUMN IF NOT EXISTS spotify_track_3_url   text;
