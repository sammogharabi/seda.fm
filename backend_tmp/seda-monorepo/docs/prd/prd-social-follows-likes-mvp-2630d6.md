---
title: PRD – Social (Follows & Likes) (MVP)
notionId: 2630d66a-3cf2-80f6-9455-f1610b44d7c1
lastSynced: 2025-09-12T16:32:44.163Z
url: https://www.notion.so/PRD-Social-Follows-Likes-MVP-2630d66a3cf280f69455f1610b44d7c1
---
# **PRD – Social (Follows & Likes) (MVP)**

---

## **1. Objective**

Enable fans and artists to build lightweight social connections:

- **Follow**: stay connected to artists or fans.
- **Like**: show appreciation for tracks, playlists, or posts.
This increases engagement and community stickiness while remaining simple to implement.

---

## **2. Scope (MVP)**

**Follow / Unfollow**

- Fans can follow other fans and/or artists.
- Artists can follow other artists.
- Users can unfollow at any time.
**Like / Unlike**

- Users can like tracks, playlist items, or posts.
- Users can remove their like.
**Counts & Visibility**

- Display follower count on profiles.
- Display like count on tracks/playlists.
- Updates reflected in near real time.
---

## **3. User Stories**

- As a fan, I can follow an artist to feel connected and get updates.
- As a fan, I can like a track to show approval.
- As an artist, I can view how many fans follow me.
- As a user, I can unfollow/unlike at any time.
---

## **4. Acceptance Criteria**

- POST /social/follow → follow another user.
- DELETE /social/follow → unfollow.
- POST /social/like → like an entity.
- DELETE /social/like → unlike.
- Counts increment/decrement immediately on UI.
- Profile and track pages show updated counts.
- Protected by FEATURE_SOCIAL flag (default OFF).
- E2E happy path: follow/unfollow, like/unlike, counts update.
---

## **5. Out of Scope (MVP)**

- Activity feed (e.g., “Sam liked this track”).
- Comments or threaded discussions.
- Reposts/shares.
---

## **6. Design Notes**

- **Follow Button**: Inline on profiles, toggles “Follow” / “Following.”
- **Like Button**: Heart/like icon on tracks and playlists; shows count.
- **Style**: Neon accent consistent with brand, dark-mode default.
---

## **7. Sprint Priority**

- Sprint 3 (Wave B)
- 🔥 High
---

# **AC_social (Given / When / Then)**

## **Follow**

- **Given** I am authenticated
- **When** I POST /social/follow with { target_user_id }
- **Then** I follow that user and see my following count increase
- **And** the target user’s follower count increases
## **Unfollow**

- **Given** I am following a user
- **When** I DELETE /social/follow with { target_user_id }
- **Then** I no longer follow them
- **And** both follower/following counts decrease
## **Like**

- **Given** I am authenticated
- **When** I POST /social/like with { entity_type, entity_id }
- **Then** the like is recorded
- **And** the like count on that entity increments by 1
## **Unlike**

- **Given** I have already liked an entity
- **When** I DELETE /social/like with { entity_type, entity_id }
- **Then** the like is removed
- **And** the like count on that entity decrements by 1
## **Feature Flag**

- **Given** FEATURE_SOCIAL=false
- **When** I call any /social/* endpoint
- **Then** the API responds with 403 (forbidden)
- **And** social UI components (follow/like buttons) are hidden