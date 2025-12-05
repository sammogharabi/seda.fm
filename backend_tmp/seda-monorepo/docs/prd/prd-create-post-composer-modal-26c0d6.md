---
title: PRD — Create Post (Composer Modal)
notionId: 26c0d66a-3cf2-8031-9883-d87295a251dd
lastSynced: 2025-09-12T16:33:06.815Z
url: https://www.notion.so/PRD-Create-Post-Composer-Modal-26c0d66a3cf280319883d87295a251dd
---
# **PRD — Create Post (Composer Modal)**

---

## **Growth Levers & Strategic Implications**

- **Posting drives engagement**: A structured composer encourages users to share more, fueling the Newsfeed.
- **Content quality**: Music + DJ post types make the feed richer than text-only.
- **Discovery loops**: Music shares auto-link into playlists and tagged rooms/scenes, deepening room participation.
- **Social graph expansion**: Mentions/hashtags help surface users and topics, while visibility controls allow lightweight privacy boundaries.
---

## **1) Target Customers**

- **Fans/Listeners**: share thoughts and tracks with friends/followers.
- **DJs/Curators**: announce upcoming sets and share selections.
- **Room Members**: seed conversation that drives room joins and session attendance.
---

## **2) Underserved Needs**

- A lightweight, fast way to **post text, share tracks, or announce DJ sessions** without leaving the feed.
- **Clear guardrails** for what’s required to post (validation + guidance).
- **Structured post types** that map cleanly into Newsfeed and Rooms (with source context: room, playlist, DJ session).
---

## **3) Value Proposition**

A **single, fast composer** that lets users post **text**, **music shares**, or **DJ session announcements** with guardrails and instant feedback, producing **structured posts** the Newsfeed can render consistently (join/view actions, live badges, reactions).

---

## **4) Feature Set (MVP)**

- **Entry Point**: “Create Post” button opens modal with tabs: **Text**, **Music**, **DJ Session**.
- **User Context**: avatar, display name, username displayed at top.
- **Post Types**:
  1. **Text Post**: textarea (≤500 chars), required content.
  1. **Music Share**: caption optional, must select track, **auto-link to playlist if available**.
  1. **DJ Session**: description optional, required **Title** + **Genre**, optional duration, **custom scheduled time** (default +10 min).
- **Room/Scene Tagging**: optional chip selector, single tag MVP.
- **Mentions/Hashtags**: parse inline @username and #topic.
- **Visibility Controls**: dropdown at bottom → Public (default) or Followers-only.
- **Validation & Feedback**: block invalid submit, toast errors, toast success.
- **Submit**: structured object with id, type, user, content, metadata counts, track/djSession objects if applicable.
- **Reset**: clear all state on success.
- **Newsfeed Integration**: new post appears in feed with correct rendering + chips.
---

## **5) User Experience (UX)**

- **Modal Layout**: Header title/description → User chip → Tabs → Tab-specific fields → Tag/Visibility → Footer actions.
- **Music Share**: search bar, track result list, selected track preview, playlist chip auto-attached.
- **DJ Session**: title, genre, duration, datetime picker.
- **Mentions/hashtags**: highlighted inline.
- **Visibility**: chip shown in post header (Public/Followers-only).
- **Empty States**: “No tracks found,” “Add session title,” etc.
- **Feedback**: toasts for success/failure.
---

## **6) Success Metrics**

- **Completion rate** ≥ 70%.
- **Median time to post** ≤ 30s.
- **% posts with tags** ≥ 20%.
- **% posts with mentions/hashtags** ≥ 15%.
- **% DJ sessions with custom time** ≥ 30%.
- **Followers-only posts adoption** ≥ 10% within 30 days.
- **Error rate** < 1%.
---

## **7) Non-Goals**

- Media uploads (images/video).
- Advanced scheduling (beyond DJ).
- Rich text formatting, polls, or drafts.
- Custom privacy lists.
---

## **8) Scope & Requirements**

1. **Tabs**: persist selection + state.
1. **Validation**: per post type (text content, track required, DJ title+genre required).
1. **Music Auto-Link**: backend attaches playlist_id if available.
1. **Tagging**: autocomplete for rooms/scenes; one per post MVP.
1. **Mentions/hashtags**: regex parse, render clickable.
1. **Visibility**: dropdown, enforced on backend queries.
1. **DJ Scheduling**: datetime picker (default = +10m).
1. **Submit Behavior**: disable while submitting; reset + close on success.
1. **Analytics**: log composer_opened, composer_tab_changed, composer_submit_*, track_selected, tag_added.
---

## **9) API (Draft)**

- POST /v1/posts
  - Fields: type, content, user_id, track?, djSession?, tags, mentions, hashtags, visibility.
- GET /v1/music/search?q=<string>&limit=<n>
- POST /v1/posts/{id}/tag (optional).
---

## **10) Data Model (Draft)**

**posts**

- post_id, type, user_id, content, created_at
- likes_count, reposts_count, comments_count
- visibility (PUBLIC | FOLLOWERS)
- tags[] (room_id/scene_id)
- mentions[] (user_id)
- hashtags[] (string)
**post_music**

