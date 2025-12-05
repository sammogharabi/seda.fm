---
title: PRD: Chat (MVP)
notionId: 2550d66a-3cf2-800c-8124-cd97ac722123
lastSynced: 2025-09-16T22:53:16.679Z
url: https://www.notion.so/PRD-Chat-MVP-2550d66a3cf2800c8124cd97ac722123
---
seda — PRD: Chat (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Chat)

**Target Customers**

Early adopter music fans, curators, and micro-communities (DJs, scene leaders), plus artists and their teams who want real-time fan engagement.

**Underserved Needs**

1. Real-time discussion tied to specific tracks/sets.
1. Low-friction discovery of active conversations.
1. Music-aware sharing across platforms.
1. Basic moderation without heavy overhead.
1. Portable identity and social proof.
**Value Proposition**

seda chat is the **music-first real-time conversation layer** — sharing tracks, reacting, and discovering music seamlessly within chat.

**Feature Set (MVP)**

- Real-time text chat.
- Music-aware link unfurling (Spotify/Apple/YouTube/Bandcamp/Beatport).
- Inline reactions, reply threads (1-level), mentions, track attachments.
- DMs included in MVP.
- Mod tools: delete, mute, approval for private rooms.
- Basic safety guardrails.
**UX Principles**

Fast, legible, music-forward, 1–2 taps to share a track, optimistic UI, presence signals.

---

## 1.1 Goals & Non-Goals

**Goals**

- Sub-second perceived latency for live conversations.
- Effortless sharing of music links with rich previews.
- Drive first-session activation: **first message < 2 minutes**.
- Basic 1:1 DMs.
**Non-Goals (MVP)**

- Voice/video, multi-level threads, GIF search, message edits.
---

## 1.2 Key Outcomes

- NSM: **Messages per Active User / Day (MPAU)**.
- P0: 30% of new users send ≥1 message on Day 1.
- P0: 60% of room sessions include ≥1 track unfurl.
- P1: Median send→render latency <200ms in-region, <600ms cross-region.
---

## 1.3 User Stories

- As a fan, I can paste any track/playlist link and see a clean card with metadata.
- As a member, I can reply in a lightweight thread.
- As a member, I can react with emoji to messages and tracks.
- As a member, I can @mention people and trigger notifications.
- As a mod, I can delete or mute users.
- As a reader, I see typing indicators and presence.
---

## 1.4 Scope & Functional Requirements

- **Composer**: paste detection, inline emoji, mentions with typeahead.
- **Message Model**: text, track_card, system, reply.
- **Unfurling**: Spotify, Apple, YouTube, Bandcamp, Beatport.
- **Transport**: WebSocket/RTC, optimistic send, server ACK.
- **Notifications**: in-app for mentions/replies.
- **Moderation**: delete, mute(24h), reaction clear.
- **Safety**: rate limits, profanity filter, link spam guard.
---

## 1.5 UX & IA

- Message list reverse chronological, grouped by day.
- Track card with art/title/artist/source chip, play CTA, “Add to Crate.”
- Reply thread in drawer.
- Fixed composer at bottom.
---

## 1.6 Data Model (simplified)

- `Message { id, room_id, user_id, type, text, track_ref?, parent_id?, reactions[], created_at }`
- `Reaction { message_id, user_id, emoji, created_at }`
- `TrackRef { provider, provider_id, url, title, artist, artwork, duration }`
---

## 1.7 APIs (MVP)

- `POST /rooms/{id}/messages`
- `GET /rooms/{id}/messages`
- `POST /messages/{id}/reactions` / `DELETE /messages/{id}/reactions/{emoji}`
- `POST /messages/{id}/reply`
- `DELETE /messages/{id}` (mod)
- `POST /rooms/{id}/moderation/mute`
---

## 1.8 Events & Analytics

- `chat_message_sent`, `chat_message_viewed`, `track_unfurled`, `reaction_added`, `reply_created`, `mention_delivered`, `mod_action`, `spam_blocked`.
---

## 1.9 NFRs

- P95 end-to-end latency <800ms.
- Availability 99.9%.
- Messages durable ≥365 days.
- Offline queue up to 50 unsent.
---

## 1.10 Risks & Mitigations

- **Spam/Toxicity** → filters + mod tools.
- **Resolver brittleness** → adapters + retries.
- **Cold start** → seed starter messages.
---

## 1.11 Release Plan

- **Alpha**: single room, no threads, Spotify/YouTube only.
- **Beta**: add threads, reactions, all 5 providers.
- **MVP**: full release to seed rooms; D1 message rate ≥30%.