-- 2025-09-02 Wave A: Profiles & Playlists (Supabase/Postgres)
-- idempotent guards
create extension if not exists "uuid-ossp";

-- USERS table is assumed to exist via Supabase auth. We reference auth.users as user identities.
-- Basic PROFILE entity separate from auth; denormalized read-friendly username slug.

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null, -- references auth.users(id)
  username text unique not null check (char_length(username) between 3 and 32),
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index to support profile lookups by username
create index if not exists idx_profiles_username on public.profiles (username);

-- PLAYLISTS
create table if not exists public.playlists (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null, -- references auth.users(id)
  title text not null check (char_length(title) between 1 and 140),
  description text,
  is_public boolean not null default true,
  is_collaborative boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_playlists_owner on public.playlists (owner_user_id);
create index if not exists idx_playlists_public on public.playlists (is_public);

-- PLAYLIST COLLABORATORS
create table if not exists public.playlist_collaborators (
  playlist_id uuid not null,
  user_id uuid not null,
  role text not null default 'contributor' check (role in ('contributor','editor','owner')),
  added_at timestamptz not null default now(),
  primary key (playlist_id, user_id)
);

-- PLAYLIST ITEMS (tracks)
-- For MVP we store provider + provider_track_id as foreign keys to external catalogs.
create table if not exists public.playlist_items (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid not null,
  position integer not null,
  provider text not null check (provider in ('spotify','apple','beatport','youtube','deezer','tidal','bandcamp','amazon','pandora')),
  provider_track_id text not null,
  title text, -- optional denormalization for faster reads
  artist text,
  artwork_url text,
  added_by_user_id uuid not null,
  added_at timestamptz not null default now(),
  unique (playlist_id, position)
);

create index if not exists idx_playlist_items_playlist on public.playlist_items (playlist_id);
create index if not exists idx_playlist_items_added_by on public.playlist_items (added_by_user_id);

-- FOLLOW-UP: add RLS policies only after verifying roles in app.
-- Supabase RLS suggestions (left commented for customization):
/*
alter table public.profiles enable row level security;
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Owner update profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Owner insert profile" on public.profiles for insert with check (auth.uid() = user_id);

alter table public.playlists enable row level security;
create policy "Read public playlists" on public.playlists for select using (is_public or auth.uid() = owner_user_id);
create policy "Owner manage playlist" on public.playlists for all using (auth.uid() = owner_user_id);

alter table public.playlist_collaborators enable row level security;
create policy "Collaborators read/write" on public.playlist_collaborators for all using (exists (select 1 from public.playlists p where p.id = playlist_id and (p.owner_user_id = auth.uid() or exists (select 1 from public.playlist_collaborators c where c.playlist_id = playlist_id and c.user_id = auth.uid()))));

alter table public.playlist_items enable row level security;
create policy "Playlist items read" on public.playlist_items for select using (exists (select 1 from public.playlists p where p.id = playlist_id and (p.is_public or p.owner_user_id = auth.uid())));
create policy "Playlist items modify if owner/collab" on public.playlist_items for all using (exists (select 1 from public.playlists p where p.id = playlist_id and (p.owner_user_id = auth.uid() or exists (select 1 from public.playlist_collaborators c where c.playlist_id = playlist_id and c.user_id = auth.uid()))));
*/
