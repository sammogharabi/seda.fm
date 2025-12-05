---
title: PRD: Moderation Dashboard
notionId: 2550d66a-3cf2-801c-9268-d93dea046d4b
lastSynced: 2025-09-12T16:33:14.700Z
url: https://www.notion.so/PRD-Moderation-Dashboard-2550d66a3cf2801c9268d93dea046d4b
---
# seda — PRD: Moderation Dashboard (Future)

*Last updated: 2025-08-19*

---

## Product Frame (Moderation Dashboard)

**Target Customers**

Internal seda admins and community managers who need tools to keep the platform safe and healthy.

**Underserved Needs**

1. Ability to respond to abusive or spammy behavior quickly.
1. Centralized view of reports from users across chat, rooms, and profiles.
1. Tools to take enforcement actions (warnings, suspensions, bans).
1. Audit logs to track actions for accountability.
1. Lightweight filters to prioritize most urgent cases.
**Value Proposition**

The Moderation Dashboard gives seda admins **a centralized control panel to manage user safety and platform integrity**, ensuring fans and artists can engage without harassment or abuse.

**Feature Set (Future)**

- Dashboard with feed of reported items (profiles, rooms, chats, playlists).
- Report details view with context (report reason, reporter info, evidence).
- Moderation actions: warn, mute, suspend, ban, deactivate content.
- Filters: by report type, severity, frequency.
- Audit log of all actions.
- Notifications to reporter when action taken (optional phase 2).
**UX Principles**

Fast triage, minimal clicks, clear accountability.

---

## 1.1 Goals & Non-Goals

**Goals**

- Allow seda admins to respond to user reports.
- Provide lightweight enforcement tools.
- Keep audit trail for accountability.
**Non-Goals (Future)**

- Automated moderation/AI-driven detection.
- Community-led moderation tools (handled separately).
- Artist verification (separate dashboard).
---

## 1.2 Key Outcomes

- P0: 95% of abusive content removed within 24h of report.
- P0: 100% of admin actions logged.
- P1: Average report resolution <6h.
---

## 1.3 User Stories

- As an admin, I can see a list of recent reports.
- As an admin, I can filter reports by severity.
- As an admin, I can review context (chat transcript, profile content).
- As an admin, I can issue enforcement actions.
- As an admin, I can view a log of past actions.
---

## 1.4 Scope & Functional Requirements

- **Reports Feed**: list of open reports sorted by severity.
- **Report Details**: show reporter, target, reason, evidence.
- **Actions**: warn, mute, suspend, ban, deactivate content.
- **Audit Logs**: all actions recorded with timestamp + admin.
- **Search/Filter**: by report type, severity, target user.
---

## 1.5 UX & IA

- Dashboard layout: left sidebar (filters), main feed (reports), right panel (details + actions).
- One-click action buttons (warn, mute, suspend, ban).
- Audit log tab.
---

## 1.6 Data Model (simplified)

- `Report { id, reporter_id, target_id, target_type, reason, evidence_url?, status, created_at, resolved_at? }`
- `ModerationAction { id, admin_id, target_id, target_type, action_type, reason?, created_at }`
---

## 1.7 APIs (Future)

- `GET /reports` (list reports).
- `GET /reports/{id}` (report details).
- `POST /reports/{id}/action` (warn/mute/suspend/ban).
- `GET /moderation/actions` (audit log).
---

## 1.8 Events & Analytics

- `report_submitted`, `report_resolved`, `moderation_action_taken`.
- SLAs: % of reports resolved within 6h/24h.
---

## 1.9 NFRs

- Report processing latency <2s.
- Dashboard uptime 99.9%.
- Actions irreversible without super-admin override.
---

## 1.10 Risks & Mitigations

- **Over-enforcement** → add audit logs + reviewer notes.
- **Under-enforcement** → SLA tracking + alerts.
- **Abuse of moderator power** → full transparency via audit logs.
---

## 1.11 Release Plan

- **Alpha**: manual review of reports in DB, manual actions.
- **Beta**: in-app dashboard with reports feed + basic actions.
- **Future (Full)**: filters, audit logs, notification system.