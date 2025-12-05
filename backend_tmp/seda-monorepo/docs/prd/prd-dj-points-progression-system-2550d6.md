---
title: PRD – DJ Points (Progression System)
notionId: 2550d66a-3cf2-80d0-8fc9-cbd4ca3aa215
lastSynced: 2025-09-12T16:32:37.238Z
url: https://www.notion.so/PRD-DJ-Points-Progression-System-2550d66a3cf280d08fc9cbd4ca3aa215
---
# **PRD – DJ Points (Progression System)**

## **1. Overview**

The **DJ Points & Progression System** gamifies participation in **sedā.fm’s DJ Mode**. Users earn points for DJing tracks, receiving positive votes, and keeping audiences engaged. These points contribute to a progression system with levels and badges, unlocking recognition and status.

Progression also rewards members with **credits**, which are redeemable **only toward Premium membership upgrades and renewals**. This keeps rewards tightly aligned with conversion and retention goals.

---

## **2. Goals & Non-Goals**

**Goals**

- Reward DJs for curating tracks audiences enjoy.
- Provide clear progression through points, levels, badges, and credits.
- Use credits as a targeted lever to convert Free users into Premium subscribers.
- Reinforce subscription value by rewarding engagement.
**Non-Goals**

- Cash payouts or direct financial transfers.
- Credits redeemable for merch or ScenePasses.
- Unlocking core platform functionality behind levels.
---

## **3. Target Users**

- **Free DJs** → Recognition + milestone credits, redeemable only for Premium → incentive to upgrade.
- **Premium DJs** → Recognition + credits that offset renewals, reinforcing retention.
- **Artist DJs** → Validation + credits they can apply to Premium, keeping them subscribed.
---

## **4. User Stories & Flows**

**User Story 1 — Free User Incentive**

As a Free user, I want to earn credits through DJing so that I feel rewarded and can upgrade to Premium without paying full price.

**User Story 2 — Premium Retention**

As a Premium user, I want to earn credits so that my subscription feels more valuable and is easier to sustain long term.

**Flow: DJ Session → Points → Progression → Credits → Premium Upgrade/Renewal**

1. DJ plays a track in DJ Mode.
1. Audience reacts with upvotes/downvotes.
1. System assigns points.
1. Points accumulate toward user’s DJ Level.
1. Level thresholds trigger **badges + credit rewards**.
1. Credits accrue in wallet → redeemable only toward Premium.
---

## **5. Requirements**

**Functional**

- Points earned for:
  - +1 per track successfully played.
  - +1 per audience upvote.
  - –1 per audience downvote.
- Levels unlocked at cumulative point thresholds.
- Progress bar displayed in DJ Mode UI.
- Level-based badges auto-awarded and added to Trophy Case.
- Seasonal leaderboards integrate with DJ Points totals.
- **Credits rewarded at milestone levels (see table below).**
- Credits redeemable only toward Premium.
**Non-Functional**

- Low-latency point and credit updates (real time).
- Scalable scoring + wallet system.
- Guardrails: credit accrual caps per season to prevent abuse.
---

## **6. Reward Structure (Levels + Credits)**

| **Level** | **Points Required** | **Badge Earned** | **Credits Earned** | **Redemption** |
| --- | --- | --- | --- | --- |
| 1 | 10 | Bronze Note | – | – |
| 2 | 25 | Silver Note | 5 credits | Premium only |
| 3 | 50 | Gold Note | 10 credits | Premium only |
| 4 | 100 | Platinum Note | 20 credits | Premium only |
| 5 | 200 | Diamond Note | 40 credits | Premium only |
| 6+ | Seasonal Prestige | Prestige Badge | 50 credits cap/season | Premium only |

**Redemption Rule**

- 100 credits = 1 month Premium.
- Credits cannot be redeemed for merch, ScenePasses, or other products.
---

## **7. UX/UI**

- **DJ Mode UI** → Progress bar + credits tally under DJ username.
- **Level Indicator** → Shown next to DJ name in queue and in-room chat.
- **Badge Display** → Awarded at milestones, visible in Trophy Case.
- **Credits Wallet** → Accessible from profile; shows balance + Premium-only redemption path.
- **Notifications** → Real-time pop-ups for points, level-ups, and credit rewards.
---

## **8. Dependencies**

- Leaderboards PRD (points feed into rankings).
- Badges & Trophy Case PRD (badges awarded at level thresholds).
- Event tracking (upvotes, downvotes, plays).
- Notification service.
- **Credits Wallet Service + Premium Subscription APIs.**
---

## **9. Design Principles**

- **Progress is Transparent** → DJs always see real-time progress toward the next level + credits.
- **Recognition is Earned** → Levels and badges reflect genuine audience feedback.
- **Premium is the Goal** → Credits serve one purpose: drive upgrades and renewals.
- **Competition is Healthy** → Rewards incentivize fun, community-driven DJing, not spam.
---

## **10. Credit Economy Model**

### **Assumptions**

- Premium Price = **$9.99/month**.
- Credit Exchange = **100 credits = 1 month Premium**.
- Max seasonal credits = **125 (≈1.25 months Premium)**.
- Seasons = **3 per year** (4 months each).
### **Average Credits Earned**

