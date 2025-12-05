---
title: PRD – Music Player, Streaming & Playlists (Updated)
notionId: 25d0d66a-3cf2-803a-83e1-c85d5e962c9c
lastSynced: 2025-09-12T16:32:10.565Z
url: https://www.notion.so/PRD-Music-Player-Streaming-Playlists-Updated-25d0d66a3cf2803a83e1c85d5e962c9c
---
# **🎧 PRD – Music Player, Streaming & Playlists (Updated)**

## **1. Objective**

Deliver the core **music playback system** for seda, while enabling fans to:

- Stream seda-hosted tracks with previews and purchases.
- Share playlists from **Spotify/Apple** directly into Seda rooms/chat.
- Vote on playlists with Seda’s **points system** to recognize tastemakers.
- Build toward native Seda playlists post-MVP.
---

## **2. Scope**

### **MVP**

- **Core Player Controls:** Play, pause, skip, repeat, shuffle.
- **Track Sources:** Seda-hosted tracks + external embeds (Spotify/Apple).
- **File Formats:** MP3 + HD/FLAC playback.
- **Stream-Limited Previews:**
  - Artists set per-track preview limits (0, 1, 3, 5, Unlimited).
  - Seda enforces at account level across devices.
  - Lock + *“Buy to Continue”* once limit reached.
- **Purchases & DRM:**
  - Secure downloads after purchase.
  - Invisible watermark (buyer ID/transaction ID).
  - Download links expire after 3–5 uses.
  - Artists can report piracy; Seda watermark scan identifies source.
- **External Playlist Sharing (NEW – MVP):**
  - Fans connect Spotify/Apple accounts (OAuth).
  - Fans can share their playlists into Seda rooms/chat.
  - Playlists display as **cards** (cover art, title, provider badge, “Open in Spotify/Apple” button).
  - Playlists can be **voted on** (👍 / 👎).
  - Votes translate into **DJ Points + Leaderboards**.
  - Popular playlists can be featured on the sharer’s **fan profile**.
- **UI/UX:**
  - Persistent mini-player for Seda tracks.
  - Playlist cards in chat/rooms.
  - Profile integration: “Top Playlists Shared.”
---

### **Post-MVP**

- **Seda-Native Playlists:**
  - Fans create playlists of Seda-hosted tracks.
  - Playlists visible on profiles + shareable in rooms.
  - Queue playback inside Seda player.
- **Collaborative Playlists:** Multiple fans contribute to one playlist.
- **Playlist Leaderboards:** Ranking by votes, plays, shares.
- **In-App Playlist Previews:** Pull 30-sec preview clips via Spotify/Apple APIs.
- **Import External Playlists:** Convert Spotify/Apple playlists into Seda-native versions when matching tracks exist.
- **Room Playback Expansion:** If all listeners have the same provider, sync playback via Spotify/Apple SDKs.
- **Offline Mode:** Cache purchased Seda tracks + playlists for offline playback.
- **Crossfade & Gapless Playback:** DJ-style continuous flow.
---

## **3. Target Customers**

- **Fans:** Want to showcase taste via playlists, earn recognition, and buy exclusive Seda tracks.
- **Artists:** Gain visibility when included in fan playlists, boost sales via previews.
- **DJs/Curators:** Build followings by sharing playlists into rooms + chat.
---

## **4. Underserved Needs**

- Playlists on Spotify/Apple are isolated → Seda adds **social + voting + recognition**.
- Fans want **credit for taste**, not just passive listening.
- Artists want **organic reach** via playlists shared by fans.
---

## **5. Value Proposition**

- **For Artists:** More discovery → playlists drive fans to Seda tracks.
- **For Fans:** Recognition through points + leaderboard placement.
- **For Seda:** Differentiation: **streaming + ownership + social playlist voting**.
---

## **6. User Stories & Acceptance Criteria**

### **External Playlist Sharing**

- **As a fan**, I want to share my Spotify/Apple playlist into a Seda room so others can see it.
  - ✅ AC: Playlist shows as card with cover + “Open in Spotify/Apple” link.
- **As a fan**, I want others to vote on my shared playlist so I can earn recognition.
  - ✅ AC: Playlist cards can be voted on.
  - ✅ AC: Votes tied to DJ Points + leaderboards.
- **As a fan**, I want my top playlists shown on my profile.
  - ✅ AC: Profile lists “Playlists Shared” with engagement stats.
### **Playback**

- **As a fan**, I want Seda-hosted tracks to play directly.
  - ✅ AC: Mini-player supports Seda tracks.
- **As a fan**, I want Spotify/Apple playlists to open in those apps.
  - ✅ AC: Clicking playlist → deep link to provider.
### **Previews & DRM**

- **As an artist**, I want to set preview limits for tracks.
  - ✅ AC: Track locks after user exceeds preview limit.
- **As a fan**, I want secure downloads when I buy a Seda track.
  - ✅ AC: File watermarked, link expires after 3–5 uses.
---

## **7. UX Notes**

- **Playlist Card:** Cover art, provider badge, votes counter, CTA.
- **Mini-Player:** Seda tracks only.
- **Profile Section:** “Top Playlists Shared” with vote counts.
- **Voting CTA:** Inline thumbs up/down on playlist card.
---

## **8. Decisions**

1. **MVP playlists:** External sharing + voting (no Seda-native creation yet).
1. **Voting:** Yes, playlists earn votes → DJ Points + leaderboards.
1. **Profiles:** Yes, fan playlists featured on profile if shared in rooms/chat.
1. **Post-MVP:** Seda-native playlists, collaboration, imports, room playback.
---

## **9. Success Metrics**

- 
# **of playlists shared in Seda.**

- Avg. votes per playlist.
- % of fan engagement with playlists vs individual tracks.
- GMV from Seda tracks discovered via playlists.
- Engagement lift in rooms/chat after playlist sharing.