---
title: PRD — Chronological Newsfeed (Rooms Activity)
notionId: 26c0d66a-3cf2-80b8-b056-d569799ad626
lastSynced: 2025-09-12T16:33:04.458Z
url: https://www.notion.so/PRD-Chronological-Newsfeed-Rooms-Activity-26c0d66a3cf280b8b056d569799ad626
---
# **PRD — Chronological Newsfeed (Rooms Activity)**

---

## **Growth Levers & Strategic Implications**

- **Retention driver**: Making Newsfeed the **landing page** ensures every user immediately sees fresh, social content → drives daily return visits.
- **Discovery engine**: By showing **where activity is happening** (room, DJ session, playlist), users discover more spaces and creators.
- **Social reinforcement**: Aggregates like “3 friends are in this room now” and reactions strengthen the pull to engage socially.
- **Engagement loop**: DJs/curators gain visibility in feed, motivating them to stay active and create more events.
---

## **1) Target Customers**

- Fans & listeners who follow friends and favorite DJs/artists on sedā.fm.
- Room members who want a quick pulse of what’s happening.
- DJs/curators who want discoverability in real time.
---

## **2) Underserved Needs**

- No single place to see **what friends are doing right now** across rooms.
- Room activity (tracks added, DJ sets starting, chat moments) is **hard to discover** unless you’re already in-room.
- Users want a **clean, chronological log** with clear room context and lightweight social signals.
---

## **3) Value Proposition**

A **real-time, chronological newsfeed** showing **friends’ and followees’ activity** across sedā.fm, with **room/DJ/playlist context**, **reactions**, and one-tap actions (join, play, view playlist).

---

## **4) Feature Set (MVP)**

- **Default landing page**: Newsfeed is the first screen after sign-in.
- **Following-only feed**: Activities from people you follow + mutual friends.
- **Strict chronological order**: Newest → oldest.
- **Activity source context**: Feed items always show **where the activity happened** (room, DJ session, playlist).
- **Activity types (MVP):**
  - Friend joined a room
  - Friend started DJing / went live
  - Friend added a track (playlist/queue)
  - Friend created a room
  - Room went live (followed DJ)
  - Friend pinned a chat message (highlight)
  - “X friends are in this room now” aggregates
  - **Reactions on feed items** (👏🔥❤️ etc.)
- **Collapse rules**: 10 min per type.
- **Section headers**: Recent / Today / This Week.
- **Filters**: All / Rooms I’m in / DJs I follow.
- **Snooze controls**: Hide specific activity types.
- **Batching**: Multiple track adds collapse.
- **Real-time updates**: WebSocket push; “New activity” banner.
- **Pagination**: Infinite scroll.
- **Privacy & Moderation**: Private listening toggle, room privacy honored; block/report users.
---

## **5) User Experience (UX)**

- **Feed cards:**
  - Header: Actor avatar • verb • object (room, DJ session, playlist) • timestamp
  - Context chip: Room/DJ/Playlist always shown (LIVE badge, listener count if relevant).
  - Content variations: track preview, DJ live badge, chat snippet, friends aggregate.
  - Action buttons: Join, View Playlist, Follow.
  - **Reactions bar**: Users can tap quick reactions (👏🔥❤️). Reaction counts update in real time.
- **Landing behavior**: Feed is the default landing page after login.
- **Empty state:** Suggest follow rooms/DJs if no activity exists.
---

## **6) Success Metrics**

- **DAU feed viewers / DAU** ≥ 80%.
- **Feed engagement after sign-in**: ≥ 60% interact within 30s.
- **Reaction usage**: ≥ 25% of feed viewers leave at least one reaction in a 7-day window.
- **Avg sessions with feed→room join** ≥ 20%.
- **Median time-to-join after live event** ≤ 30s.
- **Feed-generated room joins per user/day** ≥ 0.5.
- **Complaint rate** < 0.5%.
- **P95 latency** ≤ 2s; **P50 load** ≤ 1.2s.
---

## **7) Non-Goals**

- Algorithmic ranking/recommendations.
- Cross-network activity (Spotify/Apple).
- Comments on feed items (post-MVP).
---