Weighted average = **~35.5 credits per DJ per season** → ~106 credits per year (~1 month Premium).

### **Cost vs Value**

- Avg cost to Seda: ~$10 per DJ per year.
- Premium ARPU: ~$120/year.
- Break-even requires either:
  - +8–10% conversion lift among Free users.
  - +1 month extra retention among Premium users.
---

## **11. Free vs Premium Cohorts – Impact Table**

| **Cohort** | **Earned Credits/Year** | **Redemption Path** | **Impact on Seda** |
| --- | --- | --- | --- |
| Free Users | ~106 credits (≈1 mo) | Upgrade to Premium | Drives conversion. Even 10% lift offsets subsidy. |
| Premium Users | ~106 credits (≈1 mo) | Renewal discount | Lowers churn risk. 1 extra retained month offsets cost. |
| Power DJs (Top 5%) | 125 credits/season cap | Renewal discount | Subsidy max = 1.25 months/year. Still profitable given ARPU. |

---

## **12. Success Metrics**

- % of Free DJs who upgrade to Premium after earning credits.
- % of Premium users who redeem credits toward renewal.
- Average credits earned per DJ per season.
- Effective subsidy cost vs ARPU.
- ROI: Net subscription revenue gained vs credit cost.
- Retention uplift for Premium DJs vs Free DJs.
---

✅ With this setup, the system:

- Rewards engagement.
- Converts Free → Premium.
- Retains Premium.
- Caps subsidy risk to ~$10/user/year, while ARPU is ~$120/year.
---

Do you want me to also **mock up a sample Credits Wallet UI (with Free vs Premium states)** so you can show investors how the redemption flow looks in-app?

# DJ Points & Progression System PRD

## 1. Overview

The DJ Points & Progression System is designed to gamify participation in **sedā.fm’s DJ Mode**. Users earn points for DJing tracks, receiving positive votes, and keeping audiences engaged. These points contribute to a progression system with levels and badges, unlocking recognition and status. The system provides DJs — both artists and fans — with motivation to play high-quality sets that resonate with their audience.

---

## 2. Goals & Non-Goals

**Goals**

- Reward DJs for curating tracks that audiences enjoy.
- Provide clear progression through points, levels, and recognition.
- Encourage healthy competition between DJs in public rooms.
- Integrate progression with badges and trophy cases.
**Non-Goals**

- Monetary or cash-equivalent rewards (recognition only).
- Complex unlockables (e.g., features gated behind levels).
- Direct fan-to-DJ tipping or payments (separate feature).
---

## 3. Target Users

- **Fan DJs** → Casual users who want recognition for good taste.
- **Artist DJs** → Artists building credibility and fan engagement.
- **Audience Members** → Benefit indirectly by hearing higher-quality sets driven by incentives.
---

## 4. User Stories & Flows

**User Story 1 — Fan Progression**

- As a fan, I want to earn points when people upvote my track so that I feel recognized for good taste.
**User Story 2 — Artist Validation**

- As an artist, I want my points to reflect how well my music performs live in rooms so that I gain credibility.
**User Story 3 — Leveling Up**

- As a DJ, I want to see my progress toward the next level so that I stay motivated to play more.
**Flow: DJ Session → Points → Progression**

1. DJ plays a track in DJ Mode.
1. Audience reacts with upvotes/downvotes.
1. System assigns points based on outcome.
1. Points accumulate toward user’s DJ Level.
1. Progress bar updates in real time.
1. Level-ups trigger badges, displayed in the Trophy Case.
---

## 5. Requirements

**Functional**

- Points earned for:
  - +1 per track successfully played.
  - +1 per audience upvote.
  - –1 per audience downvote.
- Levels unlocked at cumulative point thresholds.
- Progress bar displayed in DJ Mode UI.
- Level-based badges auto-awarded and added to Trophy Case.
- Seasonal leaderboards integrate with DJ Points totals.
**Non-Functional**

- Low-latency point updates (real time).
- Scalable scoring system to handle thousands of DJs concurrently.
- Consistent integration with Leaderboards + Badges systems.
---

## 6. UX/UI

- **DJ Mode UI** → Progress bar under DJ username.
- **Level Indicator** → Shown next to DJ name in queue and in-room chat.
- **Badge Display** → Awarded at milestones, visible in Trophy Case.
- **Notifications** → Real-time pop-ups for point gains and level-ups.
---

## 7. Dependencies

- Leaderboards PRD (points feed into rankings).
- Badges & Trophy Case PRD (badges awarded at level thresholds).
- Event tracking (upvotes, downvotes, plays).
- Notification service.
---

## 8. Design Principles

- **Progress is Transparent** → DJs always see real-time progress toward the next level.
- **Recognition is Earned** → Levels and badges reflect genuine audience feedback.
- **Competition is Healthy** → Points incentivize fun, community-driven DJing, not spam.
---

## 9. Success Metrics

- % of DJs who progress at least one level per season.
- Average session length for DJs (pre- vs. post-progression).
- Increase in audience engagement (votes per track).
- Retention improvement for DJs who level up vs. those who don’t.