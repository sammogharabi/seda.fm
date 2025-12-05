---
title: PRD – Fan DJ Mode (MVP)
notionId: 2550d66a-3cf2-8051-bcc6-e27b83f87418
lastSynced: 2025-09-12T16:32:21.858Z
url: https://www.notion.so/PRD-Fan-DJ-Mode-MVP-2550d66a3cf28051bcc6e27b83f87418
---
# seda — PRD: Fan DJ Mode (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Fan DJ Mode)

**Target Customers**

Fans who want to “take the aux” and host democratic, rotation-based listening sessions in public rooms.

**Underserved Needs**

1. Ability for multiple fans to DJ together in turns.
1. Democratic skip voting to prevent bad tracks.
1. Shared visibility of queue and rotation order.
1. Simple safety controls for Mods.
**Value Proposition**

Fan DJ Mode (inspired by hang.fm) lets **fans rotate as DJs, each adding a track in turn, while the audience reacts and votes to skip if needed**.

**Feature Set (MVP)**

- Public rooms with Fan DJ Mode enabled.
- Fans opt into DJ rotation.
- Rotation-based queue: each DJ adds one track per turn.
- Skip voting: if ≥50% of active audience downvote, the track is skipped.
- Queue visible to all members.
- Presence indicator: “Now DJ’ing: @username.”
- Reactions on Now Playing.
- Safety: Mods can remove DJs, clear queue, or reset rotation.
---

## 2.1 Goals & Non-Goals

**Goals**

- Enable democratic fan-led DJ sessions.
- Keep sessions fun with skip voting.
- Provide fair rotation for DJs.
- Encourage audience engagement.
**Non-Goals (MVP)**

- Advanced DJ mixing.
- Weighted voting beyond simple 50% skip threshold.
- Monetization.
---

## 2.2 Key Outcomes

- P0: 30% of public rooms enable Fan DJ Mode weekly.
- P0: 60% of Fan DJ sessions include ≥5 reactions.
- P1: Median track length before skip vote resolution <10s.
---

## 2.3 User Stories

- As a fan, I can join a room with Fan DJ Mode.
- As a fan, I can opt into DJ rotation.
- As a fan DJ, I can add one track per turn.
- As a fan DJ, I can see when my turn is coming.
- As a fan, I can react or downvote the Now Playing track.
- As the system, if ≥50% of audience downvote, the track skips.
- As a Mod, I can remove a DJ or reset the rotation.
---

## 2.4 Scope & Functional Requirements

- **Rotation**: ordered list of fan DJs; each gets one track per turn.
- **Queue**: tracks auto-added in rotation order.
- **Skip Voting**: audience downvotes counted in real time; ≥50% → skip.
- **Reactions**: emoji on Now Playing.
- **Permissions**: Mods can remove DJs, reset queue.
- **Safety**: rate limit track adds, prevent duplicate spam.
---

## 2.5 UX & IA

- DJ rotation carousel visible at top of room.
- Highlight whose turn it is.
- Queue visible under rotation.
- Now Playing card pinned top with skip vote meter.
- Reaction counters on track card.
---

## 2.6 Data Model (simplified)

- `DJSession { id, room_id, mode:fan, active, started_at, ended_at }`
- `DJRotation { session_id, user_id, order, active_turn? }`
- `TrackQueueItem { id, session_id, track_ref, added_by, status(playing|skipped|completed), votes_down[] }`
---

## 2.7 APIs (MVP)

- `POST /rooms/{id}/dj/start {mode:fan}`
- `POST /rooms/{id}/dj/stop`
- `POST /dj/{session_id}/rotation/join`
- `POST /dj/{session_id}/rotation/advance`
- `POST /dj/{session_id}/queue` (auto-added by rotation)
- `POST /dj/{session_id}/vote_skip`
- `GET /rooms/{id}/dj_session`
---

## 2.8 Events & Analytics

- `fan_dj_joined`, `fan_dj_turn_started`, `fan_dj_turn_completed`, `track_added`, `track_skipped`, `track_voted_skip`, `reaction_added`.
- Funnel: join rotation → add track → reactions → skip votes.
---

## 2.9 NFRs

- Rotation update latency <500ms.
- Skip vote tally in <1s.
- Availability 99.9%.
---

## 2.10 Risks & Mitigations

- **Skip abuse** → count only active listeners, exclude lurkers.
- **Trolling DJs** → Mods remove DJs, reset rotation.
- **Empty rotations** → system prompt: “Who wants to DJ next?”
---

## 2.11 Release Plan

- **Alpha**: manual rotation, queue basic tracks.
- **Beta**: add skip voting + automated rotation.
- **MVP**: full Fan DJ Mode with rotation, skip voting, reactions, safety.