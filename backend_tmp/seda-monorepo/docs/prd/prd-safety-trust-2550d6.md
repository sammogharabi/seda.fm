---
title: PRD: Safety & Trust
notionId: 2550d66a-3cf2-8089-af19-d4c25e51237c
lastSynced: 2025-09-12T16:33:17.252Z
url: https://www.notion.so/PRD-Safety-Trust-2550d66a3cf28089af19d4c25e51237c
---
# seda — Safety & Trust PRD

*Last updated: 2025-08-19*

---

## 1. Product Frame

**Target Customers**

Fans, artists, and community members who want to feel safe, respected, and authentic while participating in seda.

**Underserved Needs**

- Clear, trustworthy artist verification
- Simple ways to report abuse or spam
- Direct user-level controls to block/mute harmful users
- Admin tools to act quickly on reports
- A consistent, transparent safety framework across rooms, playlists, profiles, and chat
**Value Proposition**

Safety & Trust systems make seda a platform where fans and artists can engage **authentically and safely**, balancing freedom of expression with protection against abuse.

---

## 2. Feature Set

**MVP**

- Artist Verification (claim code + admin approval, badge)
- Reporting (profiles, messages, rooms, playlists)
- Blocking (no DM, tags, invites, follows, collabs, or room/playlist presence)
- Muting (hide activity)
- Basic Admin Dashboard (flat access model, report & verification queues)
**Post-MVP**

- Blocked/muted list management in Settings
- Invisibility in shared rooms & playlists
**Future**

- Automated moderation / AI detection
- SLA dashboards for admin
- Reporter status tracking
---

## 3. Goals & Non-Goals

**Goals**

- Ensure safe interactions across chat, rooms, and playlists
- Provide authenticity through artist verification
- Empower users with blocking and muting tools
- Give admins a clear dashboard for handling reports and verifications
**Non-Goals**

- Automated moderation (future)
- Complex role-based admin permissions
- Public visibility of report/block status
---

## 4. Key Outcomes

- ≥95% of harmful content reported within 1h of posting
- ≥15% of MAUs use safety features (report, block, mute)
- Reduce average report-to-action time to <6h
- 100% verified artists have badge visible on profile
---

## 5. User Stories

- As an artist, I can verify my profile to signal authenticity
- As a fan, I can report abusive behavior quickly
- As a user, I can block or mute someone to protect my experience
- As a blocked user, I am unaware I’ve been blocked, but cannot interact
- As an admin, I can review reports and verifications from one dashboard
---

## 6. Scope & Functional Requirements

- **Verification**: code claim system, admin approval
- **Reporting**: accessible via 3-dot menu, modal submission, confirmation toast
- **Blocking/Muting**: instant, silent enforcement across chat, rooms, playlists
- **Admin Dashboard**: reports, verification queue, decision logging
- **List Management**: blocked & muted list available in settings
---

## 7. UX Principles

- Simple, fast, accessible safety flows
- Silent handling of blocks to prevent escalation
- Verification flows that balance ease of use with authenticity
- Consistency across rooms, playlists, profiles, and chat
---

## 8. Data Model (Simplified)

- `Report { id, reporter_id, target_id, type, reason, status, created_at }`
- `Block { id, blocker_id, blocked_id, created_at }`
- `Mute { id, muter_id, muted_id, created_at }`
- `Verification { id, artist_id, method, evidence, status, created_at }`
---

## 9. APIs (Future)

- `POST /reports`
- `POST /blocks` / `DELETE /blocks/{id}`
- `POST /mutes` / `DELETE /mutes/{id}`
- `POST /verification-requests`
- `GET /reports`, `GET /blocks`, `GET /mutes`, `GET /verification-requests`
---

## 10. Analytics & Events

**Events**

- `report_submitted`
- `user_blocked`
- `user_muted`
- `user_unblocked`
- `user_unmuted`
- `verification_submitted`
- `verification_approved`
- `verification_denied`
**Metrics**

- Volume by surface
- Report resolution SLA
- Unblock/unmute rates
- Verification approval rates
---

## 11. NFRs

- Submission latency <2s
- Instant enforcement of blocks/mutes
- Real-time presence filtering in rooms
- Secure storage of verification evidence
- 99.9% uptime
---

## 12. Risks & Mitigations

- **False reports** → rate limits, admin checks
- **Spam verifications** → code system, admin approval
- **Overuse of block/mute** → unblock/unmute option
- **Scalability** → dashboards designed for pagination and filtering
---

## 13. Release Plan

**MVP**

- Artist verification
- Reporting
- Blocking/muting
- Basic admin dashboard
**Post-MVP**

- List management
- Invisibility in rooms/playlists
**Future**

- Automated moderation
- SLA dashboards
- Reporter status tracking