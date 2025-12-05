---
title: Artist Verification Flow
notionId: 2550d66a-3cf2-80d2-ab75-c429bf0845de
lastSynced: 2025-09-12T16:32:28.660Z
url: https://www.notion.so/Artist-Verification-Flow-2550d66a3cf280d2ab75c429bf0845de
---
# seda — PRD: Artist Verification Flow (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Artist Verification)

**Target Customers**

Artists, DJs, and their teams who want to prove authenticity to fans by obtaining a verified badge.

**Underserved Needs**

1. Prevent impersonation of artists.
1. Provide trust and credibility for official artist profiles.
1. Simple and secure process for artists without needing label metadata or social logins.
1. Lightweight moderation for admins.
**Value Proposition**

Artist Verification provides **authenticity and trust** in seda, ensuring fans know they are following real artists. Verification is based on artists proving control of their public presence using a **claim code** system.

**Feature Set (MVP)**

- Artist requests verification via profile.
- System generates unique claim code.
- Artist pastes code on a public channel they control (e.g., Bandcamp bio, personal website, newsletter, SoundCloud description).
- seda crawler or admin confirms code presence.
- Upon confirmation, artist profile is marked verified.
- Verified badge displayed on artist profile and in rooms.
- Admin override flow for edge cases.
**UX Principles**

Simple, trustable, verifiable by fans. No reliance on third-party label metadata.

---

## 1.1 Goals & Non-Goals

**Goals**

- Provide a secure and universal verification method.
- Keep the process lightweight and transparent.
- Make badges consistent and meaningful.
**Non-Goals (MVP)**

- Automated distributor or PRO metadata checks.
- Paid verification.
- Legal contracts.
---

## 1.2 Key Outcomes

- P0: 90% of verification requests resolved within 7 days.
- P0: 0 impersonation complaints from verified profiles.
- P1: 70% of verified artists see ≥20% more profile views.
---

## 1.3 User Stories

- As an artist, I can request verification.
- As an artist, I receive a unique code.
- As an artist, I can paste the code into my Bandcamp bio or website.
- As the system, I can crawl and verify the code is present.
- As an admin, I can manually verify if automated crawl fails.
- As a fan, I can see a verification badge on real artist profiles.
---

## 1.4 Scope & Functional Requirements

- **Request Flow**: artist clicks “Request Verification” → seda generates unique code.
- **Placement**: artist pastes code on a public channel they control.
- **Verification**: seda crawler checks presence of code; fallback admin review.
- **Badge Assignment**: verified flag set on profile.
- **Notifications**: artist notified when approved.
---

## 1.5 UX & IA

- Artist Profile → “Request Verification” button.
- Modal explaining how to paste claim code on Bandcamp/website.
- Status indicator: Pending, Verified, or Denied.
- Badge appears on profile and in-room identity when verified.
---

## 1.6 Data Model (simplified)

- `VerificationRequest { id, user_id, claim_code, target_url, status(enum:pending|approved|denied), submitted_at, reviewed_at?, reviewed_by? }`
- `ArtistProfile { user_id, artist_name, verified:boolean }`
---

## 1.7 APIs (MVP)

- `POST /artist/verification/request` → returns claim code.
- `POST /artist/verification/submit {claim_code, target_url}`.
- `GET /artist/verification/status/{id}`.
- `PATCH /artist/verification/{id}` (admin approve/deny).
---

## 1.8 Events & Analytics

- `artist_verification_requested`, `artist_verification_code_generated`, `artist_verification_code_verified`, `artist_verification_approved`.
- Funnels: request → code posted → verified.
---

## 1.9 NFRs

- Crawl verification latency <24h.
- Badge display latency <1s after approval.
- Availability 99.9%.
---

## 1.10 Risks & Mitigations

- **Code not found** → fallback to admin manual check.
- **Artists without public channels** → handled via admin exception path.
- **Malicious impersonation** → code must be visible on an official channel the real artist controls.
---

## 1.11 Release Plan

- **Alpha**: manual code validation by admins.
- **Beta**: crawler auto-checks Bandcamp + websites.
- **MVP**: automated verification with claim code, admin fallback, badge issued.