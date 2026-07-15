-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL Studio — Supabase seed + setup
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Create the products table (safe — skips if already exists) ─────────────
create table if not exists products (
    id                text        primary key,
    name              text        not null,
    category          text        not null,
    price             numeric     not null,
    currency          text        not null default 'USD',
    description       text        default '',
    details           jsonb       default '[]',
    sizes             jsonb       default '[]',
    image             text        default '',
    in_stock          boolean     not null default true,
    featured          boolean     not null default false,
    tag               text,
    stripe_product_id text,
    stripe_price_id   text,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

-- ── 2. Row-Level Security ────────────────────────────────────────────────────
-- Enable RLS
alter table products enable row level security;

-- Drop existing policies if any (safe re-run)
drop policy if exists "Public can read in-stock products"  on products;
drop policy if exists "Authenticated users have full access" on products;

-- Anyone (including the storefront) can read in-stock products
create policy "Public can read in-stock products"
    on products for select
    using (in_stock = true);

-- Authenticated users (admin) can read, insert, update, delete everything
create policy "Authenticated users have full access"
    on products for all
    using  (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- ── 3. Storage bucket for product images ────────────────────────────────────
-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow anyone to view images (public bucket)
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
    on storage.objects for select
    using (bucket_id = 'product-images');

-- Allow authenticated users (admin) to upload and manage images
drop policy if exists "Authenticated users can manage product images" on storage.objects;
create policy "Authenticated users can manage product images"
    on storage.objects for all
    using  (bucket_id = 'product-images' and auth.role() = 'authenticated')
    with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ── 4. Seed the 10 placeholder products ─────────────────────────────────────
-- Uses ON CONFLICT DO NOTHING so re-running won't duplicate rows.

insert into products (id, name, category, price, currency, description, details, sizes, image, in_stock, featured, tag)
values

-- ── SOIL Attire ──────────────────────────────────────────────────────────────
(
    'attire-001', 'SOIL Field Jacket', 'attire', 185, 'USD',
    'A heavyweight outer layer for those who move with intention. Washed canvas, embroidered SOIL glyph at the chest, structured enough to last a generation.',
    '["Heavyweight washed canvas","Embroidered SOIL glyph","Two chest pockets","Unisex oversized fit","Dry clean only"]',
    '["XS","S","M","L","XL","XXL"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png',
    true, true, 'New'
),
(
    'attire-002', 'SOIL Roots Hoodie', 'attire', 95, 'USD',
    'Oversized, heavy, warm. The Roots Hoodie is the daily uniform — washed black with tonal SOIL wordmark embroidered low on the hem.',
    '["450gsm French terry","Washed black finish","Tonal embroidery","Drop-shoulder fit","Machine wash cold"]',
    '["XS","S","M","L","XL","XXL"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png',
    true, true, null
),
(
    'attire-003', 'SOIL Origin Tee', 'attire', 55, 'USD',
    'The foundation piece. Heavyweight cotton, boxy cut, screen-printed SOIL glyph in soil-sun gold on the back. A statement that needs no introduction.',
    '["250gsm heavyweight cotton","Screen-printed glyph","Boxy unisex fit","Ribbed collar","Machine wash cold"]',
    '["XS","S","M","L","XL","XXL"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png',
    true, false, null
),
(
    'attire-004', 'SOIL Sand Trousers', 'attire', 125, 'USD',
    'Relaxed, tapered. Cut from a sand-coloured ripstop with a SOIL emblem patch at the hip. For those who dress with purpose.',
    '["Ripstop cotton blend","Elasticated waistband","Tapered leg","SOIL patch at hip","Machine wash cold"]',
    '["XS","S","M","L","XL","XXL"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/002006222_generated_521647d1.png',
    true, false, 'New'
),

-- ── SOIL Artifacts ───────────────────────────────────────────────────────────
(
    'artifact-001', 'SOIL Glyph Print', 'artifacts', 75, 'USD',
    'The SOIL sacred glyph system rendered in archival pigment ink on 310gsm cotton-rag paper. A document of indigenous symbolism for the modern wall.',
    '["310gsm cotton-rag paper","Archival pigment ink","Limited to 200","Signed & numbered","Ships flat in tube"]',
    '["A3","A2","A1"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png',
    true, true, 'Limited'
),
(
    'artifact-002', 'Origins Canvas', 'artifacts', 320, 'USD',
    'Full-colour original artwork on stretched canvas. The Origins series explores the visual language of African cosmology through a contemporary lens. Edition of 50.',
    '["Stretched canvas","Original digital artwork","Edition of 50","Signed certificate included","Ships in protective box"]',
    '["60×80cm","80×100cm"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png',
    true, true, 'Limited'
),
(
    'artifact-003', 'SOIL Emblem Poster', 'artifacts', 45, 'USD',
    'The SOIL emblem in its purest form — matte black on bone white. Minimal. Intentional. Made to be framed.',
    '["300gsm uncoated stock","Matte print finish","Open edition","Ships flat in tube"]',
    '["A3","A2"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/eaa4245ac_generated_857f1ed4.png',
    true, false, null
),

-- ── SOIL Collectibles ────────────────────────────────────────────────────────
(
    'collectible-001', 'SOIL Seed Kit', 'collectibles', 250, 'USD',
    'A curated collection of SOIL brand objects — a field journal, an emblem pin, a glyph card set, and a ceramic seed dish. The full ritual, boxed.',
    '["Field journal (160 pages)","Emblem enamel pin","Glyph card set (12 cards)","Ceramic seed dish","SOIL gift box"]',
    '["One Size"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/9b0ef27fd_generated_505071e9.png',
    true, true, 'Limited'
),
(
    'collectible-002', 'SOIL Ceramic Vessel', 'collectibles', 175, 'USD',
    'Hand-thrown stoneware with an impressed SOIL glyph. Each piece is unique — shaped by hand, fired at high temperature, glazed in matte obsidian.',
    '["Hand-thrown stoneware","Impressed SOIL glyph","Matte obsidian glaze","Each piece unique","Food safe"]',
    '["Small","Medium"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/9b0ef27fd_generated_505071e9.png',
    true, false, 'Handmade'
),
(
    'collectible-003', 'SOIL Vol.1 Journal', 'collectibles', 65, 'USD',
    'The first SOIL journal. Lay-flat binding, cream-coloured pages, debossed SOIL glyph on the cover. For thoughts that matter.',
    '["160 pages","Lay-flat binding","Cream 100gsm pages","Debossed cover","Ribbon bookmark"]',
    '["One Size"]',
    'https://media.base44.com/images/public/69ef64b2d938e6ee5dc6c0e6/9b0ef27fd_generated_505071e9.png',
    true, false, null
)

on conflict (id) do nothing;
