---
title: PRD - Room Public Playlist with Voting
notionId: 2640d66a-3cf2-8040-adea-e1f89ce61a1e
lastSynced: 2025-09-12T16:33:27.455Z
url: https://www.notion.so/PRD-Room-Public-Playlist-with-Voting-2640d66a3cf28040adeae1f89ce61a1e
---
# **Room Public Playlist with Voting — PRD (sedā.fm)**

## **0) Summary**

Each **Room** has a **public, auto-generated playlist**. Anyone can listen. **Room Members** can add tracks; **all room viewers** can upvote/downvote. A lightweight **ranking system** bubbles the best tracks while preventing spam/brigading. Works across providers (Spotify, Apple, YouTube, Beatport) with a canonical track model.

---

## **1) Target Customers**

- **Fans** who hang in genre/artist rooms and want an always-on “best of this room” stream.
- **Artists/DJs** who want community curation without running full DJ Mode.
- **New visitors** deciding whether a room is active/worth joining.
## **2) Underserved Needs**

- Rooms lack a persistent soundtrack outside of live DJ sessions.
- Discovery is noisy; best tracks get buried in chat.
- No simple way to contribute without queue jockeying.
## **3) Value Proposition**

- A **living, crowd-curated playlist** that reflects the room’s taste 24/7.
- **Frictionless contribution** (add + vote) & **signal-boosting** via ranking + recency.
- **Provider-agnostic listening** via canonical track + linked provider URIs.
## **4) Feature Set (Scope)**

**MVP**

- One **Public Playlist** per room (auto-created, immutable identity).
- **Add Track** (Members only): paste URL, search, or add from now-playing.
- **Voting**: Up/Down per user per track (toggle; cannot vote twice in same direction).
- **Ranking**: Score = Wilson lower-bound with time decay; tie-break by recency.
- **Playback**: Continuous playback on supported providers (fallback to previews).
- **Moderation**: Owner/Mods can remove tracks; soft-delete + audit.
- **Spam Guard**: per-user add rate limit, duplicate suppression, provider URI dedupe.
- **Notifications** (light): “Your track moved to Top 10,” “Track removed (reason).”
- **History**: Recently added, Top of week/month, All-time (computed views).
**Post-MVP**

- Collaborative filters (per-user personalized ordering).
- Auto-rotation/decay tuning per room (owner-configurable).
- Theming/embeds; export to Spotify/Apple.
- Badges for top contributors; streaks.
## **5) User Experience (UX)**

### **Primary Surfaces**

- **Room Header**: Play button + playcount; mini chart of adds/votes today; **Weekly vs All-time toggles**.
- **Playlist Tab**: Ranked list with artwork, provider pills, score, add/vote CTAs.
- **Add Track Modal**: Search across linked providers; paste URL; dedupe warning.
- **Moderation Sheet** (Owner/Mod): Remove w/ reason, mute user N hours, view audit.
### **Key Flows**

1. **Listen**: Visitor hits play → chooses provider (if linked) → continuous play.
1. **Add Track** (Member): Click **Add**, search/paste → select → success toast → item appears with pending score.
1. **Vote**: Tap ▲/▼. Second tap toggles off; switching flips vote.
1. **Moderate**: Mod selects ⋯ → Remove → choose reason → soft-delete; user notified.
### **UX Rules**

- Votes are **optimistic UI**; reconcile on server.
- Downvotes require tooltip on first use: “Use to signal wrong fit/quality.”
- Track rows show: title • artist • provider chips • adder • age • score • ▲▼.
- Disabled actions if not a Member (Add) or not signed in (Vote).
## **6) Roles & Permissions**

- **Owner/Mod**: Remove tracks, configure settings, view audit, adjust decay.
- **Member**: Add tracks; vote.
- **Visitor (signed-in)**: Vote only.
- **Anonymous**: Listen, no voting/adding.
## **7) Data Model (Supabase / Postgres)**

```plain text
-- Rooms
create table room (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz default now()
);

-- Public playlist (1:1 with room)
create table room_playlist (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references room(id) unique,
  title text not null default 'Room Playlist',
  created_at timestamptz default now()
);

-- Canonical tracks
create table track (
  id uuid primary key default gen_random_uuid(),
  canonical_fingerprint text, -- e.g., artist|title|duration normalized
  title text not null,
  artist text not null,
  duration_ms int,
  artwork_url text,
  explicit boolean default false
);

-- Provider links
create table track_provider_link (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references track(id),
  provider text not null check (provider in ('spotify','apple','youtube','beatport','deezer','tidal')),
  uri text not null,
  unique (track_id, provider)
);

-- Playlist entries
create table playlist_track (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references room_playlist(id),
  track_id uuid not null references track(id),
  added_by uuid not null references auth.users(id),
  added_at timestamptz default now(),
  removed_at timestamptz,
  remove_reason text,
  unique (playlist_id, track_id) -- dedupe per playlist
);

-- Votes
create table playlist_track_vote (
  id bigserial primary key,
  playlist_track_id uuid not null references playlist_track(id),
  user_id uuid not null references auth.users(id),
  value smallint not null check (value in (-1,1)),
  created_at timestamptz default now(),
  unique (playlist_track_id, user_id)
);

-- Settings per room
create table room_playlist_settings (
  room_id uuid primary key references room(id),
  add_rate_limit_per_hour int not null default 5,
  decay_half_life_hours int not null default 48,
  downvote_threshold_hide int not null default -5,
  profanity_block boolean default true
);

-- Audit
create table playlist_audit (
  id bigserial primary key,
  playlist_id uuid not null references room_playlist(id),
  actor_id uuid references auth.users(id),
  action text not null, -- add_track, remove_track, vote_up, vote_down, unvote
  payload jsonb,
  created_at timestamptz default now()
);
```

