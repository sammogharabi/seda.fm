---
title: PRD – Artist DJ Mode (MVP) 
notionId: 2550d66a-3cf2-8034-b563-d2f9399418b9
lastSynced: 2025-09-12T16:32:22.584Z
url: https://www.notion.so/PRD-Artist-DJ-Mode-MVP-2550d66a3cf28034b563d2f9399418b9
---
# seda — PRD: Artist DJ Mode (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Artist DJ Mode)

**Target Customers**

Artists, DJs, and their teams who want lightweight ways to host listening sessions and engage their fans.

**Underserved Needs**

1. A simple way to host interactive listening parties.
1. Full control of the music queue and playback.
1. Visibility and recognition when hosting sessions.
1. Easy ways for fans to participate (suggest, react).
**Value Proposition**

Artist DJ Mode empowers artists to **curate sessions, queue tracks, and interact with fans live**, without needing external streaming tools.

**Feature Set (MVP)**

- Start/stop Artist DJ session (Artist/Owner/Mod enabled).
- Queue management: add, skip, remove tracks.
- Audience track suggestions with Mod/Artist approval.
- Now Playing card pinned in-room.
- Presence indicator: “Now DJ’ing: @artistname.”
- Emoji reactions on Now Playing.
- Safety: Mods can revoke DJ role or clear queue.
---

## 1.1 Goals & Non-Goals

**Goals**

- Allow artists to host sessions with full control.
- Provide visibility for artist identity.
- Give fans participation channels without removing artist control.
**Non-Goals (MVP)**

- Multi-artist simultaneous DJing.
- Advanced DJ mixing features.
- Monetization.
---

## 1.2 Key Outcomes

- P0: 20% of artist rooms start at least one DJ session in Week 1.
- P0: 50% of Artist DJ sessions include fan reactions.
- P1: 30% of Artist DJ sessions last ≥15 minutes.
---

## 1.3 User Stories

- As an artist, I can start a DJ session in my room.
- As an artist, I can add/remove/skip tracks.
- As an artist, I can see audience reactions.
- As a reader, I can see who is DJ’ing and what’s playing.
---

## 1.4 Scope & Functional Requirements

- **Enable/Disable**: Artist/Owner/Mod can start or stop session.
- **Queue**: managed entirely by Artist/Mods.
- **Playback Controls**: play, skip, remove.
- **Suggestions**: fans submit → require approval.
- **Reactions**: emoji on Now Playing card.
- **Safety**: revoke DJ role, clear queue.
---

## 1.5 UX & IA

- Room header shows Artist DJ banner.
- Queue visible under header.
- Now Playing card pinned top.
- Suggestions drawer for approval.
---

## 1.6 Data Model (simplified)

- `DJSession { id, room_id, dj_user_id, mode:artist, active, started_at, ended_at }`
- `TrackQueueItem { id, session_id, track_ref, added_by, status(approved|playing|skipped|removed) }`
---

## 1.7 APIs (MVP)

- `POST /rooms/{id}/dj/start {mode:artist}`
- `POST /rooms/{id}/dj/stop`
- `POST /dj/{session_id}/queue`
- `PATCH /dj/{session_id}/queue/{track_id}` (skip/remove)
- `POST /dj/{session_id}/suggest`
- `PATCH /dj/{session_id}/suggest/{track_id}` (approve/reject)
---

## 1.8 Events & Analytics

- `dj_session_started`, `dj_session_ended`, `track_added`, `track_skipped`, `reaction_added`, `track_suggested`, `track_approved`.
---

## 1.9 NFRs

- Queue update latency <500ms.
- Session durable across reconnects.
- Availability 99.9%.
---

## 1.10 Risks & Mitigations

- **Overload with fan suggestions** → approval flow + rate limits.
- **Empty queues** → prompt artist to add track on start.
---

## 1.11 Release Plan

- **Alpha**: manual artist assignment, queue tracks only.
- **Beta**: add fan suggestions with approval.
- **MVP**: full Artist DJ Mode with queue, reactions, suggestions, safety.