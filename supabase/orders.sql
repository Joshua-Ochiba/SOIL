-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL Studio — Orders table
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists orders (
    id                  text        primary key,
    items               jsonb       not null default '[]',
    total               numeric     not null default 0,
    status              text        not null default 'pending'
                            check (status in ('pending','paid','fulfilled','shipped','cancelled')),
    customer_email      text,
    customer_name       text,
    shipping_address    jsonb,
    stripe_session_id   text,
    notes               text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- Enable RLS
alter table orders enable row level security;

-- Drop existing policies (safe re-run)
drop policy if exists "Public can create orders"       on orders;
drop policy if exists "Authenticated users manage orders" on orders;

-- Storefront (anon) can INSERT new orders from the success page
create policy "Public can create orders"
    on orders for insert
    with check (true);

-- Admin (authenticated) can read and update all orders
create policy "Authenticated users manage orders"
    on orders for all
    using  (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
