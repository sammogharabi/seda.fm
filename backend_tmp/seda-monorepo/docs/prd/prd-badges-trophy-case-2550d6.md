---
title: PRD – Badges & Trophy Case
notionId: 2550d66a-3cf2-80d7-a5cc-d477adcbfdbb
lastSynced: 2025-09-12T16:32:32.875Z
url: https://www.notion.so/PRD-Badges-Trophy-Case-2550d66a3cf280d7a5ccd477adcbfdbb
---
## 1. Overview

Badges and Trophy Cases provide recognition for fans and artists who engage meaningfully with **sedā.fm**. Badges are earned for achievements such as leaderboard placement, seasonal participation, or community contributions. The Trophy Case is a persistent showcase on user profiles that stores and displays all earned badges across time. Together, they form the foundation of sedā.fm’s recognition and reward system.

---

## 2. Goals & Non-Goals

**Goals**

- Create meaningful recognition for users’ contributions and achievements.
- Encourage sustained engagement through visible, collectible rewards.
- Provide a permanent record of participation that builds community identity.
- Integrate seamlessly with Leaderboards and seasonal resets.
**Non-Goals**

- Monetary or cash-equivalent rewards (MVP is recognition-only).
- Marketplace or trading of badges.
- Cross-platform portability of badges (e.g., bringing Spotify/Apple badges).
---

## 3. Target Users

- **Fans** → Collect badges to showcase their taste, influence, and dedication.
- **Artists/DJs** → Earn credibility through fan engagement and community recognition.
- **Community at large** → Uses badges as a quick signal of status and credibility.
---

## 4. User Stories & Flows

**User Story 1 — Fan Badge**

- As a fan, I want to earn a badge for being in the top 10% of a leaderboard so that I can show recognition for my influence.
**User Story 2 — Seasonal Recognition**

- As a fan, I want seasonal badges that stack in my Trophy Case so I can demonstrate consistent engagement over time.
**User Story 3 — Artist Credibility**

- As an artist, I want badges tied to community engagement so that my profile feels more credible and trustworthy.
**Flow: Badge Earn + Trophy Case Update**

1. User completes an action (leaderboard placement, seasonal milestone, contribution).
1. Badge is automatically awarded.
1. User receives a notification of achievement.
1. Badge appears in Trophy Case on profile.
1. Other users can view Trophy Case when visiting the profile.
---

## 5. Requirements

**Functional**

- Badge system integrated with Leaderboards and seasonal resets.
- Trophy Case on every profile (artists + fans).
- Automatic awarding of badges based on defined rules.
- Notifications for new badges earned.
- Ability to view full badge history.
**Badge Types (MVP)**

- **Gold** → Top 1% of leaderboard.
- **Silver** → Top 10%.
- **Bronze** → Top 25%.
- **Participant Badge** → ≥10 points in a season.
- **Seasonal Badge** → Earned each season for placement or participation.
**Non-Functional**

- Scalable to support many badge types over time.
- Consistent badge design language across all tiers.
- Low-latency badge awarding (instant recognition).
---

## 6. UX/UI

- **Profile Integration** → Trophy Case appears as a dedicated section on user profiles.
- **Badge Display** → Badges shown under username (mini display) + Trophy Case (full history).
- **Seasonal Design** → Badges visually distinct by season for easy recognition.
- **Notification Flow** → Real-time pop-up/banner when badge earned.
---

## 7. Dependencies

- Leaderboards (points → badge awarding).
- Event tracking (participation milestones).
- Profile system (to store and display Trophy Case).
- Notification service.
---

## 8. Design Principles

- **Recognition is Permanent** → Badges remain in the Trophy Case forever; nothing expires.
- **Identity is Visible** → Profiles showcase achievements as a reflection of community participation.
- **Progress is Motivating** → Users are notified immediately upon earning badges and can track progress season-to-season.
---

## 9. Success Metrics

- % of active users earning at least one badge per season.
- % of profiles with visible Trophy Cases.
- Increase in engagement (plays, votes, adds) tied to badge motivation.
- Retention lift from seasonal badge cycles.