## **8) Scope & Requirements**

**Functional Requirements**

- Event ingestion: room_created, room_live_started, user_joined_room, track_added, dj_started_set, chat_pinned.
- Fan graph filtering: Only events from friends/followees; respect blocks/mutes.
- Chronological ordering: Sort by created_at DESC; collapse within 10 min.
- Real-time delivery: WebSocket push + banner.
- Privacy: Private listening toggle, private rooms hidden.
- Moderation: Blocked/muted excluded; report button.
- Pagination: Cursor-based infinite scroll.
- Snooze controls: Per-activity type.
- **Reactions**: Users can add/remove reactions; counts update in real time.
**API (Draft)**

- GET /v1/feed?viewer_id&filter=(all|my_rooms|djs)&cursor&limit
- WebSocket: SUB feed:<viewer_id> → {cursor, items[]}
- POST /v1/feed/{event_id}/reaction → {reaction_type}
- DELETE /v1/feed/{event_id}/reaction
**Data Model**

- **feed_events**
  - event_id (uuid)
  - type (enum: ROOM_CREATED, ROOM_LIVE_STARTED, USER_JOINED_ROOM, TRACK_ADDED, DJ_SET_STARTED, CHAT_PINNED)
  - actor_user_id
  - room_id
  - track_id (nullable)
  - created_at (ts)
  - visibility (enum)
  - collapsed_key (text)
- **feed_reactions** (new)
  - reaction_id (uuid)
  - event_id (fk → feed_events)
  - user_id
  - reaction_type (enum: 👏, 🔥, ❤️, etc.)
  - created_at (ts)
- **feed_reaction_counts** (materialized or cached)
  - event_id
  - reaction_type
  - count
---

## **9) Edge Cases**

- Private listening → suppress join events immediately.
- Deleted track → show “Removed.”
- Room privacy changes → retroactively hide.
- High-volume actors → collapse + sampling.
- Multiple reactions per user → user can only have one of each reaction type per event.
---

## **10–12)**

## **(Performance, Security, Rollout remain unchanged)**

---

## **13) Acceptance Criteria**

1. New DJ set appears in feed within ≤2s P95.
1. Tap → correct room join or playlist.
1. Feed is strictly chronological.
1. Privacy respected (no join leaks).
1. Section headers visible (Recent/Today/This Week).
1. Snoozed activity types hidden until unsnoozed.
1. Newsfeed is landing page at sign-in.
1. **Reactions work**: Users can react/unreact; counts update in real time across devices.
---

## **14) Future (Post-MVP)**

- Smart muting.
- Contextual follow prompts.
- Recap digests.
---

## **15) QA Test Plan**

- Verify event ingestion for each type.
- Test privacy matrix.
- Load test WebSocket latency.
- Verify collapse & section headers.
- Test snooze controls.
- **Test reactions:** Add/remove reactions, multiple users reacting, counts sync in real time.
---

## **16) User Stories (MVP)**

| **As a…** | **I want to…** | **So that…** |
| --- | --- | --- |
| Fan | Open my feed and see what my friends are doing right now | I never miss live sets or tracks they add |
| Fan | Tap a feed item to join the room instantly | I can experience music with them in real time |
| Fan | See when multiple friends are in the same room | I can join them and feel part of the moment |
| Fan | See section headers (Recent, Today, This Week) | I can quickly scan what’s new vs. what I missed |
| Fan | Snooze certain activity types | My feed feels less noisy and more relevant |
| Fan | See a preview of pinned chat highlights | I can join a room when cool conversations are happening |
| Fan | **React to feed items with 👏🔥❤️** | I can participate socially without needing to comment |
| DJ | Have my set start instantly appear in followers’ feeds | More fans can join my live session |
| DJ | Show when I add multiple tracks | Followers know what I’m curating without clutter |
| Room member | See which friends are in the same room | I can join them and engage socially |
| Privacy-minded user | Toggle “Private listening” | My join activity doesn’t appear in others’ feeds |
| Moderator | Hide/report inappropriate feed items | I can keep the community safe |
| New user | See an empty state with suggestions | I know how to get started and fill my feed |

