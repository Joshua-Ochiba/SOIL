-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL Studio — Inventory tracking
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds an integer `stock_count` to products. Semantics:
--    NULL    → unlimited stock (default for digital, evergreen items)
--    >= 1    → tracked stock — frontend can show "Only X left", disables Add
--              to Bag at 0, webhook decrements after a successful purchase
--    0       → sold out (Add to Bag disabled)
--
-- The existing `in_stock` boolean stays as a manual override — admin can set
-- it to false to hide an item even if stock_count is positive.
-- Effective "purchasable" rule: in_stock = true AND (stock_count IS NULL OR stock_count > 0)
--
-- Idempotent: safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS stock_count integer;

-- Atomic decrement function — used by the Stripe webhook after a successful
-- payment to lower stock by the quantity sold. Uses GREATEST(..., 0) so we
-- never go negative even if two webhooks race for the same item.
--
-- Returns the new stock_count, or NULL if the item has unlimited stock.
CREATE OR REPLACE FUNCTION decrement_stock(product_id text, qty integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE products
       SET stock_count = GREATEST(COALESCE(stock_count, 0) - qty, 0),
           updated_at  = now()
     WHERE id = product_id
       AND stock_count IS NOT NULL  -- skip unlimited-stock items
    RETURNING stock_count INTO new_count;

    RETURN new_count;
END;
$$;

-- Allow the webhook (running with service role) to call this function
GRANT EXECUTE ON FUNCTION decrement_stock(text, integer) TO service_role;

NOTIFY pgrst, 'reload schema';
