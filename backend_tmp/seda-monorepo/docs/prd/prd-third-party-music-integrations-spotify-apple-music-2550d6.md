---
title: PRD – Third-Party Music Integrations (Spotify + Apple Music)
notionId: 2550d66a-3cf2-80ff-a7a3-cec358bc070a
lastSynced: 2025-09-12T16:32:38.839Z
url: https://www.notion.so/PRD-Third-Party-Music-Integrations-Spotify-Apple-Music-2550d66a3cf280ffa7a3cec358bc070a
---
# PRD – Third-Party Music Integrations (MVP – Spotify & Apple Music)

---

## 1) Objectives

- Enable **in-app playback + metadata resolution** across all major platforms.
- Add **Spotify + Apple Music** integrations as the **first-class MVP providers**.
- Treat Spotify and Apple Music as **primary providers** in the CanonicalTrack model.
---

## 2) Scope (Updated Provider Capabilities)

| Provider | Metadata | Search | Playback | Library Access | Notes |
| --- | --- | --- | --- | --- | --- |
| **Spotify** | ✅ | ✅ | ✅ (SDK) | ✅ (if linked) | Premium required for playback |
| **Apple Music** | ✅ | ✅ | ✅ (MusicKit) | ✅ | iOS/macOS WebKit integration |
| YouTube Music | ✅ | ✅ | ✅ (embed) | ❌ | No full API yet |
| Deezer | ✅ | ✅ | ✅ (30s preview) | ❌ | Full requires Deezer Premium |
| Tidal | ✅ | ✅ | (Post-MVP) | ❌ | SDK partnership needed |
| Pandora | ✅ | ❌ | (Post-MVP) | ❌ | Very limited APIs |
| Bandcamp | ✅ | ❌ | ✅ (embed) | ❌ | Track/album embeds |
| Amazon Music | ✅ | ✅ | (Post-MVP) | ❌ | Early partner stage |
| Beatport | ✅ | ✅ | ✅ (previews, full for linked accounts) | ❌ | Targeted for Next Wave |

---

## 3) UX Rules (Spotify + Apple Music MVP)

- **Fans without Spotify/Apple Music linked:** Hear preview (via YouTube/Bandcamp fallback).
- **Fans with Spotify linked:** Full in-app playback via Spotify SDK.
- **Fans with Apple Music linked:** Full in-app playback via MusicKit.
- **Artists/DJs:** Can DJ full tracks if their Spotify/Apple Music is connected.
- **DJ Mode fallback order** updated: Spotify → Apple Music → other providers → preview/embed.
---

## 4) System Architecture Changes

### CanonicalTrack Resolver

- Extend `track_sources` to support `provider='spotify'` and `provider='apple_music'`.
- Use ISRC + provider APIs to map tracks to equivalents across DSPs.
### Playback Orchestrator

- New routes:
  - `route='spotify_sdk'` (Spotify playback).
  - `route='apple_musickit'` (Apple Music playback).
- Fallback route: previews or YouTube/Bandcamp embeds.
---

## 5) Data Model (additions)

```sql
ALTER TYPE provider_enum ADD VALUE 'spotify';
ALTER TYPE provider_enum ADD VALUE 'apple_music';

-- Example track_sources rows:
-- provider='spotify', provider_track_id='3n3Ppam7vgaVa1iaRUc9Lp'
-- provider='apple_music', provider_track_id='1552070993'


```

Add **Spotify + Apple Music account linkage**:

```sql
INSERT INTO provider_capabilities
(provider, supports_playback, supports_embed, supports_library_read, supports_search, supports_preview, notes)
VALUES
('spotify', TRUE, FALSE, TRUE, TRUE, TRUE, 'Requires Premium for playback'),
('apple_music', TRUE, FALSE, TRUE, TRUE, TRUE, 'Requires Apple Music subscription');


```

---

## 6) Preloading Strategy (Spotify + Apple Music)

- **Full session users (linked accounts):** Preload full-length streams from Spotify/Apple Music SDKs.
- **Preview-only users:** Preload 30–90s clip via fallback (YouTube/Bandcamp).
- **Fallback rule:** If both Spotify/Apple Music unavailable, default to embed/preview.
---

## 7) APIs

**POST /v1/connections/spotify/start** → OAuth to Spotify.

**POST /v1/connections/apple/start** → OAuth to Apple Music.

**POST /v1/connections/spotify/callback** / `apple/callback` → store tokens.

**GET /v1/search?q=** → Unified search across Spotify + Apple Music catalogs.

**GET /v1/tracks/{id}** → resolve metadata, attach to `canonical_tracks`.

- *GET /v1/playback/spotify/:trackId`* / `apple/:trackId` → return signed stream via SDK.
---

## 8) UX Example (DJ Mode with Spotify/Apple)

- DJ queues a Spotify track.
  - Listeners:
    - Linked Spotify → full playback.
    - Apple Music linked with same ISRC → play via Apple Music.
    - No services linked → fallback to YouTube embed/preview.
- Chat shows: *“Now playing: ‘Blinding Lights’ — added by @kai (via Spotify)”*.
---

## 9) Rollout

- **Phase 1:** Metadata + previews (available to all).
- **Phase 2:** Full playback for linked Spotify + Apple Music accounts.
- **Phase 3:** Expansion to next-wave DSPs (Beatport, Bandcamp, Tidal, Amazon).
---

## 10) Dev Notes

- Treat Spotify + Apple Music as **primary providers** in `ProviderAdapter` pattern.
- Build adapters with:
  - `authorize()` (OAuth)
  - `searchTrack()` (catalog search)
  - `getTrackById()` (metadata)
  - `getPreview()` (clip URL/fallback)
  - `getPlaybackUrl()` (SDK playback)
- Cache metadata lookups aggressively to reduce API calls.