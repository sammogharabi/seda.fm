---
title: PRD: Fan Profiles (MVP)
notionId: 2550d66a-3cf2-80b9-b60f-e924485a10f7
lastSynced: 2025-09-12T16:32:26.436Z
url: https://www.notion.so/PRD-Fan-Profiles-MVP-2550d66a3cf280b9b60fe924485a10f7
---
# seda — PRD: Fan Profiles (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Fan Profiles)

**Target Customers**

Fans who want a lightweight identity to represent themselves across seda rooms.

**Underserved Needs**

1. Consistent identity (username/handle) across rooms.
1. Showcase playlists and music taste.
1. Display participation and seasonal badges.
1. Ability to share profile with friends.
1. Discover other fans’ profiles.
**Value Proposition**

Fan Profiles give fans a **home for their identity, playlists, and participation** inside seda, making discovery and recognition possible.

**Feature Set (MVP)**

- Profile page with username + display name.
- Avatar (default placeholder for MVP).
- Publicly visible playlists.
- Seasonal badge strip (read-only MVP).
- Rooms joined shown on profile.
- Sharable profile link.
- Public by default (private mode post-MVP).
---

## 1.1 Goals & Non-Goals

**Goals**

- Give every fan a visible profile.
- Showcase playlists and badges.
- Support discovery of other fans.
**Non-Goals (MVP)**

- Rich customization (cover photos, bios, embeds).
- Private profiles.
- Follow/DM directly from profiles.
---

## 1.2 Key Outcomes

- P0: 90% of fans claim a username at signup.
- P0: 50% of active fans view ≥1 profile weekly.
- P1: 30% of fans share their profile link.
---

## 1.3 User Stories

- As a fan, I can see my playlists on my profile.
- As a fan, I can see badges I’ve earned.
- As a fan, I can see which rooms I’ve joined.
- As a fan, I can share my profile link.
- As a fan, I can view another fan’s profile.
---

## 1.4 Scope & Functional Requirements

- **Identity**: username, display name.
- **Fan Profile**: playlists, rooms joined, badges.
- **Discovery**: searchable by username.
- **Share**: copy profile link.
---

## 1.5 UX & IA

- Fan profile header: avatar, username, display name.
- Sections: Playlists grid, Rooms joined, Badges strip.
- Share button in header.
---

## 1.6 Data Model (simplified)

- `User { id, username, display_name, role:fan, avatar_url?, created_at }`
- `ProfileBadge { user_id, badge_id, awarded_at }`
---

## 1.7 APIs (MVP)

- `GET /profiles/{username}`
- `GET /profiles/search?q`
- `POST /profiles/{id}/update` (username, display name)
- `GET /profiles/{id}/playlists`
- `GET /profiles/{id}/badges`
---

## 1.8 Events & Analytics

- `profile_viewed`, `profile_shared`, `username_claimed`.
- Funnel: signup → username claimed → playlists shown → profile views.
---

## 1.9 NFRs

- Profile load <500ms.
- Username uniqueness enforced.
- Availability 99.9%.
---

## 1.10 Risks & Mitigations

- **Username squatting** → reserved list.
- **Low engagement** → link profiles from chats/playlists.
- **Spam profiles** → rate limit updates.
---

## 1.11 Release Plan

- **Alpha**: username-only profiles.
- **Beta**: add playlists + rooms joined.
- **MVP**: playlists + badges strip + sharable link.