- post_id
- track_id, title, artist, artwork_url, duration
- playlist_id?
**post_dj_session**

- post_id
- title, scheduled_time, expected_duration, genre, listeners
---

## **11) Newsfeed & Surfaces**

- Text → plain card with mentions/hashtags.
- Music → track card + playlist chip.
- DJ → session card with scheduled time.
- Tags → chips below content.
- Visibility → chip in header.
---

## **12) Privacy, Safety, Moderation**

- Enforce visibility in queries.
- Sanitize text, cap at 500 chars.
- Block disallowed HTML.
- Report/hide posts (future).
---

## **13) Acceptance Criteria**

1. Text posts require non-empty content, ≤500 chars.
1. Music shares require selected track; auto-link to playlist.
1. DJ sessions require title+genre; user can set custom scheduled time.
1. Room/scene tags render as clickable chips.
1. Mentions and hashtags parse and render clickable.
1. Visibility dropdown required; followers-only respected.
1. On success, modal resets and closes; toast success.
1. New post appears in feed with correct rendering.
---

## **14) User Stories (MVP)**

| **As a…** | **I want to…** | **So that…** |
| --- | --- | --- |
| Fan | Post a quick text thought | I can share a vibe or idea instantly |
| Fan | Share a specific track (linked to playlist) | Friends can discover and play it |
| DJ | Announce an upcoming session with custom time | My audience can plan to join |
| User | Tag a room in my post | Others can jump into that room |
| User | Use @mentions and #hashtags | I can call out friends or topics |
| Privacy-minded user | Post to followers-only | I control who sees my posts |

---

## **15) User Story → Acceptance Traceability**

| **ID** | **Story** | **Acceptance** |
| --- | --- | --- |
| CP-1 | Post text | Non-empty, ≤500 chars; appears in feed |
| CP-2 | Share track | Must select track; playlist_id attached |
| CP-3 | Announce DJ | Title+Genre required; scheduled_time custom |
| CP-4 | Tag room/scene | Chip rendered + clickable |
| CP-5 | Mentions/hashtags | Inline parsed + clickable |
| CP-6 | Followers-only | Visible only to followers |

---

## **16) Edge Cases**

- Trim whitespace-only content → error.
- Switching tabs preserves state.
- Clearing search keeps selected track until removed.
- Empty DJ duration → default 1 hour.
- Rapid submit spam → blocked by isSubmitting.
---

## **17) Performance & Reliability**

- Modal opens ≤150ms.
- Submit local callback ≤300ms; with API ≤1.2s.
- Toasts async; no reflow.
---

## **18) Rollout Plan**

- Phase 1: Local mock music search.
- Phase 2: Integrate real music APIs (Spotify/Apple).
- Phase 3: Persist to backend, enforce visibility, analytics pipeline.
---

## **19) QA Test Plan**

- Text posts: empty, max length, emoji.
- Music: search, select, remove, no results.
- DJ: required fields, schedule logic, default duration.
- Tags: autocomplete, click-through.
- Mentions/hashtags: parse + render.
- Visibility: public vs followers.
- State: cancel resets, success resets.
---

## **20) Open Questions → Resolved**

1. Music shares auto-link to playlist → **Yes**.
1. Users can tag rooms/scenes → **Yes**.
1. Mentions/hashtags parsing MVP → **Yes**.
1. DJ sessions custom scheduled time → **Yes**.
1. Visibility controls MVP → **Yes**.
---

## **21) Feed Integration — Post Types → Newsfeed Rendering**

| **Post Type** | **Actor** | **Verb / Context** | **Content Area** | **Source Context Chips** | **Actions (CTAs)** | **Reactions / Social** |
| --- | --- | --- | --- | --- | --- | --- |
| Text Post | User avatar + name | “posted” | Plain text with mentions/hashtags | Optional Room/Scene chip | N/A | 👏🔥❤️; 💬 comments; 🔁 repost |
| Music Share | User avatar + name | “shared a track” | Track card + caption | Playlist chip (auto), optional Room/Scene | Play / View Playlist / Join Room | 👏🔥❤️; 💬; 🔁 |
| DJ Session | DJ avatar + name | “announced a DJ Session” | Title, genre, description, scheduled time, duration | DJ chip + optional Room/Scene | Join Session / Follow DJ | 👏🔥❤️; 💬; 🔁 |
| Room/Scene Tagged Post | User avatar + name | “tagged a room” | Text or track | Room/Scene chip | Join Room | 👏🔥❤️; 💬; 🔁 |
| Followers-only Post | User avatar + name | “posted (followers only)” | Any type, visibility restricted | Followers-only chip | Same as above (restricted) | 👏🔥❤️; 💬; 🔁 |

---

### **Notes for Implementation**

- **Mentions**: inline → profile link.
- **Hashtags**: inline → tag feed.
- **Visibility**: enforce backend filters.
- **Chips**: consistent styling.
- **Reactions/social**: consistent across all post types.
- **Edge case**: multiple chips allowed (playlist + room).
---
