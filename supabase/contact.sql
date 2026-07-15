-- ─────────────────────────────────────────────────────────────────────────────
-- SOIL Studio — Contact submissions table
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists contact_submissions (
    id          bigserial   primary key,
    name        text        not null,
    email       text        not null,
    message     text        not null,
    created_at  timestamptz not null default now()
);

-- Enable RLS
alter table contact_submissions enable row level security;

-- Drop existing policies (safe re-run)
drop policy if exists "Public can create contact submissions"        on contact_submissions;
drop policy if exists "Authenticated users can read submissions"     on contact_submissions;

-- Anyone can submit a contact form
create policy "Public can create contact submissions"
    on contact_submissions for insert
    with check (true);

-- Admin (authenticated) can read all submissions
create policy "Authenticated users can read submissions"
    on contact_submissions for select
    using (auth.role() = 'authenticated');
