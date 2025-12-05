---
title: sedā.fm — High-Level Product Overview
notionId: 2580d66a-3cf2-80d2-9663-f61b145e678f
lastSynced: 2025-09-12T16:33:47.371Z
url: https://www.notion.so/sed-fm-High-Level-Product-Overview-2580d66a3cf280d29663f61b145e678f
---
# sedā.fm — High-Level Context for Development

**Product Concept**

sedā.fm is a **real-time, music-centric social platform** (PWA → mobile-first) where fans and artists can share, discover, and DJ music together in interactive, community-driven channels. Think *Slack for music* meets *Twitch for DJs*.

**Target Customers**

- **Fans / Superfans**: People who want recognition for their taste, real-time discovery, and a sense of community.
- **Artists / DJs**: Independent artists and DJs who want to build direct fan hubs, grow communities, and engage outside of algorithmic feeds.
**Underserved Needs**

- Music streaming is fragmented across platforms, making it difficult to share music together in real-time.
- No community-first platform exists for music discovery with live participation.
- Artists lack tools for authentic, two-way engagement with their superfans.
**Value Proposition**

- **Streaming-agnostic playback**: Unified in-app listening across Spotify, Apple Music, Beatport, YouTube.
- **Community-driven discovery**: Real-time channels, crowd DJing, chat, and gamified recognition.
- **Artist empowerment**: Verified artist hubs, direct fan engagement, and monetization opportunities.
**Core Features (MVP)**

1. **Auth & Onboarding**
  - Login via email, Google, Spotify, Apple, etc.
  - Quick onboarding: genre selection + suggested channels.
  - Artist onboarding: identity verification + auto-import discography.
1. **Channels**
  - Public genre channels (#hiphop, #ambient, #indie).
  - Private artist channels for verified artists.
  - Real-time chat feed + music cards with playback.
1. **DJ Mode**
  - Turn-based queue system for fans and artists.
  - Artist sessions: special version of DJ mode.
  - Fan DJ rooms: skip if ≥50% of audience votes dislike.
1. **Social Layer**
  - Collaborative playlists.
  - Global + genre leaderboards.
  - Seasonal + permanent badges/trophy cases.
**Monetization (Initial)**

- Free tier with ads.
- Paid tier without ads.
- Flat monthly subscription, with optional artist-specific add-ons.
- Long-term: direct fan → artist monetization (tips, merch, memberships).
**Tech Overview (High-Level)**

- **Frontend**: PWA shell for cross-platform support.
- **Streaming Integrations**: Spotify SDK, Apple MusicKit, YouTube embeds, Beatport API.
- **Backend**: Node.js / TypeScript with Postgres + pgvector for recommendation engine.
- **Real-time Sync**: WebSockets for chat + DJ mode.
- **AI Roadmap**: RAG-based recommendation engine leveraging user libraries + channel context.
**Environments**

- **QA Environment**: Used for implementing and testing changes during development.
- **Sandbox Environment**: Mirror of production, used for full UAT and regression testing.
- **Production Environment**: Live environment for end users.
**Release Workflow**

1. Develop and test changes in **QA**.
1. Promote changes to **Sandbox** for end-to-end testing.
1. Release from **Sandbox → Production** once validated.
**UX Philosophy**

- Simple, real-time, fun, and rewarding.
- Music playback and chat are always central.
- Recognition systems (leaderboards, badges, playlists) drive engagement loops.