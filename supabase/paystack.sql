-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL — Paystack migration
-- Run this in Supabase → SQL Editor AFTER the original 7 files.
-- Safe to re-run: every statement uses IF NOT EXISTS / IF EXISTS.
--
-- What it does:
--   1. Orders: add paystack_reference (unique) + currency, so orders recorded by
--      the Paystack webhook are idempotent and remember which currency was paid.
--   2. Products: add price_usd — an OPTIONAL hand-set US-dollar price. Leave it
--      NULL and the store derives USD from the Naira price using the exchange
--      rate in Settings. Set it to override the conversion for a specific item.
--   3. Site settings: currency controls + every editable word on the Origin page
--      (the new Admin → Origin Page tab).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Orders ────────────────────────────────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paystack_reference text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'NGN';

-- Idempotency: the webhook upserts on this, so a Paystack retry never duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS orders_paystack_reference_key
    ON public.orders (paystack_reference)
    WHERE paystack_reference IS NOT NULL;

-- ── 2. Products ──────────────────────────────────────────────────────────────
-- price        = the primary (Naira) price.
-- price_usd    = optional explicit USD price; NULL → derived from usd_rate.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_usd numeric;

-- ── 3. Site settings: currency controls ──────────────────────────────────────
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS usd_checkout_enabled boolean DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS usd_rate numeric DEFAULT 1600;

-- ── 3b. Site settings: Origin page copy (Admin → Origin Page tab) ────────────
-- Hero
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_eyebrow text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_scroll_hint text;
-- Narrative chapter 1
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar1_label text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar1_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar1_body text;
-- Narrative chapter 2
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar2_label text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar2_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar2_body text;
-- Narrative chapter 3
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar3_label text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar3_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar3_body text;
-- Narrative chapter 4
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar4_label text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar4_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar4_body text;
-- Narrative chapter 5
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar5_label text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar5_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nar5_body text;
-- "What is SOIL" section
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatis_eyebrow text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatis_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatis_axiom_label text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatis_axiom_line1 text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatis_axiom_line2 text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatis_translation text;
-- Five Layers section header
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS layers_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS layers_intro text;
-- Plant Your Seed
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seed_eyebrow text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seed_heading text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seed_body text;
