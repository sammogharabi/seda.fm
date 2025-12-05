---
title: PRD: Fan Playlists (MVP)
notionId: 2550d66a-3cf2-802e-ab36-d2601e88772c
lastSynced: 2025-09-12T16:32:23.368Z
url: https://www.notion.so/PRD-Fan-Playlists-MVP-2550d66a3cf2802eab36d2601e88772c
---
---

# **🛷 PRD: Fan Playlists (MVP – External Sharing + Voting)**

**Last updated: 2025-08-28**

---

## **Product Frame (Fan Playlists)**

### **Target Customers**

Fans who want to **showcase their taste** by sharing Spotify/Apple playlists inside Seda, get recognition from the community, and earn points when others vote on their playlists.

### **Underserved Needs**

1. Share playlists they’ve already built in Spotify/Apple.
1. Get **recognition** for curation (votes, points, leaderboards).
1. Surface playlists socially in Seda rooms and chat.
1. Showcase playlists on their Seda profile.
### **Value Proposition**

Fan Playlists make Seda sticky by turning external playlists into **social objects** inside the platform. Instead of private collections, playlists become **visible, votable, and reputation-building**.

---

## **Feature Set (MVP)**

- Connect Spotify/Apple account (OAuth).
- Share playlists into Seda rooms/chat.
- Playlist Card: artwork, title, provider badge, “Open in Spotify/Apple” button.
- Voting: 👍 / 👎 on shared playlists.
- Votes tie into **DJ Points** + leaderboards.
- Top playlists featured on fan profiles.
---

## **1.1 Goals & Non-Goals**

**Goals**

- Make playlist sharing social and competitive.
- Reward tastemakers with recognition via points/leaderboards.
- Drive engagement in rooms and chat.
**Non-Goals (MVP)**

- Native Seda playlist creation (moved to Post-MVP).
- Collaboration on playlists.
- Playlist export to external providers.
---

## **1.2 Key Outcomes**

- **P0:** 30% of active fans share ≥1 playlist in first month.
- **P0:** Average playlist receives ≥3 votes.
- **P1:** 20% of playlists shared are featured on fan profiles.
---

## **1.3 User Stories**

- **As a fan**, I can connect Spotify/Apple to Seda.
- **As a fan**, I can share one of my playlists into a room or chat.
- **As a fan**, I can vote 👍/👎 on playlists shared by others.
- **As a fan**, I can see my playlists + vote totals featured on my profile.
- **As a fan**, I earn DJ Points when my playlists get upvotes.
---

## **1.4 Scope & Functional Requirements**

- **Share Playlist:** Select Spotify/Apple playlist → post as card in Seda.
- **Playlist Card:** Artwork, title, provider badge, votes, “Open in Spotify/Apple” CTA.
- **Voting:** Upvote/downvote system tied to DJ Points.
- **Profile Integration:** Playlists displayed under “Playlists Shared.”
---

## **1.5 UX & IA**

- Playlist cards render inline in chat + rooms.
- Voting controls on each card.
- Profile tab showing playlists with engagement stats.
---

## **1.6 Data Model (simplified)**

- **SharedPlaylist { id, owner_id, provider, external_playlist_id, title, cover_art, votes, created_at }**
- **Vote { playlist_id, user_id, type, created_at }**
---

## **1.7 APIs (MVP)**

- POST /shared-playlists
- GET /shared-playlists/{id}
- POST /shared-playlists/{id}/vote
- GET /profiles/{id}/playlists
---

## **1.8 Events & Analytics**

- playlist_shared
- playlist_voted
- playlist_featured_on_profile
---

## **1.9 NFRs**

- Share to chat latency <500ms.
- Voting updates real-time (<200ms).
- Availability 99.9%.
---

## **1.10 Risks & Mitigations**

- **Provider API changes** → build fallbacks to deep links.
- **Low voting engagement** → prompt “Vote to support your favorite playlists.”
- **Spam playlists** → rate-limit shares per user.
---

## **1.11 Release Plan**

- **Alpha:** Share playlist links manually into rooms.
- **Beta:** Playlist Cards (artwork + open link).
- **MVP:** Add voting + DJ Points integration + profile surfacing.
---

## **🚀 Post-MVP (Future Fan Playlists)**

- **Native Seda Playlists:** Create playlists with Seda-hosted tracks.
- **Collaboration:** Invite friends to build playlists together.
- **Playlist Leaderboards:** Surface top-voted playlists globally.
- **Import/Export:** Convert Spotify/Apple playlists into Seda-native ones.
---
