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

-- Journal entries (typed or spoken, with an optional Vinna summary)
create table if not exists public.journal (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  text        text not null,
  summary     text,
  cycle_day   int,
  created_at  timestamptz default now()
);

-- Share-your-plan invites (who can see what; sending the email is illustrative)
create table if not exists public.shares (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text,
  email       text,
  audience    text,             -- 'partner' | 'loved_one' | 'care_team'
  fields      text[] default '{}',
  created_at  timestamptz default now()
);

-- Appointment notes: things to bring to a doctor (from insights, journal, or typed)
create table if not exists public.appointment_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  body        text,
  source      text,             -- 'insight' | 'journal' | 'manual'
  created_at  timestamptz default now()
);

-- Product feedback from testers (read all rows in the dashboard, not in-app)
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  fit         text,             -- need fit: 'strong' | 'maybe' | 'not_yet'
  must_have   text[] default '{}', -- capabilities that would make Vinna a daily habit
  message     text,             -- the one thing Vinna must get right, in their words
  context     text,             -- which surface: 'auto' | 'you'
  created_at  timestamptz default now()
);
-- Safe upgrades if an earlier version of this table already exists
alter table public.feedback add column if not exists fit       text;
alter table public.feedback add column if not exists must_have text[] default '{}';
alter table public.feedback add column if not exists message   text;
alter table public.feedback add column if not exists context   text;

-- ----------------------------------------------------------------------------
-- Row Level Security: each user can only see and write their own rows.
-- ----------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.feel_checks enable row level security;
alter table public.logs       enable row level security;
alter table public.saves      enable row level security;
alter table public.journal    enable row level security;
alter table public.shares     enable row level security;
alter table public.appointment_notes enable row level security;
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

-- journal
drop policy if exists "own journal read"   on public.journal;
drop policy if exists "own journal write"  on public.journal;
drop policy if exists "own journal delete" on public.journal;
create policy "own journal read"   on public.journal for select to authenticated using (auth.uid() = user_id);
create policy "own journal write"  on public.journal for insert to authenticated with check (auth.uid() = user_id);
create policy "own journal delete" on public.journal for delete to authenticated using (auth.uid() = user_id);

-- shares
drop policy if exists "own shares read"   on public.shares;
drop policy if exists "own shares write"  on public.shares;
drop policy if exists "own shares delete" on public.shares;
create policy "own shares read"   on public.shares for select to authenticated using (auth.uid() = user_id);
create policy "own shares write"  on public.shares for insert to authenticated with check (auth.uid() = user_id);
create policy "own shares delete" on public.shares for delete to authenticated using (auth.uid() = user_id);

-- appointment_notes
drop policy if exists "own appt read"   on public.appointment_notes;
drop policy if exists "own appt write"  on public.appointment_notes;
drop policy if exists "own appt delete" on public.appointment_notes;
create policy "own appt read"   on public.appointment_notes for select to authenticated using (auth.uid() = user_id);
create policy "own appt write"  on public.appointment_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "own appt delete" on public.appointment_notes for delete to authenticated using (auth.uid() = user_id);

-- feedback (testers write their own; you read everything from the dashboard)
drop policy if exists "own feedback write" on public.feedback;
create policy "own feedback write" on public.feedback for insert to authenticated with check (auth.uid() = user_id);
