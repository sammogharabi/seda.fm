---
title: PRD — Rooms DJ Sessions (Join, Start, Credits)
notionId: 26c0d66a-3cf2-8028-94cf-ddf403d93302
lastSynced: 2025-09-12T16:33:10.691Z
url: https://www.notion.so/PRD-Rooms-DJ-Sessions-Join-Start-Credits-26c0d66a3cf2802894cfddf403d93302
---
# **PRD — Rooms DJ Sessions (Join, Start, Credits)**

---

## **1. Overview**

Rooms DJ Sessions let members start a live set in any Room or join one already in progress. Sessions feature a **Now Playing panel**, **community queue with vote/skip logic**, **listener list**, **tier-based limits**, **configurable settings**, and **real-time follower notifications** when a host goes live.

**DJ Points** earned during sessions convert into **credits toward Seda Premium**, tying community engagement into the monetization model.

---

## **2. Goals & Non-Goals**

**Goals**

- Join or start DJ sessions seamlessly.
- Provide rich live interaction (votes, skips, reactions, co-DJing).
- Encourage engagement with DJ Points rewards.
- Let users redeem DJ Points as Premium credits.
**Non-Goals (MVP)**

- Session scheduling (covered in Scheduling PRD).
- Full moderation suite (bans, reporting).
- Non-premium redemptions (merch/tickets handled separately).
---

## **3. Target Users & Value**

- **Artists/Hosts** → curate sets, grow audience, earn credits.
- **Fans/Listeners** → discover music, participate live, earn points.
- **Room Admins** → provide safe, lively spaces with minimal setup.
**Value prop**: Real-time music experiences + progression system that rewards both DJs and listeners, driving Premium adoption.

---

## **4. User Stories**

- *As a listener*, I want to join a session instantly if it’s live.
- *As a user*, I want to start a session if none is active.
- *As a DJ*, I want to configure queue permissions, skip thresholds, and cooldowns.
- *As a listener*, I want to vote tracks up/down and skip if enough listeners agree.
- *As a DJ*, I want to earn points for tracks played and engagement.
- *As a listener*, I want to earn points for participation and redeem them for Premium.
- *As a follower*, I want to be notified when someone I follow goes live.
- *As a DJ*, I want to invite co-DJs to play alongside me (MVP).
---

## **5. Feature Set**

**MVP Features**

- Session presence indicator (live/not live).
- Join or Start session flow.
- DJMode: Now Playing, queue, votes, skip.
- DJSessionConfig: Permissions, cooldowns, privacy, tier limits.
- DJNotificationSystem: Follower go-live notifications.
- **Co-DJ invites** (new in MVP).
- **Per-user queue limit (max 2 pending)**.
- **Auto-end sessions after inactivity**.
- DJ Points + Credit conversion (core hooks).
**Future Enhancements**

- Multi-DJ rotations with structured turns.
- Scheduled sessions.
- Advanced moderation tools.
- Cross-room scene tagging.
---

## **6. UX Flows**

**Start Session**

1. Tap “Start DJ Session.”
1. Configure in DJSessionConfig.
1. Session mounts in DJMode.
**Join Session**

1. Tap “DJ Session Live — Join Now.”
1. Session mounts in DJMode.
1. Welcome toast appears.
**Vote/Skip**

- 1 vote per track per user.
- Auto-skip if downvotes ≥ threshold %.
- Skip button counts toward threshold.
**Co-DJing (MVP)**

- Listener requests co-DJ role.
- Host approves → user gains DJ permissions.
- Co-DJ can add to queue (within per-user limit).
**Notifications**

- Follower starts session → in-app toast + Join CTA.
- Persistent bell shows active live sessions.
**Session End**

- Auto-end after **X minutes with no listeners** (default 5m).
---

## **7. Tier Limits**

| **Tier** | **Max Listeners** | **Queue Size** | **Max Track** | **Private Session** | **Moderation** |
| --- | --- | --- | --- | --- | --- |
| Free | 50 | 20 | 10m | No | No |
| Premium | 200 | 100 | 20m | Yes | Yes |
| Artist | 1000 | 500 | 30m | Yes | Yes |

---

## **8. DJ Points & Credits**

### **Points Mapping**

| **Action / Event** | **Points** | **Notes** |
| --- | --- | --- |
| Add track to queue | +5 | Must pass cooldown & perms; capped at 2 pending tracks per user |
| Track completes | +10 | Awarded to adder; only if not skipped |
| Host track completion bonus | +5 | Extra for host |
| Listener upvote | +1 | Goes to track adder |
| Listener joins session | +2 | First join per session |
| Concurrency milestone | +25–100 | Host bonus at 25/50/100 listeners |
| Host completes 30m session | +50 | Encourages sustained sets |
| Follower joins via notification | +10 | Boosts notification CTR |

---

### **Credit Conversion Rules**

- **Rate**: 100 DJ Points = $1 Premium credit.
- **Redemption**: Credits apply only to Seda Premium subscription fees.
- **Invoice Visibility**: Credits **do show as line-items** on billing invoices.
- **Caps**:
  - Daily max: 1,000 DJ Points/user.
  - Session max: 500 DJ Points/host.
- **Expiry**: 12 months of inactivity.
---

### **Example Flow**

- Add track (+5)
- Track completes (+10)
- 3 upvotes (+3)
= **18 Points**

Repeat 6× in a week → 108 Points → **$1 credit** toward Premium.

---

## **9. Metrics**

- % Rooms with ≥1 live session/day.
- Avg listeners/session.
- Session length distribution.
- Points earned vs redeemed.
- % Premium upgrades funded with credits.
- Notification CTR → session join rate.
- Co-DJ participation rate.
---

## **10. Risks & Mitigations**

- **Brigading votes** → trust weighting (post-MVP).
- **Latency** → server-side sync & drift buffers.
- **Rights management** → provider APIs, upload restrictions.
- **Empty rooms** → notifications + “friends joined” nudges.
---

## **11. Open Questions (Updated)**

1. ✅ Co-DJ invites → **MVP**.
1. ✅ Per-user queue limits → **Max 2 pending per user**.
1. ✅ Auto-end → **Yes, after X minutes with no listeners**.
1. ✅ Verified artists skip protection → **No**.
1. ✅ Premium credit redemptions → **Yes, show as line-items on invoices**.
---

## **12. Rollout Plan**

- **Alpha**: Premium + Artist only, private Rooms.
- **Beta**: Add notifications, expand to public Rooms.
- **GA**: Open to all tiers, integrate DJ Points → Premium billing pipeline.
---
