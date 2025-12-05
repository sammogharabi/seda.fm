---
title: PRD: Rooms (MVP)
notionId: 2550d66a-3cf2-802d-b10a-e1bc86755fa3
lastSynced: 2025-09-12T16:31:59.499Z
url: https://www.notion.so/PRD-Rooms-MVP-2550d66a3cf2802db10ae1bc86755fa3
---
# 

# seda — PRD: Rooms (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Rooms)

**Target Customers**

Early adopter music fans, curators, and micro-communities (DJs, scene leaders), plus artists and their teams who want real-time fan engagement.

**Underserved Needs**

1. Spaces centered on genres, artists, and topics.
1. Easy discovery of active communities.
1. Music-aware room identity (pinned track, avatar).
1. Lightweight moderation.
1. Simple onboarding (join in <60s).
**Value Proposition**

seda Rooms are the **spaces for music-first communities** — public or private, genre- or artist-based, with presence and pinned tracks to anchor conversation.

**Feature Set (MVP)**

- Room creation (public/genre/artist/private).
- Room header with description, pinned track, presence.
- Join/invite flows with private approval.
- Discovery: browse by genre/artist, trending, search.
- Roles: Owner, Moderator, Member.
- Basic mod tools and safety features.
**UX Principles**

Simple creation, quick discovery, music-centric design, live presence, pinned context.

---

## 2.1 Goals & Non-Goals

**Goals**

- Make it easy to create/join rooms around music.
- Drive engagement through presence and pinned tracks.
- Enable basic moderation and safety.
**Non-Goals (MVP)**

- Multi-channel subrooms.
- Room monetization.
- Advanced automations.
---

## 2.2 Key Outcomes

- 70% of active users join ≥2 rooms in Week 1.
- 40% of room sessions include a track interaction.
- Median time to first room join <60s after signup.
---

## 2.3 Room Types & Roles

- **Public**: discoverable, open join.
- **Genre**: system-curated taxonomy.
- **Artist**: official/unofficial (claim later).
- **Private**: invite or approval.
**Roles**:

- Owner: settings, assign mods, delete room, pin track.
- Moderator: delete messages, mute users, approve joins.
- Member: post, react, invite (if enabled).
---

## 2.4 Core Features (MVP)

- Create Room (name, type, desc, tags, visibility, region).
- Room Header: avatar, description, member count, pinned track.
- Join/Invite: join button, invite via link, private approval.
- Pinned Track: track card set by Owner/Mod.
- Presence: N online, typing dots, member list.
- Discovery: browse, trending, search.
- Badges: deferred post-MVP.
- Room Settings: edit, transfer ownership, delete.
---

## 2.5 UX Flows

- **Create**: fill form → auto-join → prompt to pin a track.
- **Discover**: browse → preview → join.
- **Private Request**: submit → pending → mod approves/denies.
---

## 2.6 Data Model (simplified)

- `Room { id, type, name, slug, description, tags[], visibility, owner_id, pinned_track?, created_at }`
- `RoomMember { room_id, user_id, role, status, joined_at }`
- `JoinRequest { room_id, user_id, status, created_at, acted_by? }`
---

## 2.7 APIs (MVP)

- `POST /rooms` / `PATCH /rooms/{id}` / `DELETE /rooms/{id}`
- `POST /rooms/{id}/join` / `POST /rooms/{id}/invite`
- `GET /rooms/discover`
- `POST /rooms/{id}/pin_track`
- `GET /rooms/{id}`
- `POST /rooms/{id}/members/{user_id}:role` / `POST /rooms/{id}/approve_join`
---

## 2.8 Events & Analytics

- `room_created`, `room_joined`, `room_viewed`, `pinned_track_set`, `join_request_submitted|approved|denied`.
- Cohorts: by room type; stickiness: D7/D30 revisit; join→first message funnel.
---

## 2.9 NFRs

- Room discovery list p95 <500ms.
- Presence summary update ≤5s; accurate ±2 users for <500 members.
---

## 2.10 Moderation & Safety

- Approve/deny requests, ban user, clear pinned track.
- Anti-spam heuristics on invites; invite token rotation.
---

## 2.11 Edge Cases

- Ownership transfer when owner leaves → successor mod/system prompt.
- Room deletion: soft-delete; messages hidden from discovery.
- Artist room claim reserved for post-MVP.
---

## 2.12 Risks & Mitigations

- **Empty rooms** → trending sort, starter prompts.
- **Name squatting** → reserved slugs, report flow.
- **Toxicity** → mod tools + audit logs.
---

## 2.13 Release Plan

- **Alpha**: staff-created rooms only.
- **Beta**: public create, discovery v1, private requests.
- **MVP**: pinned track, moderation, discovery to 500 rooms.