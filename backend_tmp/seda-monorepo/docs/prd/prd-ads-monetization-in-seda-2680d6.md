---
title: PRD: Ads Monetization in Seda
notionId: 2680d66a-3cf2-80e7-bb44-e1b39fde173e
lastSynced: 2025-09-12T16:33:40.387Z
url: https://www.notion.so/PRD-Ads-Monetization-in-Seda-2680d66a3cf280e7bb44e1b39fde173e
---
# **PRD: Ads Monetization in Seda**

## **1. Overview**

Ads will be introduced into Seda as a **secondary monetization stream**, complementing subscriptions, ScenePass, presales, and merch. The approach is **fan-first**: ads are optional (rewarded), contextual (sponsored rooms/drops), or light-touch (capped interstitials). Premium remains **100% ad-free** as the main upsell lever.

---

## **2. Target Customers**

- **Fans (Free Tier)**: consume Seda with ads and earn credits via rewarded ads.
- **Premium Fans**: pay for an ad-free experience.
- **Artists**: promote their merch/drops via self-serve ads.
- **Brands**: sponsor rooms, events, or run targeted campaigns to reach music communities.
---

## **3. Underserved Needs**

- **Fans**: free access without ad overload; ability to earn credits.
- **Artists**: more monetization tools (merch/event promotion).
- **Brands**: authentic engagement with niche communities.
- **Seda**: diversified revenue without harming UX.
---

## **4. Value Proposition**

- **Fans**: ads become a *perk* (credits, unlocks) instead of a tax.
- **Artists**: access to self-serve boosting and brand collabs.
- **Brands**: reach engaged communities aligned with their identity.
- **Seda**: monetize free users, strengthen Premium upgrade path, unlock sponsorships.
---

## **5. Feature Set**

### **MVP Formats**

1. **Audio Interstitials**
  - Placement: between tracks or room transitions.
  - Cap: 2–3 per hour.
  - Served via ad server.
1. **Display Ads**
  - Placement: in feed (cards between posts/playlists).
  - Clear “Sponsored” tag.
1. **Rewarded Ads**
  - Placement: credits wallet/unlock screen.
  - UX: “Watch a 30-sec ad → earn 100 credits.”
  - Integrated into Seda credits system.
### **Phase 2 (Q2–Q3)**

- Sponsored Rooms (brand in room header).
- Sponsored Drops (artist x brand collabs).
- Artist merch boosting (self-serve promotions).
### **Phase 3 (Q4)**

- Interactive ads (polls, quizzes, trivia).
- Affiliate ads (vinyl, headphones, festivals).
- Dynamic targeting via ScenePass data.
---

## **6. User Experience**

### **Free Fans**

- See light audio + display ads.
- Can opt into rewarded ads for credits.
- Ads aligned to scenes/genres.
### **Premium Fans**

- 100% ad-free.
- Benefit: 2× credit multiplier.
### **Artists**

- Boost merch via sponsored posts.
- Eligible for branded drops/sponsorships.
### **Brands**

- Sponsor rooms/events.
- Target by scene/genre.
---

## **7. Success Metrics**

- Ad revenue per MAU (ARPU).
- Rewarded ad opt-in % (target 10–20%).
- Premium upgrade rate from Free.
- Sponsorship adoption (rooms/drops).
- Fan NPS (ads should not harm experience).
---

## **8. Risks & Mitigations**

- **Ad overload → churn** → cap frequency strictly.
- **Low ad relevance** → ScenePass targeting.
- **Fan trust erosion** → clear “Sponsored” labels; no data reselling.
- **Artist pushback** → opt-in sponsorships only.
---

## **9. Integration Requirements**

- **Ad Server**: Google Ad Manager or equivalent.
- **Credits System**: rewarded ads tied to Seda wallet.
- **ScenePass Data**: targeting by genre/scene.
- **Artist Portal**: add “Boost” button for merch promotions.
---

## **10. Implementation Roadmap**

**MVP (Q1)**

- Audio interstitials.
- Display feed ads.
- Rewarded ads → credits.
**Phase 2 (Q2–Q3)**

- Sponsored Rooms & Drops.
- Artist merch boosting.
- Event sponsorship integrations.
**Phase 3 (Q4)**

- Interactive ads.
- Affiliate ads.
- Advanced targeting.
---

## **11. Open Questions (MVP Decisions)**

1. **Should rewarded ads earn credits at a fixed rate or vary by CPM?**
✔ Fixed for MVP (100 credits/ad).

1. **Should artists be able to pay in credits (not cash) to boost merch visibility?**
❌ No.

1. **Do we allow third-party brand takeovers of the Seda homepage/feed?**
❌ No brand takeovers; only in-scene ads.

1. **How do we handle age-sensitive ads (alcohol, cannabis, etc.)?**
✔ Collect DOB; only show to fans of legal age.