## **8) Ranking Algorithm (MVP)**

- **Score** per entry uses **Wilson score lower bound** for positive rate with N votes to combat low-N volatility and brigading. Apply **time decay** (exponential) so new quality adds surface.
**Definitions**

- u = upvotes, d = downvotes, n = u + d, p = u / max(n,1)
- z = 1.2816 (80% conf) or 1.6449 (90% conf)
- Wilson lower bound: wlb = ( p + z²/(2n) - z * sqrt((p(1-p)+z²/(4n))/n) ) / (1 + z²/n); if n=0, set to 0.
- Time decay factor: decay = 0.5 ^ (age_hours / half_life_hours).
- **Final rank**: rank = wlb * decay.
**Hide rule**: if u - d ≤ downvote_threshold_hide, collapse row (expandable).

## **9) API/Edge Functions (Supabase)**

- POST /rooms/:id/playlist/add → body: provider_uri or search query → resolves canonical track → insert playlist_track → audit.
- POST /playlist_tracks/:id/vote → { value: -1|0|1 } (0 = clear) → upsert → audit.
- GET /rooms/:id/playlist → returns ranked list (server sorts by rank).
- POST /playlist_tracks/:id/remove (mod) → { reason } → soft-delete → audit.
**Policies (RLS)**

- playlist_track: insert if is_member(user, room) and within rate limit.
- playlist_track_vote: insert/update if auth.uid() = user_id.
- select open for all signed-in for votes; playlist public for read.
## **10) Anti-Abuse & Quality**

- **Rate limits**: per-user adds/hour; per-room global ceiling burst.
- **Duplicate control**: same canonical track blocked for 24h after removal.
- **Provider safety**: respect explicit filter if room marked “Family-friendly”.
- **Shadow duplicate**: allow different remixes (fingerprint includes duration/artist).
- **Brigading**: limit first 24h voting impact from brand-new accounts; flag anomalies.
## **11) Notifications (lean)**

- Push/in-app: track added (followers of adder), track enters Top 10 (adder), track removed (adder with reason).
- Email off by default.
## **12) Analytics & Success Metrics**

**Activation**

- % rooms with at least 1 playlist add in first 7 days.
- D7 listener rate for room visitors.
**Engagement**

- Avg listens per visitor; median votes per active listener.
- Track survival time before hidden/removal.
**Quality/Health**

- Vote distribution skew; duplicate add rate; mod remove rate.
**North Star (room-level)**

- Weekly **Playlist Listening Hours** per active room.
## **13) Rollout Plan**

1. **Internal/Dev rooms** → seed + dogfood.
1. **Beta flag** for 10% of rooms with >50 members.
1. **Full release** after stability + abuse checks.
1. **Follow-ups**: personalization, export/embeds, badges.
## **14) Acceptance Criteria (MVP)**

- A playlist auto-exists for every room (new + existing).
- Non-members can listen; only Members can add; signed-in users can vote.
- Duplicate provider URIs or canonical tracks are blocked with friendly message.
- Ranked list visibly reorders after votes without refresh (within 1–2s).
- Mods can remove with a reason; removed items hidden from default view.
- Basic analytics events fire (add, vote, remove, play, complete, skip).
## **15) Open Questions (Updated)**

1. Should owners be able to **pin** tracks (bypass rank)? **No (confirmed).**
1. Expose **weekly vs all-time** toggles directly in header? **Yes (confirmed).**
1. Allow **anonymous listen counts** to influence rank? **No (confirmed).**
1. Should downvotes require a reason after X/day to reduce misuse? **No (confirmed).**
## **16) Non-Goals (MVP)**

- Full playlist collaboration across rooms.
- Advanced recommendation blending.
- Ads in playlist flows.
---

### **Appendix A — Pseudocode (Ranking)**

```plain text
function wilsonLowerBound(u: number, d: number, z = 1.2816) {
  const n = Math.max(u + d, 1);
  const p = u / n;
  const z2 = z * z;
  const num = p + z2/(2*n) - z * Math.sqrt((p*(1-p)+z2/(4n))/n);
  const den = 1 + z2/n;
  return Math.max(0, num/den);
}

function rankScore(up: number, down: number, ageHours: number, halfLifeHours = 48) {
  const wlb = wilsonLowerBound(up, down);
  const decay = Math.pow(0.5, ageHours / halfLifeHours);
  return wlb * decay;
}
```

### **Appendix B — Provider Resolution**

- Parse provider URI → lookup/ingest metadata → map to canonical track (artist/title/duration-based).
- If ambiguous, prompt user with top matches before adding.
### **Appendix C — Event Schema (PostHog/Sentry)**

- playlist_play_started, playlist_play_completed, playlist_track_added, playlist_track_vote, playlist_track_removed, playlist_rank_recomputed.