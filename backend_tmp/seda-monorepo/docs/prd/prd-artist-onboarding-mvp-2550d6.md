---
title: PRD: Artist Onboarding (MVP)
notionId: 2550d66a-3cf2-804c-870d-f4e304796d22
lastSynced: 2025-09-12T16:31:53.752Z
url: https://www.notion.so/PRD-Artist-Onboarding-MVP-2550d66a3cf2804c870df4e304796d22
---
# seda — PRD: Artist Onboarding (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Artists)

**Target Customers**

Independent musicians, DJs, producers, and their teams who want to connect directly with fans.

**Underserved Needs**

1. Simple way to establish verified artist presence.
1. Ability to create or claim an artist room quickly.
1. Showcase music immediately (pinned track).
1. Invite and grow fan base in-platform.
1. Transparent privacy and control.
**Value Proposition**

seda artist onboarding empowers creators to **claim or create their space, pin a track, and start engaging fans in <2 minutes**.

**Feature Set (MVP)**

- Email + magic link login (optional Google/Apple).
- Username claim (unique).
- Artist role selection at signup.
- Artist room claim or creation.
- Pinned track setup.
- Fan invites (optional).
- Profile settings: edit display name, sign out, delete account.
**UX Principles**

Simple, fast, artist-first. Get music in front of fans immediately.

---

## 2.1 Goals & Non-Goals

**Goals**

- Enable artists to establish presence quickly.
- Pin music to represent their identity.
- Give artists control of their rooms.
**Non-Goals (MVP)**

- Monetization.
- Advanced verification/KYC.
- Rich artist profile customization.
---

## 2.2 Key Outcomes

- P0: Median signup→artist room claim/create <2 minutes.
- P0: 80% of artist signups complete onboarding.
- P1: 50% of artists pin a track within Day 1.
---

## 2.3 User Stories

- As an artist, I can sign up with email + magic link.
- As an artist, I can choose a username.
- As an artist, I can claim an existing artist profile/room.
- As an artist, I can create a new artist room if needed.
- As an artist, I can pin a track.
- As an artist, I can invite fans to my room.
---

## 2.4 Scope & Functional Requirements

- **Auth**: email magic link, optional Google/Apple.
- **Identity**: unique username.
- **Onboarding Flow (Artist)**:
  - Step 1: Pick username.
  - Step 2: Claim existing artist profile or create a new one.
  - Step 3: Upload/paste track link → set as pinned track.
  - Step 4: Invite fans (optional).
- **Account Settings**: display name, sign out, delete account.
- **Safety**: CAPTCHA, rate limits.
---

## 2.5 UX & IA

- Signup → magic link.
- Username setup.
- Claim/Create screen (search artist name).
- Pinned track setup.
- Invite fans screen.
- Profile settings for account control.
---

## 2.6 Data Model (simplified)

- `User { id, email, username, role:artist, display_name, created_at }`
- `ArtistProfile { id, user_id, name, verified?, room_id }`
- `OnboardingState { user_id, role, step_completed, artist_room_id?, pinned_track? }`
---

## 2.7 APIs (MVP)

- `POST /auth/signup {email}`
- `POST /auth/verify {token}`
- `POST /users/{id}/username`
- `POST /artist/claim {artist_name}`
- `POST /artist/create {artist_name, pinned_track}`
- `POST /users/{id}/delete`
---

## 2.8 Events & Analytics

- `signup_started`, `signup_completed`, `role_selected:artist`, `artist_profile_claimed`, `artist_room_created`, `pinned_track_set`, `fans_invited`.
---

## 2.9 NFRs

- Signup flow <15s.
- Artist claim search <2s.
- Availability 99.9%.
---

## 2.10 Risks & Mitigations

- **Impersonation risk** → claim flow with verification post-MVP.
- **Drop-off** → minimize steps, default flows.
- **Spam** → CAPTCHA, rate limits.
---

## 2.11 Release Plan

- **Alpha**: email signup, username only.
- **Beta**: add claim/create artist room.
- **MVP**: pinned track + optional fan invites.