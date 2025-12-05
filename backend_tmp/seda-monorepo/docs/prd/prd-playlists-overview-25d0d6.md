---
title: 🎶 PRD – Playlists Overview
notionId: 25d0d66a-3cf2-809e-8cb5-ded6c566532a
lastSynced: 2025-09-12T16:32:12.485Z
url: https://www.notion.so/PRD-Playlists-Overview-25d0d66a3cf2809e8cb5ded6c566532a
---
---

# **🎶 PRD – Playlists Overview**

## **1. Objective**

Define how **playlists** work within seda for both **fans and artists**, starting with **external Spotify/Apple playlist sharing + voting for MVP**, and expanding into **native Seda playlists** Post-MVP.

---

## **2. Scope**

### **MVP (External Sharing + Voting)**

- **Fan Playlists**
  - Connect Spotify/Apple.
  - Share playlists into Seda rooms/chat.
  - Display as **Playlist Cards** (cover, provider badge, “Open in Spotify/Apple”).
  - Playlists can be voted on (👍/👎).
  - Votes → DJ Points + leaderboard contribution.
  - Top playlists featured on fan profiles.
- **Artist Playlists**
  - Artists connect Spotify/Apple.
  - Share playlists into Seda rooms/chat.
  - Display in **Artist Profile “Playlists” section.**
  - Playlists can be voted on the same way (👍/👎).
  - Votes → DJ Points + leaderboard contribution.
---

### **Post-MVP (Native Seda Playlists)**

- **Playlist Creation**: Fans + artists can create Seda-native playlists of Seda-hosted tracks.
- **Collaboration**: Multiple contributors can add tracks.
- **Playlist Leaderboards**: Most-voted playlists surface globally + per-genre.
- **Imports**: Convert Spotify/Apple playlists into Seda-native ones when tracks exist in Seda’s catalog.
- **Room Playback**: Seda-native playlists can be queued into DJ sessions and rooms.
- **Offline Mode**: Playlists cached for offline playback (mobile app).
---

## **3. Target Customers**

- **Fans:** Showcase their taste, gain recognition, and earn DJ Points.
- **Artists:** Use playlists to tell stories, showcase influences, and deepen fan engagement.
- **Community/DJs:** Curators who want to build reputations through playlists.
---

## **4. Value Proposition**

- **Fans:** Recognition for curation (not possible on Spotify/Apple today).
- **Artists:** Organic promotion + visibility via shared playlists.
- **Seda:** Differentiates by turning playlists into **social, votable, reputation-building objects.**
---

## **5. User Stories & Acceptance Criteria**

### **MVP**

- **As a fan**, I can share my Spotify/Apple playlists into Seda chat/rooms.
- **As a fan**, I can vote on shared playlists.
- **As a fan**, my most-voted playlists appear on my profile.
- **As an artist**, I can share Spotify/Apple playlists on my profile.
- **As a fan/artist**, I earn DJ Points when my playlists receive upvotes.
### **Post-MVP**

- **As a fan**, I can build Seda-native playlists of Seda tracks.
- **As an artist**, I can publish official playlists of my own tracks + influences.
- **As a community member**, I can contribute to collaborative playlists.
- **As a user**, I can discover trending playlists on global/genre leaderboards.
---

## **6. UX Notes**

- **Playlist Card**: cover art, provider badge, vote count, “Open in Spotify/Apple” CTA.
- **Profile Integration**: Playlists tab in fan + artist profiles.
- **Voting Controls**: inline 👍/👎 on playlist cards.
- **Leaderboard Integration**: Playlists accumulate DJ Points for sharers.
---

## **7. Success Metrics**

- 
# **of playlists shared in Seda.**

- Avg. votes per playlist.
- % of playlists featured in profiles.
- Engagement lift in rooms/chat after playlist sharing.
- Conversion: % of Seda tracks discovered via playlists → purchased.
---

✅ With this umbrella PRD in place, **Fan Playlists (MVP)** and **Artist Playlists (MVP)** pages can just link back to this doc for their core logic, avoiding duplicate specs.

---

Do you want me to also **nest Fan Playlists + Artist Playlists under this new Playlists Overview PRD** in your Notion PRD index (so it mirrors how Marketplace has nested PRDs)?
