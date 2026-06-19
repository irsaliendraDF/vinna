-- ============================================================================
-- Vinna — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run.
-- ============================================================================

-- Per-user profile (one row per auth user)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  city        text,
  cycle_day   int  default 1,
  phase       text default 'Menstrual',
  tier        text default 'free',
  goal        text,
  created_at  timestamptz default now()
);

-- Daily mood / symptom check-ins
create table if not exists public.feel_checks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  mood        text not null,
  symptoms    text[] default '{}',
  note        text,
  cycle_day   int,
  created_at  timestamptz default now()
);

-- "Log as used today" — factual usage events
create table if not exists public.logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,
  item_title  text,
  item_kind   text,            -- 'herb' | 'recipe'
  cycle_day   int,
  mood        text,
  ratings     jsonb,
  created_at  timestamptz default now()
);

-- "Save" — aspirational wishlist
create table if not exists public.saves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,
  item_kind   text,            -- 'herb' | 'recipe' | 'research' | 'fact'
  created_at  timestamptz default now()
);

-- Product feedback from testers (read all rows in the dashboard, not in-app)
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sentiment   text,             -- 'love' | 'okay' | 'rough'
  message     text,
  context     text,             -- which surface: 'today' | 'you'
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Row Level Security: each user can only see and write their own rows.
-- ----------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.feel_checks enable row level security;
alter table public.logs       enable row level security;
alter table public.saves      enable row level security;
alter table public.feedback   enable row level security;

-- profiles
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile write"  on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile write"  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

-- feel_checks
drop policy if exists "own feel read"  on public.feel_checks;
drop policy if exists "own feel write" on public.feel_checks;
create policy "own feel read"  on public.feel_checks for select to authenticated using (auth.uid() = user_id);
create policy "own feel write" on public.feel_checks for insert to authenticated with check (auth.uid() = user_id);

-- logs
drop policy if exists "own logs read"  on public.logs;
drop policy if exists "own logs write" on public.logs;
create policy "own logs read"  on public.logs for select to authenticated using (auth.uid() = user_id);
create policy "own logs write" on public.logs for insert to authenticated with check (auth.uid() = user_id);

-- saves
drop policy if exists "own saves read"   on public.saves;
drop policy if exists "own saves write"  on public.saves;
drop policy if exists "own saves delete" on public.saves;
create policy "own saves read"   on public.saves for select to authenticated using (auth.uid() = user_id);
create policy "own saves write"  on public.saves for insert to authenticated with check (auth.uid() = user_id);
create policy "own saves delete" on public.saves for delete to authenticated using (auth.uid() = user_id);

-- feedback (testers write their own; you read everything from the dashboard)
drop policy if exists "own feedback write" on public.feedback;
create policy "own feedback write" on public.feedback for insert to authenticated with check (auth.uid() = user_id);
