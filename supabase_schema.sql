-- ============================================================
-- ZeroDayHeist CTF Certificate Portal — Supabase Schema v2
-- Run once in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── 1. Participants Table (regular participants) ──────────────────────────
create table if not exists public.participants (
  id           text primary key,        -- e.g. ZDH-2026-7C4E
  name         text not null,
  email        text not null unique,
  team         text not null,
  rank         integer default null,    -- set by admin only
  score        integer default null,    -- set by admin only
  issued_at    date not null default current_date
);

-- ─── 2. Grand Finale Table ────────────────────────────────────────────────
create table if not exists public.grandfinale (
  id           text primary key,        -- e.g. ZDH-GF-7C4E
  name         text not null,
  email        text not null unique,
  team         text not null,
  rank         integer default null,    -- set by admin only
  score        integer default null,    -- set by admin only
  issued_at    date not null default current_date
);

-- ─── 3. Row Level Security — Participants ─────────────────────────────────
alter table public.participants enable row level security;

create policy "participants_public_read"
  on public.participants for select
  using (true);

create policy "participants_public_insert"
  on public.participants for insert
  with check (true);

-- ─── 4. Row Level Security — Grand Finale ─────────────────────────────────
alter table public.grandfinale enable row level security;

create policy "grandfinale_public_read"
  on public.grandfinale for select
  using (true);

create policy "grandfinale_public_insert"
  on public.grandfinale for insert
  with check (true);

-- ─── Notes ─────────────────────────────────────────────────────────────────
-- NO public update or delete on either table.
-- rank and score are admin-only — set via Supabase Dashboard or service_role key.
-- participants  → uses /public/certificate_participant.png
-- grandfinale   → uses /public/certificate.png
