---
title: Fan Onboarding (MVP)
notionId: 2550d66a-3cf2-8085-a6ae-f8bb64cbc94e
lastSynced: 2025-09-16T22:53:13.793Z
url: https://www.notion.so/Fan-Onboarding-MVP-2550d66a3cf28085a6aef8bb64cbc94e
---
# seda — PRD: Fan Onboarding (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Fans)

**Target Customers**

Music fans, curators, and micro-communities (DJs, scene leaders) who want to discover and chat about tracks in real time.

**Underserved Needs**

1. Quick signup with minimal friction.
1. Fast entry into rooms and conversations.
1. Portable identity (username across rooms).
1. Transparent privacy and control.
**Value Proposition**

seda fan onboarding gets new listeners from **signup → first room → first message in <2 minutes**, ensuring they feel part of the community immediately.

**Feature Set (MVP)**

- Email + magic link login (optional Google/Apple).
- Username claim (unique).
- Genre/artist interest selection.
- Suggested rooms to join.
- Prompt to send first message.
- Profile settings: edit display name, sign out, delete account.
**UX Principles**

Simple, fast, rewarding. Default to trust, minimize steps, celebrate first action.

---

## 1.1 Goals & Non-Goals

**Goals**

- Guide fans into rooms and conversations quickly.
- Deliver a clear sense of identity (username).
- Encourage first message in <2 minutes.
**Non-Goals (MVP)**

- Rich profile customization.
- Advanced identity verification.
---

## 1.2 Key Outcomes

- P0: Median signup→first message <2 minutes.
- P0: 80% of fans complete onboarding flow.
- P1: 70% join ≥1 room Day 1.
---

## 1.3 User Stories

- As a fan, I can sign up with email + magic link.
- As a fan, I can choose a unique username.
- As a fan, I can pick genres/artists I like.
- As a fan, I can join suggested rooms immediately.
- As a fan, I can post my first message.
- As a fan, I can edit my display name later.
---

## 1.4 Scope & Functional Requirements

- **Auth**: email magic link, optional Google/Apple, secure session.
- **Identity**: unique username (3–20 chars).
- **Onboarding Flow**:
  - Step 1: Pick username.
  - Step 2: Select 3+ genres/artists.
  - Step 3: Suggest 1–3 rooms.
  - Step 4: Prompt to send first message.
- **Account Settings**: display name, sign out, delete account.
- **Safety**: CAPTCHA on suspicious signups.
---

## 1.5 UX & IA

- Signup → magic link.
- Username setup.
- Genre/artist selection screen.
- Suggested rooms screen.
- Prompt: “Say hi!” in room composer.
- Profile settings for account control.
---

## 1.6 Data Model (simplified)

- `User { id, email, username, display_name, role:fan, created_at }`
- `OnboardingState { user_id, step_completed, genres_selected[], rooms_joined[] }`
---

## 1.7 APIs (MVP)

- `POST /auth/signup {email}`
- `POST /auth/verify {token}`
- `POST /users/{id}/username`
- `GET /rooms/suggested`
- `POST /users/{id}/delete`
---

## 1.8 Events & Analytics

- `signup_started`, `signup_completed`, `onboarding_step_completed`, `room_suggested`, `room_joined`, `first_message_sent`.
---

## 1.9 NFRs

- Signup flow <15s.
- Availability 99.9%.
---

## 1.10 Risks & Mitigations

- **Drop-off** → minimize steps, auto-suggest rooms.
- **Spam** → CAPTCHA, rate limit.
- **Username squatting** → reserved list.
---

## 1.11 Release Plan

- **Alpha**: email signup, username only.
- **Beta**: add genres selection, suggested rooms.
- **MVP**: full flow with first message prompt.