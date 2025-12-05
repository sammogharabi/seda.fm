---
title: PRD – Leaderboards
notionId: 2550d66a-3cf2-80d5-84a8-ee43a63db2ce
lastSynced: 2025-09-12T16:32:32.256Z
url: https://www.notion.so/PRD-Leaderboards-2550d66a3cf280d584a8ee43a63db2ce
---
# Leaderboards PRD

## 1. Overview

Leaderboards showcase user engagement and music discovery on **sedā.fm** by ranking fans and artists based on participation, taste, and influence. They create recognition loops that encourage continued activity while fostering competition and pride in taste-making. Badges, trophy cases, and seasonal resets ensure that leaderboards remain fresh and aspirational.

---

## 2. Goals & Non-Goals

**Goals**

- Recognize and reward top fans and artists for their contributions.
- Foster engagement and competition across channels and genres.
- Provide visibility into platform-wide cultural trends.
- Encourage ongoing participation through seasonal resets and badges.
**Non-Goals**

- Monetary or cash-based rewards (MVP only recognition-based).
- Cross-platform leaderboards (limited to sedā.fm).
- Complex analytics dashboards for fans/artists (post-MVP).
---

## 3. Target Users

- **Fans** → Gain recognition for taste, discovery, and engagement.
- **Artists/DJs** → Build credibility and visibility by rising on genre/artist-specific boards.
- **Community at large** → Uses leaderboards to identify tastemakers and trending communities.
---

## 4. User Stories & Flows

**User Story 1 — Fan Recognition**

- As a fan, I want to see my ranking on a leaderboard so that I feel rewarded for my participation and taste.
**User Story 2 — Artist Discovery**

- As an artist, I want my fans’ engagement to contribute to leaderboards so that my music gains visibility across the community.
**User Story 3 — Seasonal Reset**

- As a fan, I want seasonal badges and resets so that I have recurring opportunities to rise in rankings.
**Flow: Leaderboard Interaction**

1. User opens Leaderboard tab from sidebar or channel.
1. User sees rankings for:
  - Global (all-time cumulative).
  - Genre-specific.
  - Channel-specific.
  - Seasonal resets.
1. User taps into a profile to view trophy case + earned badges.
1. User is encouraged to increase activity to climb.
---

## 5. Requirements

**Functional**

- Global leaderboard (all-time cumulative).
- Genre-specific leaderboards.
- Channel-specific leaderboards.
- Seasonal resets with badges/trophies.
- Trophy case view tied to user profiles.
- Real-time updates as activity occurs.
**Flat scoring system**

| **Action** | **Points** | **Notes** |
| --- | --- | --- |
| Track update / play | +1 | Applies when user plays a track in DJ Mode or updates a channel with music. |
| Playlist add | +1 | User adds a track to a collaborative or personal playlist. |
| Upvote | +1 | User upvotes a track in DJ Mode or channel. |
| Downvote | –1 | User downvotes a track in DJ Mode (counts toward skip threshold). |

**Tiered Badge System** (awarded at seasonal resets)

- **Gold** → Top 1% of leaderboard.
- **Silver** → Top 10%.
- **Bronze** → Top 25%.
- **Participant Badge** → All users who earned ≥10 points in the season.
**Non-Functional**

- Scalable architecture to handle high query volumes.
- Low-latency updates (leaderboards should feel “live”).
- Consistent styling with sedā.fm design language.
---

## 6. UX/UI

- **Placement** → Sidebar entry point + inline prompts in channels/playlists.
- **Leaderboard Display** → Top 10 highlighted, expandable to top 100.
- **Badges** → Gold/Silver/Bronze tiered badges displayed under username; participant badge for engagement recognition.
- **Trophy Case** → Dedicated section on profile with earned badges and seasonal history.
- **Progress Bar** → Real-time progress indicator toward the next badge tier.
---

## 7. Dependencies

- Event tracking (updates, plays, adds-to-playlists, votes, downvotes).
- Profile system (to display trophy case + badges).
- Seasonal/cron-based reset system.
---

## 8. Design Principles

- **Recognition is Permanent** → Badges never expire; all remain in the trophy case.
- **Rankings are Archival** → Seasonal resets archive prior rankings rather than wiping them.
- **Progress is Transparent** → Users can always see a progress bar toward their next badge tier.
---

## 9. Success Metrics

- % of active users appearing on a leaderboard.
- Distribution of badge ownership (Gold/Silver/Bronze/Participant).
- Engagement lift for users who place in top 100.
- Retention improvement across seasonal resets.
- Increase in fan → artist interactions driven by leaderboard discovery.