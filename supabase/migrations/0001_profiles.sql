-- ============================================================================
-- Xyntriq: 0001_profiles.sql  (NON-DESTRUCTIVE / idempotent)
--
-- ⚠ REVIEW BEFORE RUNNING: this file is NOT auto-run anywhere.
--    Run it manually once in the Supabase dashboard:
--      Supabase → SQL Editor → New query → paste → Run.
--
-- WHAT IT DOES (and does NOT do):
--   • Does NOT drop or recreate `profiles`, any other table, or any rows.
--   • Adds missing columns to the EXISTING `public.profiles` table with
--     `ADD COLUMN IF NOT EXISTS`: safe to run again.
--   • Adds the country allow-list CHECK constraint only if it does not
--     already exist (DO $$ guard).
--   • Enables Row Level Security (idempotent) and creates the 3 ownership
--     policies ONLY if they are missing: nothing is ever dropped.
--
-- LIVE PROJECT CONTEXT (audited 2026-08-18, read-only):
--   • Auth providers: Email = ENABLED, Phone = DISABLED, no social logins.
--   • Existing tables seen on the project: profiles, levels, daily_hours,
--     recordings, requests (profiles + the rest are RLS-blocked for anon).
--   • `profiles` already exists: columns below are additive only.
--
-- FRESH PROJECT? If `public.profiles` does not exist yet, uncomment the
-- CREATE TABLE block at the bottom of this file FIRST, run it, then run the
-- rest of this file. On the live project the ALTER below is enough.
-- ============================================================================

create extension if not exists pgcrypto; -- provides gen_random_uuid() on older PG (no-op if present)

-- ----------------------------------------------------------------------------
-- 1) Additive columns on the existing table (never drops anything)
--    Each column is independent: existing data is left untouched.
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists full_name       text,
  add column if not exists country         text,
  add column if not exists date_of_birth   date,
  add column if not exists age_verified    boolean default false,  -- set true at signup after 18+ check
  add column if not exists languages       text[] default '{}',    -- e.g. {'pt','es','en'}
  add column if not exists experience_tags text[] default '{}',    -- e.g. {'POV video','UGC','phone filming'}
  add column if not exists status          text default 'new';     -- new | pending_qc | active | paused

-- ----------------------------------------------------------------------------
-- 2) Country allow-list CHECK: India + the 18 LATAM programme countries.
--    Kept in sync with the <select> on contributors.html.
--    Added ONLY if the constraint is not already present.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_country_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    execute 'alter table public.profiles
      add constraint profiles_country_check
      check (country in (
        ''India'',
        ''Brazil'', ''Mexico'', ''Colombia'', ''Argentina'', ''Peru'', ''Chile'',
        ''Ecuador'', ''Venezuela'', ''Bolivia'', ''Paraguay'', ''Uruguay'',
        ''Costa Rica'', ''Panama'', ''Dominican Republic'', ''Guatemala'',
        ''Honduras'', ''El Salvador'', ''Nicaragua''
      ))';
    raise notice 'Added constraint profiles_country_check';
  else
    raise notice 'Constraint profiles_country_check already exists: skipping';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3) Row Level Security: ensure enabled (idempotent) and create ownership
--    policies only when missing (no DROP POLICY, no overwrites).
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own'
  ) then
    create policy "profiles_insert_own" on public.profiles
      for insert with check (auth.uid() = id);
    raise notice 'Created policy profiles_insert_own';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy "profiles_select_own" on public.profiles
      for select using (auth.uid() = id);
    raise notice 'Created policy profiles_select_own';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
    raise notice 'Created policy profiles_update_own';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- FRESH PROJECT ONLY (optional: skip on the live project):
-- Uncomment and run FIRST if public.profiles does not exist yet.
-- ----------------------------------------------------------------------------
-- create table if not exists public.profiles (
--   id              uuid primary key references auth.users (id) on delete cascade,
--   full_name       text,
--   country         text,
--   date_of_birth   date,
--   age_verified    boolean default false,
--   languages       text[] default '{}',
--   experience_tags text[] default '{}',
--   status          text default 'new',
--   created_at      timestamptz default now()
-- );
