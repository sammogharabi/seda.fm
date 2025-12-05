-- 2025-09-02 Wave B: Social, Leaderboards, Trophy Case (Supabase/Postgres)
create extension if not exists "uuid-ossp";

-- SOCIAL FOLLOWS (user->user and user->artist; we'll reuse profiles.id as user identity for routing)
create table if not exists public.follows (
  follower_user_id uuid not null,
  target_user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (follower_user_id, target_user_id),
  check (follower_user_id <> target_user_id)
);

create index if not exists idx_follows_target on public.follows (target_user_id);
create index if not exists idx_follows_follower on public.follows (follower_user_id);

-- LIKES: generic entity likes (playlist item, track, message, etc.) using union key (entity_type, entity_id)
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  entity_type text not null check (entity_type in ('playlist_item','track','message','post')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create index if not exists idx_likes_entity on public.likes (entity_type, entity_id);
create index if not exists idx_likes_user on public.likes (user_id);

-- BADGES earned (atomic events); TROPHIES are what's displayed in the Trophy Case
create table if not exists public.badges (
  id uuid primary key default uuid_generate_v4(),
  code text not null, -- e.g., 'TOP1_GLOBAL', 'TOP10_GENRE', 'FIRST_PLAYLIST'
  name text not null,
  tier text,          -- optional (e.g., '👑','🥇','🔥','🎶')
  description text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_badges_code on public.badges (code);

create table if not exists public.trophies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  badge_code text not null references public.badges(code),
  earned_at timestamptz not null default now()
);

create index if not exists idx_trophies_user on public.trophies (user_id);

-- LEADERBOARD SNAPSHOTS: store computed ranks by scope for display
-- scope: global | genre:<slug> | channel:<id> | artist:<username>
create table if not exists public.leaderboard_snapshots (
  id uuid primary key default uuid_generate_v4(),
  scope text not null,
  computed_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  snapshot_id uuid not null references public.leaderboard_snapshots(id) on delete cascade,
  rank integer not null,
  user_id uuid not null,
  score numeric not null,
  extra jsonb,
  primary key (snapshot_id, rank)
);

create index if not exists idx_leaderboard_snapshots_scope on public.leaderboard_snapshots (scope);

-- (Optional) MATERIALIZED VIEW for quick reads can be added later.
-- RLS: add after confirming auth model; templates below.
/*
alter table public.follows enable row level security;
create policy "Follow self manage" on public.follows for all using (auth.uid() = follower_user_id);

alter table public.likes enable row level security;
create policy "Likes self manage" on public.likes for all using (auth.uid() = user_id);

alter table public.trophies enable row level security;
create policy "Trophies read public" on public.trophies for select using (true);
create policy "Trophies self insert" on public.trophies for insert with check (auth.uid() = user_id);
*/
