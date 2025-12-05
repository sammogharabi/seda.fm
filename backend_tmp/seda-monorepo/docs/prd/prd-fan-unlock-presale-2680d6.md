---
title: PRD: Fan Unlock Presale
notionId: 2680d66a-3cf2-80a7-98eb-d5106c991588
lastSynced: 2025-09-12T16:33:42.076Z
url: https://www.notion.so/PRD-Fan-Unlock-Presale-2680d66a3cf280a798ebd5106c991588
---
# **PRD: Fan Unlock Presale**

## **1. Overview**

The **Fan Unlock Presale** feature enables artists on seda.fm to run **exclusive, secure ticket presales** that prioritize real fans over bots and scalpers. Instead of generic codes that are easily exploited, fans unlock presale access through a **unique Fan ID** tied to their verified seda.fm profile.

This feature puts **artists back in control of their ticketing** while rewarding engaged fans with fair pricing and early access.

---

## **2. Target Customers**

- **Artists**: who want to protect their community from scalpers and ensure their tickets reach genuine fans.
- **Fans**: who want fair, early access to shows without paying inflated resale prices.
- **Venues / Promoters**: who want smooth ticket allocation and better event attendance rates.
---

## **3. Underserved Needs**

- **Scalper Protection**
- **Fair Access**
- **Artist Control**
- **Identity-Based Access**
---

## **4. Value Proposition**

- **For Artists**: Retain control over who attends your shows and strengthen fan loyalty.
- **For Fans**: Guaranteed bot-free presale access, based on their authentic seda.fm presence.
- **For Seda**: Differentiate as the **fan-first platform** that protects communities and fixes broken ticketing models.
---

## **5. Feature Set**

### **Artist Workflow**

1. **Create Presale Campaign** in seda.fm dashboard.
1. **Define Criteria** for fan eligibility (follow artist, location, engagement).
1. **Issue Presale Unlock** — unique Fan IDs are generated.
1. **Distribute Codes** via seda notifications, email, or SMS.
1. **Track Redemptions** in real time (# unlocked, % redeemed, tickets sold).
### **Fan Workflow**

1. **Register Interest** → click “Unlock Presale.”
1. **Verify Identity** → email/SMS/captcha check.
1. **Eligibility Check** → must meet artist’s criteria.
1. **Unlock Fan ID** → one-time-use, tied to profile.
1. **Purchase Ticket** → Fan ID at checkout.
### **Admin / Backend**

- **Fraud Detection**
- **Fan ID Management**
- **Ticketing Integrations** (Ticketmaster, Dice, Eventbrite, AXS, Seated).
---

## **6. User Experience (UX)**

- **For Fans**: Simple unlock flow with clear CTA, notifications, and seamless ticket checkout.
- **For Artists**: Setup wizard with presets, campaign analytics dashboard.
---

## **7. Success Metrics**

- % of presale tickets purchased by verified fans.
- Avg. resale markup (target: 0%).
- Fan satisfaction (NPS).
- Artist adoption rate.
- Fan engagement conversion (profile activity → presale unlock).
---

## **8. Risks & Mitigations**

- Multiple accounts → mitigate with SMS/email + captcha.
- Ticketing pushback → mitigate with modular API connectors.
- Scalability → optimize Fan ID generation and caching.
---

## **9. Integration Requirements**

- **Ticketing APIs**: Eventbrite, Dice, Ticketmaster, AXS, Seated.
- **Verification APIs**: Twilio (SMS), SendGrid (email), captcha service.
- **Seda Data Sources**: fan engagement metrics (follows, listens, purchases).
---

## **10. Open Questions (MVP Decisions)**

1. Priority tiers for superfans? ❌ Not for MVP.
1. Transferable Fan IDs? ❌ Not for MVP.
1. Dynamic resale blocking? ✅ Yes.
1. Cross-platform fans not on seda? ✅ Free seda account signup.
1. Presale unlock for merch drops? ✅ Yes.
---

## **11. Future Enhancements (Post-MVP)**

- NFT / blockchain-backed Fan IDs.
- Fan loyalty ranking.
- Presale lotteries.
- Fan-to-fan resale with capped markups.
---

## **12. Final MVP Scope**

### **Included in MVP**

- Fan Unlock Presale Flow (register, verify, unlock Fan ID, ticket purchase).
- Dynamic resale blocking (watermarked Fan ID).
- Free account onboarding for cross-platform fans.
- Merch drop integration.
- Multi-factor verification (SMS/email/captcha).
- Basic fraud detection.
- Artist dashboard (campaign setup + tracking).
- **Monetization: Seda take rate (1–3%) on presale ticket sales.**
### **Excluded from MVP**

- Priority tiers.
- Transferable Fan IDs.
- Loyalty scoring.
- Lotteries.
- Blockchain-based Fan IDs.
---

## **13. Monetization Model (Final)**

**Selected Model: Take Rate on Ticket Sales**

- Seda charges **1–3%** on presale ticket revenue generated via Fan Unlock.
**Rationale**:

- No SaaS barrier for artists.
- Aligned incentives — seda only earns when artists earn.
- Scalable with artist success.
- Fan-first — no added costs for fans.
**Example**:

- Artist sells 10,000 presale tickets at $50 each = $500,000 gross.
- Seda take rate at 2% = $10,000 revenue for seda.
---