---

## **17) User Story → Acceptance Criteria Traceability**

| **User Story ID** | **Summary** | **Acceptance Criteria / Test Cases** |
| --- | --- | --- |
| US-1 | Fan sees feed | Events appear ≤2s P95, strictly chronological |
| US-2 | Tap to join | Tap → correct room join / playlist view |
| US-3 | Friends aggregate | ≥2 friends in room triggers “X friends” card |
| US-4 | Section headers | Feed grouped: Recent / Today / This Week |
| US-5 | Snooze types | Snoozed type disappears immediately, persists |
| US-6 | Pinned chats | Pinned msg shows preview, tap opens chat |
| US-7 | DJ set visibility | DJ going live visible ≤2s, privacy respected |
| US-8 | Track adds collapse | Multiple adds in 10m → aggregated card |
| US-9 | Friends in room | Avatars display, join works |
| US-10 | Private listening | Toggle suppresses join events immediately |
| US-11 | Moderation | Report hides item + logs moderation |
| US-12 | Empty state | Suggestions shown when no events exist |
| **US-13** | Reactions | Add/remove reactions; counts sync across users/devices in real time |

---

## **18) Mock Feed Card Wireframes**

> Note:

**Joined a Room**

```plain text
[Avatar]   Alex joined a room   · 3m ago
           Lo-Fi Lounge [Room Chip] (LIVE • 120 listeners)
[Join Room] [View Playlist]
👏🔥❤️  12
```

**DJ Started a Session**

```plain text
[DJ Avatar]   DJ Sam started DJing   · 1m ago
              Deep Cuts Session [DJ Session Chip] (LIVE • 240 listeners)
🔥 LIVE Badge
[Join Session] [Follow DJ]
👏🔥❤️  34
```

**Friend Added Tracks**

```plain text
[Avatar]   Jamie added 3 tracks   · 5m ago
           Indie Nights Playlist [Playlist Chip]
Track thumbnails: [T1] [T2] [T3]
[View Playlist] [Join Room]
👏🔥❤️  8
```

**Pinned Chat Highlight**

```plain text
[Avatar]   Taylor pinned a message   · 10m ago
           Lo-Fi Lounge [Room Chip]
“this track hits different at midnight 🌙”
[View Chat] [Join Room]
👏🔥❤️  15
```

**Friends in Room Aggregate**

```plain text
[Friend Avatars x3]   3 friends are in Lo-Fi Lounge now   · Active
                      Lo-Fi Lounge [Room Chip] (LIVE • 180 listeners)
[Join Room]
👏🔥❤️  6
```

**Room Created**

```plain text
[Avatar]   Sam created a new room   · 20m ago
           Chillhop Sundays [Room Chip] (Scheduled for 6pm PT)
[Join Early] [Follow Room]
👏🔥❤️  4
```

---

## **19) Feed Card Elements by Activity Type**

| **Activity Type** | **Actor** | **Verb** | **Object** | **Source Context** | **Content Preview** | **Actions** | **Reactions** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Joined Room | User avatar + name | joined a room | Room name | Room chip (LIVE, listeners) | N/A | Join, View Playlist | 👏🔥❤️ |
| Started DJing | DJ avatar + name | started DJing | Session name | DJ Session chip (LIVE) | 🔥 badge | Join, Follow DJ | 👏🔥❤️ |
| Added Tracks | User avatar + name | added X tracks | Track count | Playlist/Room chip | Track thumbnails | View Playlist, Join Room | 👏🔥❤️ |
| Created Room | User avatar + name | created a new room | Room name | Room chip | N/A | Join, Follow Room | 👏🔥❤️ |
| Pinned Chat Msg | User avatar + name | pinned a message | Snippet | Room chip | Chat preview | View Chat, Join Room | 👏🔥❤️ |
| Room Went Live | Room/DJ name | is now live | Live set/playlist | Room chip (LIVE, listeners) | N/A | Join, Follow Room | 👏🔥❤️ |
| Friends in Room | Friends’ avatars | X friends are in | Room name | Room chip | Avatars | Join Room | 👏🔥❤️ |
