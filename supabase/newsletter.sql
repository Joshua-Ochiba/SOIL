-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL — Newsletter subscribers
-- ─────────────────────────────────────────────────────────────────────────────
-- Stores emails captured by the footer newsletter form.
-- Public can INSERT (anyone can subscribe). Only authenticated users (admin)
-- can SELECT or DELETE — this prevents harvesting the list publicly.
--
-- Idempotent: safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       text UNIQUE NOT NULL,
    source      text,                          -- which page they signed up from
    created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx
    ON newsletter_subscribers (created_at DESC);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public insert newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "auth read newsletter"     ON newsletter_subscribers;
DROP POLICY IF EXISTS "auth delete newsletter"   ON newsletter_subscribers;

-- Anyone can sign up
CREATE POLICY "public insert newsletter"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (true);

-- Only admin can see the list
CREATE POLICY "auth read newsletter"
    ON newsletter_subscribers FOR SELECT
    TO authenticated
    USING (true);

-- Only admin can remove
CREATE POLICY "auth delete newsletter"
    ON newsletter_subscribers FOR DELETE
    TO authenticated
    USING (true);
