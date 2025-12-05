---
title: Protoype PRD
notionId: 2560d66a-3cf2-8005-ab8b-f9c262ca536e
lastSynced: 2025-09-12T16:33:46.222Z
url: https://www.notion.so/Protoype-PRD-2560d66a3cf28005ab8bf9c262ca536e
---
---

# sedā.fm — MVP Product Overview

## 1. Product Overview

- **Name:** sedā.fm
- **Type:** Real-time, music-centric social platform (PWA → mobile)
- **Goal:** Let fans and artists share, discover, and DJ music together in real time
- **Differentiators:**
  - Streaming-agnostic in-app playback
  - Turn-based DJ Mode with crowd voting + skips
  - Playlists, leaderboards, badges, and trophy cases
---

## 2. Target Users

- **Fans:** Music superfans who want recognition for taste
- **Artists:** Independent artists/DJs building direct fan communities
---

## 3. Core Features (MVP)

### Auth & Onboarding

- Login via Email, Google, Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, Pandora, Bandcamp
- Quick onboarding: pick genres, join suggested channels
- Artist onboarding: verify identity, auto-import discography, create fan hub
### Channels

- Sidebar with joined channels (#hiphop, #ambient, #indie)
- Public channels (genres) + private channels (artists)
- Real-time chat feed with embedded music cards (artwork + play button)
### DJ Mode (Core MVP Feature)

- **Queue System:** Fans & artists take turns playing songs
- **Preloading:** Tracks pre-buffer for seamless transitions
- **Voting:** Upvote/downvote system
  - 50% downvotes → auto-skip
- **Attribution:** Inline “Now Playing — added by @username”
- **Artist Sessions:** Artists host listening parties in fan hubs
### Playlists

- Fans create Public/Private playlists
- Public playlists appear on profiles
- Collaborative playlists (invite via username/email/link)
- Contributors must sign up to add songs
- Inline attribution under each track (“Added by @username”)
- Artists: playlists always public, toggle collaboration
### Profiles

- **Fans:** Username, bio, connected services, DJ Points, Trophy Case
- **Artists:** Verified badge, bio, discography import, merch/tour links, public playlists, fan leaderboard
### Leaderboards

- **Global:** Top DJs across sedā.fm
- **Genre:** Tiered (👑 Top 1, 🥇🥈🥉 Top 3, 🔥 Top 10, 🎶 Top 50)
- **Channel:** Top DJs in each channel
- **Artist Hubs:** Top contributors per artist
- **Badges:** Permanent, displayed in Trophy Case
### DJ Points (Progression System)

- +5 → Queue a track
- +10 → Track completes playback
- +20 → Track ≥75% upvotes
- +3 → Add track to collab playlist
- +10 → Playlist track gets ≥5 saves/plays
- +50 → Host DJ session
- Points feed into badges, leaderboards, and Trophy Case
---

## 4. User Flows

**Fan Journey**

1. Sign up → pick genres → join channel
1. Join DJ Queue → play track → earn DJ Points
1. Contribute to playlists → earn recognition
1. Climb leaderboards → unlock badges
1. Build Trophy Case → share progress
**Artist Journey**

1. Sign up → verify → auto-import music
1. Create fan hub → host DJ session
1. Earn DJ Points & badges → appear on leaderboards
1. Reward top fans via fan leaderboard
1. Grow community via invites + playlists
---

## 5. Success Metrics

- **Activation:** % of users joining 2+ channels + DJ Mode on Day 1
- **Engagement:** Avg. DJ Points earned per user per week
- **Retention:** 7-day returning users %
- **Artist Adoption:** # of verified artists hosting fan hubs
---

## 6. Design Guidelines

- **Style:** Dark mode default, neon accents (genre color-coded)
- **Layout:** Slack-style sidebar + chat feed + persistent music player
- **Badges:** Circular, neon glow, tiered (👑, 🥇, 🔥, 🎶)
- **Trophy Case:** Grid of badges with date labels
- **Notifications:** Toasts for DJ Points earned + badge unlocks
---

## 7. Figma Prompts

**Auth & Onboarding**

“Design a login + onboarding flow for sedā.fm. Dark mode. Options: Email, Google, Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, Pandora, Bandcamp. Genre picker with pill buttons. Artist signup with verification.”

**Channel View**

“Slack-style channel screen. Sidebar with channels (#hiphop, #ambient). Main feed with chat + music cards. Top banner = Now Playing track. Dark mode, neon accents.”

**DJ Mode**

“DJ Mode queue view. Top: current track (artwork, progress bar, attribution). Queue list: upcoming tracks with status (✅ Ready / ⚠️ Error). Voting (👍 👎). Auto-skip if >50% downvotes. Sidebar chat with reactions.”

**Playlists**

“Playlist screen. Public/Private toggle. Collaboration toggle. ‘Invite Collaborators’ button. Tracklist with inline attribution. Dark mode, neon highlights.”

**Profiles (Fan + Artist)**

“Profile screen. Fan: username, bio, DJ Points, Trophy Case, top genres. Artist: verified badge, bio, discography, playlists, fan leaderboard. Dark mode, neon aesthetics.”

**Leaderboards**

“Leaderboard screen. Tabs: Global, Genre, Channel, Artist. Tiered ranks: 👑 #1, 🥇 Top 3, 🔥 Top 10, 🎶 Top 50. Neon glow, genre color-coded.”

**Trophy Case**

“Profile Trophy Case grid. Badges shown with icon + tier + date earned. Seasonal badges reserved section. Dark mode, neon glow aesthetics.”
