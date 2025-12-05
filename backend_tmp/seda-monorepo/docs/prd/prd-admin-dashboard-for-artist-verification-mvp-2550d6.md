---
title: PRD: Admin Dashboard for Artist Verification (MVP)
notionId: 2550d66a-3cf2-8044-b4b0-eefea17dbee0
lastSynced: 2025-09-12T16:32:29.514Z
url: https://www.notion.so/PRD-Admin-Dashboard-for-Artist-Verification-MVP-2550d66a3cf28044b4b0eefea17dbee0
---
# seda — PRD: Admin Dashboard for Artist Verification (MVP)

*Last updated: 2025-08-19*

---

## Product Frame (Admin Verification Dashboard)

**Target Customers**

Internal seda team members responsible for reviewing and approving artist verification requests.

**Underserved Needs**

1. Efficient way to review pending verification requests.
1. Ability to see claim codes and validate placement.
1. Handle exceptions when automated crawler fails.
1. Track status and history of requests.
**Value Proposition**

The Admin Dashboard enables seda staff to **quickly review, approve, or deny artist verification requests**, ensuring authenticity and trust at scale.

**Feature Set (MVP)**

- Dashboard listing all verification requests.
- Filters by status: Pending, Approved, Denied.
- Request detail view: artist info, claim code, submitted URL, crawler result, timestamp.
- Actions: Approve, Deny (with notes).
- History log of actions per request.
- Notifications triggered on decision (email to artist).
---

## 1.1 Goals & Non-Goals

**Goals**

- Provide seda staff with a simple interface to manage verification.
- Ensure consistent and auditable decision-making.
- Reduce turnaround time for verification.
**Non-Goals (MVP)**

- Fully automated verification without admin oversight.
- Batch/automated approvals without checks.
- Public-facing dashboard.
---

## 1.2 Key Outcomes

- P0: 90% of requests processed within 7 days.
- P0: 100% of decisions logged with timestamp and reviewer ID.
- P1: <10% of requests require re-review.
---

## 1.3 User Stories

- As an admin, I can view all pending artist verification requests.
- As an admin, I can open a request to see claim code, target URL, and crawler result.
- As an admin, I can approve or deny a request, adding notes if needed.
- As an admin, I can see the history of actions taken on each request.
- As an admin, I trigger an email notification to the artist upon decision.
---

## 1.4 Scope & Functional Requirements

- **Dashboard**: list view with search/filter by artist name and status.
- **Detail View**: artist name, claim code, submitted URL, crawler screenshot/result, timestamps.
- **Actions**: Approve/Deny with notes.
- **Logs**: record reviewer, decision, and timestamp.
- **Notifications**: automated email sent to artist.
---

## 1.5 UX & IA

- **List View**: table with columns (Artist Name, Claim Code, URL, Status, Submitted Date).
- **Detail Panel**: claim code, crawler result preview, action buttons.
- **Action Modal**: confirm Approve/Deny, add notes.
- **Logs Tab**: history of actions.
---

## 1.6 Data Model (simplified)

- `VerificationRequest { id, user_id, claim_code, target_url, status, submitted_at, reviewed_at?, reviewed_by?, notes? }`
- `VerificationAction { id, request_id, reviewer_id, action(enum), notes?, timestamp }`
---

## 1.7 APIs (MVP)

- `GET /admin/verification/requests?status=pending`
- `GET /admin/verification/{id}`
- `PATCH /admin/verification/{id}` (approve/deny with notes)
- `GET /admin/verification/{id}/actions`
---

## 1.8 Events & Analytics

- `verification_request_reviewed`, `verification_request_approved`, `verification_request_denied`.
- SLA metric: time from submission → resolution.
- Error metric: % of requests reopened after decision.
---

## 1.9 NFRs

- Dashboard load time <1s.
- All actions must be logged for audit.
- Only authorized admins can access dashboard.
- 99.9% availability.
---

## 1.10 Risks & Mitigations

- **Admin error** → add notes + logs for accountability.
- **Scalability** → add filters/search to manage high volume.
- **Security** → role-based access control for admin users only.
---

## 1.11 Release Plan

- **Alpha**: basic list + approve/deny via CLI or simple table.
- **Beta**: full web dashboard with detail view and logs.
- **MVP**: production-ready admin dashboard with filters, logs, and notifications.