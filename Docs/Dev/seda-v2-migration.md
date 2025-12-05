# Sedā v2 Migration & Gap Analysis — Backend + Frontend-v2

**Date:** 2025-11-08  
**Owner:** Sam  
**Assistants:** ChatGPT (GPT-5 Thinking), Codex, Claude Code  
**Context:** Local dev on your machine. You’re using **Codex** + **Claude Code** in VS Code. You are **not** using Cursor.

---

## 1. High-Level Goal

Make `frontend-v2` production-ready against the **current NestJS backend** by:

1. Doing a **gap analysis** between:
   - existing backend capabilities (`/api/v1/**`), and  
   - what `frontend-v2` expects (pages, components, flows).
2. Implementing or fixing **backend endpoints, DTOs, and wiring** for all v2 features:
   - Auth, sessions, social feed, playlists, discover, profiles, verification, progression, search.
3. Standardizing:
   - API base URL usage
   - CORS & security config
   - Response shapes (DTOs) so AI tools can reliably refactor / extend.

This document is the **single source of truth** Codex / Claude Code should follow.

---

## 2. Environment & Conventions

### 2.1 Backend

- Framework: **NestJS**
- Modules (from logs):
  - `HealthModule`, `UserModule`, `CrawlerModule`, `FeedModule`,
  - `SessionsModule`, `ProgressionModule`, `SearchModule`,
  - `DiscoverModule`, `ProfilesModule`, `PlaylistsModule`,
  - `AdminModule`, `VerificationModule`
- Health:
  - `GET /api/v1/health` → `{ status, service, db, timestamp }`
- Global:
  - Prefix: **`/api/v1`**
  - Strict Helmet CSP
  - Custom `AllExceptionsFilter`

### 2.2 Frontend-v2

- Next.js / React app.
- `.env.local`:

  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
  ```

- **Rule:** No hard-coded `http://localhost:3001` in components.  
  Always use `process.env.NEXT_PUBLIC_API_BASE_URL`.

### 2.3 Tools

- You use:
  - **Codex** + **Claude Code** in VS Code.
- They must:
  - Respect this doc.
  - Keep changes typed, minimal, and documented.

---

## 3. Task 1 — Local Dev: Stable Backend & Frontend

**Goal:** Known-good local environment.

### Backend

```bash
cd backend
pnpm install
pnpm run prisma:generate   # if needed
pnpm run start:dev
```

Verify:

```bash
curl -i http://localhost:3001/api/v1/health
# Expect 200 OK with JSON status: ok
```

If `EADDRINUSE: 3001`:

```bash
lsof -iTCP:3001 -sTCP:LISTEN
kill -9 <PID>
pnpm run start:dev
```

### Frontend-v2

```bash
cd frontend-v2
pnpm install
pnpm run dev
```

**Acceptance**

- `/api/v1/health` is 200.
- `frontend-v2` bootstraps without fatal errors.

---

## 4. Task 2 — API Base URL & CORS Alignment

### Backend CORS

In env:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3002,http://localhost:3003
```

(Use actual Next dev ports.)

Local-only shortcut:

```env
CORS_ORIGINS=*
```

### Frontend

- Always use `NEXT_PUBLIC_API_BASE_URL`.
- No silent assumptions that API and app share same origin unless explicitly proxied.

**Acceptance**

- No “Not allowed by CORS” in console.
- Network calls to `/api/v1/...` succeed.

---

## 5. Task 3 — SocialFeed: React Bug + Backend Wiring

### 5.1 Fix: `Identifier 'React' has already been declared`

In `frontend-v2/src/components/SocialFeed.tsx`:

- Ensure only one React import pattern:

Valid:

```ts
import React from 'react';
// or, if using react-jsx runtime, no import React at all.
```

Invalid:

- Multiple `import React ...` lines.
- `const React = ...` plus an import.

Remove duplicates.

### 5.2 Backend wiring

Use `FeedModule` endpoints:

- `GET /feed`
- `GET /feed/global`
- `POST /feed/posts`
- `GET /feed/posts/:id`
- `POST /feed/posts/:id/like`
- `DELETE /feed/posts/:id/like`
- `POST /feed/posts/:id/comments`
- etc.

Expected shape (frontend side):

```ts
export interface FeedPost {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  hasLiked?: boolean;
}
```

**Acceptance**

- Social feed renders real posts via `/api/v1/feed` without syntax errors or `invalid/` requests.

---

## 6. Task 4 — Playlists & Discover

### Playlists Routes

- `POST /playlists`
- `GET /playlists/:id`
- `PATCH /playlists/:id`
- `POST /playlists/:id/items`
- `GET /playlists/:id/items`
- `GET /playlists/trending`
- `GET /playlists/featured`

### Discover Routes

- `GET /discover/trending`
- `GET /discover/new-releases`
- `GET /discover/for-you`
- `GET /discover/genre/:genre`

### DTOs (Frontend Contract)

```ts
export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export interface PlaylistItem {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  addedBy: {
    id: string;
    username: string;
  };
  position: number;
  addedAt: string;
}

export interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  source?: 'trending' | 'new-release' | 'for-you' | 'genre';
}

export interface DiscoverPlaylistSummary {
  id: string;
  title: string;
  coverImageUrl?: string;
  itemsCount: number;
  ownerName: string;
  tag?: string;
}
```

**Backend:** normalize responses to these shapes (or strict supersets).  
**Frontend:** use typed API helpers (defined below in §9).

**Acceptance**

- Playlist & discover pages load real data with consistent typing.

---

## 7. Task 5 — Profiles & Artist Verification

### Profile Routes

- `POST /profiles`
- `GET /profiles/:username`
- `PATCH /profiles/:username`
- `GET /profiles/me/profile`
- `POST /profiles/me/genres`
- `GET /profiles/me/onboarding-status`

### Verification Routes

_User_

- `POST /artist/verification/request`
- `POST /artist/verification/submit`
- `GET /artist/verification/status/:id`
- `GET /artist/verification/my-requests`

_Admin_

- `GET /admin/verification/pending`
- `GET /admin/verification/:id`
- `PATCH /admin/verification/:id/approve`
- `PATCH /admin/verification/:id/deny`
- `GET /admin/verification/stats/overview`

### DTOs

```ts
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  genres?: string[];
  isVerifiedArtist?: boolean;
  followersCount?: number;
  followingCount?: number;
  createdAt: string;
}

export interface OnboardingStatus {
  hasProfile: boolean;
  hasGenres: boolean;
  hasCompletedIntro: boolean; // or equivalent flags actually implemented
}

export interface ArtistVerificationRequest {
  id: string;
  userId: string;
  stageName: string;
  links: string[];
  notes?: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  denialReason?: string;
}
```

**Backend:**  
Ensure profile + verification endpoints return these shapes.  
Guard admin routes appropriately.

**Frontend-v2:**  
Profile page(s) use `UserProfile`.  
Onboarding flow uses `OnboardingStatus`.  
Verification UI uses `ArtistVerificationRequest` and user routes.

**Acceptance**  
Public profile, my profile, onboarding, and artist verification are wired and consistent.

---

## 9. Concrete File-by-File Instructions for Codex / Claude Code

### Example Prompt for Claude Code

> You are now operating inside VS Code with access to this doc.  
> Use it as the authoritative spec for Sedā v2.  
> Begin by:
> 1. Creating `frontend-v2/src/lib/api/http.ts` using the shared fetch client described in §9.1.  
> 2. Then, implement the API clients for SocialFeed, Playlists, Discover, Profiles, and Verification (see §9.2–§9.6).  
> 3. After that, refactor each page/component in `frontend-v2/src/app/(app)/` to use those helpers and DTOs.  
> 4. Do not create new routes or types unless explicitly needed — match backend endpoints from this doc.  
> 5. Confirm CORS, React import fixes, and environment variables are correctly set.

---

**Acceptance for Claude Code Phase 1:**
- `frontend-v2` runs on port 3002 or 3003.  
- No blank pages or 503s.  
- All API helpers exist, use consistent DTOs, and call `/api/v1/...`.  
- Backend console logs show live route hits.
