---
title: PRD: Artist Profiles (MVP)(Updated)
notionId: 2550d66a-3cf2-80db-ae03-e97f943c4ed3
lastSynced: 2025-09-12T16:32:27.884Z
url: https://www.notion.so/PRD-Artist-Profiles-MVP-Updated-2550d66a3cf280dbae03e97f943c4ed3
---
Great — here’s how we’ll update your **Artist Profiles (MVP)** PRD so it stays consistent with the new playlist approach (external Spotify/Apple sharing + voting for MVP, native Seda playlists Post-MVP).

---

# **🎈 PRD: Artist Profiles (MVP) (Updated)**

## **Product Frame (Artist Profiles)**

**Target Customers**

Artists, DJs, and their teams who want an official presence tied to their music, playlists, and community.

**Underserved Needs**

1. Verified identity tied to artist name.
1. A place to showcase **playlists** (from external accounts in MVP, native Seda playlists Post-MVP).
1. Link between artist room and profile.
1. Ability to engage fans outside live DJ sessions.
1. Lightweight discovery by fans.
**Value Proposition**

Artist Profiles give creators a persistent home in Seda where fans can discover their music, playlists, and official room, with a verification badge to ensure authenticity.

---

## **Feature Set (MVP)**

- Artist profile page tied to artist handle.
- Artist name + display name.
- Avatar (default placeholder for MVP).
- Official artist room link.
- **Publicly visible playlists (Spotify/Apple shared playlists for MVP).**
- Pinned track display.
- Artist verification badge (system-issued).
- Sharable profile link.
- Public only (private mode Post-MVP).
---

## **2.1 Goals & Non-Goals**

**Goals**

- Give artists a branded profile page.
- Showcase **shared playlists, pinned tracks, and artist room.**
- Strengthen engagement between artists and fans.
- Provide trust via verification badge.
**Non-Goals (MVP)**

- Advanced customization (cover photos, bios).
- Private artist profiles.
- **Native Seda playlist creation** (Post-MVP).
- Direct monetization from profile page (handled in Marketplace).
---

## **2.2 Key Outcomes**

- **P0:** 70% of active artists share ≥1 playlist (Spotify/Apple) into their profile.
- **P0:** 60% of artist profiles viewed by ≥5 fans in first month.
- **P1:** 50% of verified artist profiles are linked from DJ sessions.
---

## **2.3 User Stories**

- **As an artist,** I can have a profile tied to my artist name.
- **As an artist,** I can highlight my official room.
- **As an artist,** I can show my playlists (Spotify/Apple for MVP).
- **As an artist,** I can pin a track to my profile.
- **As an artist,** I can display a verification badge to prove authenticity.
- **As a fan,** I can view an artist’s profile, playlists, pinned track, and room, and see if they are verified.
---

## **2.4 Scope & Functional Requirements**

- **Identity:** artist name, display name.
- **Artist Profile:** official room link, playlists (external first), pinned track.
- **Verification Badge:** system-controlled flag, visible on profile and next to name.
- **Discovery:** searchable by artist name.
- **Share:** copy profile link.
---

## **2.5 UX & IA**

- Artist profile header: avatar, artist name, display name, verification badge.
- Sections: **Playlists (Spotify/Apple shared), Pinned Track, Official Room link.**
- Sharable link prominent.
---

## **2.6 Data Model (simplified)**

- **ArtistProfile { user_id, artist_name, official_room_id, pinned_track?, verified:boolean, created_at }**
- **SharedPlaylist { id, artist_id, provider, external_playlist_id, title, votes }**
---

## **2.7 APIs (MVP)**

- GET /artist_profiles/{artist_name}
- GET /artist_profiles/search?q
- POST /artist_profiles/{id}/update
- GET /artist_profiles/{id}/playlists *(returns external playlists for MVP)*
---

## **2.8 Events & Analytics**

- artist_profile_viewed
- artist_profile_shared
- artist_profile_created
- artist_verified
- Funnel: profile created → playlist shared → pinned track added → verified → fan views
---

## **2.9 NFRs**

- Profile load <500ms.
- Artist name uniqueness enforced.
- Verification badge must appear consistently.
- Availability 99.9%.
---

## **2.10 Risks & Mitigations**

- **Impersonation risk** → verification badge system ensures authenticity.
- **Low playlist engagement** → incentivize sharing with votes + DJ Points.
- **Provider API dependency** → fall back to deep links.
---

## **2.11 Release Plan**

- **Alpha:** basic artist profiles (name only).
- **Beta:** add official room + pinned track.
- **MVP:** playlists (Spotify/Apple), pinned track, room link, verification badge, sharable link.
- **Post-MVP:** native Seda playlists + advanced customization.
---
