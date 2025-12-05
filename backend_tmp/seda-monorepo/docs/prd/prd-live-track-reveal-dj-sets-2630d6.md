---
title: PRD – Live Track Reveal (DJ Sets)
notionId: 2630d66a-3cf2-8069-a6a4-d8b0821dcb40
lastSynced: 2025-09-12T16:33:24.736Z
url: https://www.notion.so/PRD-Live-Track-Reveal-DJ-Sets-2630d66a3cf28069a6a4d8b0821dcb40
---
# **PRD – Live Track Reveal (DJ Sets)**

---

## **1. Overview**

**Feature:** Live Track Reveal

**Type:** Real-time DJ Mode enhancement

**Goal:** Allow DJs to reveal tracks in real time during their live sets so fans can instantly see what track is being played.

**Differentiator:** Creates transparency, discovery, and stronger fan engagement by turning live sets into interactive tracklists.

---

## **2. Objectives**

- Enable DJs to selectively reveal track metadata (artist, title, artwork, link) as they play.
- Give fans immediate access to track info, deepening discovery and potential monetization (purchase, playlist save, follow artist).
- Preserve DJ control — DJs choose when and whether to reveal a track.
---

## **3. Scope**

### **In-Scope**

- DJs can toggle **“Reveal Track”** while a song is playing in DJ Mode.
- When revealed, fans see the track card update in real time (artwork, title, artist, links).
- Track reveal events are logged to the DJ set “tracklist” so fans can browse revealed tracks after the set.
- Basic analytics for DJs: % of revealed vs unrevealed tracks, number of fans who saved/purchased a revealed track.
### **Out-of-Scope (Post-MVP)**

- Auto-reveal option for DJs who want everything public.
- Timed reveal (e.g., after 1 min of playback).
- Social sharing of revealed tracklists to external platforms.
- Monetization hooks (e.g., “Tip DJ for track reveal”).
---

## **4. User Stories**

**As a DJ:**

- I want to decide in real time whether to reveal a track I’m playing, so I control the mystery and flow of my set.
- I want fans to be able to discover the music I play without needing to ask “what track is this?”
**As a Fan:**

- I want to instantly see what track the DJ just revealed, so I can save it to my library or explore more music.
- I want to browse a tracklist of revealed tracks after the set, so I can revisit songs I liked.
---

## **5. UX / UI**

- **DJ Side (Controls):**
  - In DJ Mode playback controls, add a **“Reveal Track”** button.
  - When tapped, current track card switches from hidden (“Now Playing”) to fully revealed.
- **Fan Side (Display):**
  - Before reveal: Track card shows “Track Hidden” with generic artwork placeholder.
  - After reveal: Card updates live with metadata, artwork, and engagement actions (Save / Buy / Follow).
- **Tracklist Page:**
  - For each set, display revealed tracks in chronological order.
  - Hidden tracks remain blank or labeled “Track not revealed.”
---

## **6. Success Metrics**

- % of DJs using reveal feature during live sets.
- Avg. number of tracks revealed per set.
- Fan engagement: saves, follows, purchases triggered by revealed tracks.
- Retention: # of fans returning to browse tracklists after live sets.
---

## **7. Dependencies**

- CanonicalTrack model (to pull track metadata from Spotify, Apple, etc.).
- Real-time sync infrastructure (WebSockets / Supabase channels).
- Artist/Track marketplace integration for purchase links (future).
---

## **8. Risks & Mitigations**

- **Risk:** DJs may reveal everything, reducing exclusivity.
  - *Mitigation:* Leave control fully in DJ’s hands, explore incentives for selective reveals.
- **Risk:** Metadata not available from all providers.
  - *Mitigation:* Fallback to generic “unavailable” placeholder.
---

## **9. Open Questions (Resolved)**

1. **Should DJs be able to pre-set reveal preferences for their sets (auto vs manual)?** → **Yes**
  - DJs can configure reveal mode before starting a set.
1. **Should fans be notified in real time when a track is revealed (push/alert)?** → **Yes**
  - Fans in-session receive a live notification when a track is revealed.
1. **Should we allow track reveal to be tied to monetization (e.g., paid unlock)?** → **No**
  - Monetization will not be tied to reveal. Feature remains free and user-experience focused.
---

Want me to also draft a **one-line index entry** (like your other PRDs under “Sprint X / ✅ Defined”) so you can quickly drop this into the PRDs overview page?
