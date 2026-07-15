-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL Studio — Webhook + Tracking migration
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add tracking columns ───────────────────────────────────────────────────
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS tracking_carrier text,
    ADD COLUMN IF NOT EXISTS tracking_number  text;

-- ── 2. Unique constraint on stripe_session_id ─────────────────────────────────
-- Required for the webhook upsert to work correctly (idempotency).
-- Without this, the webhook cannot upsert by stripe_session_id — it would
-- create a duplicate row instead.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'orders_stripe_session_id_key'
          AND conrelid = 'orders'::regclass
    ) THEN
        ALTER TABLE orders
            ADD CONSTRAINT orders_stripe_session_id_key UNIQUE (stripe_session_id);
    END IF;
END $$;

-- ── 3. Verify ──────────────────────────────────────────────────────────────────
-- After running, confirm the columns exist:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;
