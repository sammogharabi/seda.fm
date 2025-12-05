---
title: PRD – Recommendation Engine (Rooms, Playlists, Artists)
notionId: 2650d66a-3cf2-8043-accd-f8b13dd2141d
lastSynced: 2025-09-12T16:32:55.235Z
url: https://www.notion.so/PRD-Recommendation-Engine-Rooms-Playlists-Artists-2650d66a3cf28043accdf8b13dd2141d
---
# **PRD – Recommendation Engine (Rooms, Playlists, Artists)**

---

## **1. Overview**

The seda.fm recommendation engine surfaces the most relevant **rooms, playlists, and artists** for each user by analyzing their listening history, preferences, and social connections across seda.fm and third-party platforms (Spotify, Apple Music, etc.).

The engine runs continuously in the background, updating suggestions in real time as user activity evolves. Recommendations are delivered proactively via in-app notifications and contextual prompts.

---

## **2. Objectives**

- Increase user engagement by helping members quickly discover communities (rooms) and playlists aligned with their tastes.
- Drive retention by personalizing seda.fm to each user’s unique activity, both on and off the platform.
- Strengthen network effects by leveraging friends’ activity as a discovery signal.
---

## **3. Target Customers**

- **Fans**: Music superfans seeking new communities, playlists, and artists tailored to their tastes.
- **Artists/DJs**: Independent creators who want their music surfaced to the right audience.
- **New Users**: Members onboarding into seda.fm who need a jump-start to find relevant rooms quickly.
---

## **4. Underserved Needs**

- Difficulty in discovering the most relevant rooms/artists without manual searching.
- Fragmentation of music activity across multiple platforms (Spotify, Apple Music, YouTube, etc.).
- Lack of awareness of what friends are doing in real time within seda.fm.
---

## **5. Value Proposition**

seda.fm makes discovery **automatic, personalized, and social**. Instead of endlessly browsing, members are guided into the right communities and playlists through a recommendation system that understands:

- **Who they follow** across connected platforms.
- **What they listen to and create** (playlists, artists, genres).
- **How their friends engage** with rooms and artists inside seda.fm.
---

## **6. Scope**

### **In Scope (MVP)**

- Profile linking (Spotify, Apple Music, YouTube Music, Deezer, etc.).
- Data ingestion: artists followed, playlists created, songs played, genres preferred, radio stations followed.
- Seda.fm activity signals: rooms joined, artists followed, tracks played, playlists liked.
- Social signals: recommendations based on friends’ room memberships and recent activity.
- Always-on background process that updates recommendations.
- Delivery channels:
  - In-app notifications (“Check out #ambient, your friends are here”).
  - Home feed modules (“Recommended Rooms for You”).
- Opt-in toggle for auto-linking external profiles.
### **Out of Scope (Future Phases)**

- Paid/premium “boosted recommendations” for artists.
- Third-party ad-driven recommendations.
- Cross-platform playlist auto-sync.
---

## **7. Feature Set**

- **Profile Linking Module**
  - Prompt during onboarding: “Link your music profiles to get personalized recommendations.”
  - Manual option in Settings → Linked Accounts.
  - Default: opt-in required (no auto-link without consent).
- **Data Collection Layer**
  - Connectors to ingest data from Spotify, Apple Music, etc.
  - Normalize into seda.fm’s canonical models (Artist, Playlist, Genre, Room).
  - Store **summary signals** (e.g., top 50 artists, top genres, top playlists) rather than raw play-by-play logs.
- **Recommendation Engine**
  - Algorithm inputs:
    - External signals: artists followed, playlists created, genres.
    - Internal signals: room visits, playlist adds, skips, votes.
    - Social signals: friends’ room/artist activity.
  - Outputs: ranked list of rooms, playlists, and artists to recommend.
- **Notification System**
  - Push-style alerts within seda.fm (“🔥 5 of your friends are in #indie right now”).
  - Passive feed modules (“Because you like Kaytranada, join #house”).
  - **Daily cap**: one relevant notification per day max, none if no meaningful recommendation.
- **Feedback Loop**
  - Allow users to dismiss/hide recommendations → improves model accuracy.
---

## **8. User Experience (UX)**

- **Onboarding Flow**
  - Step: “Want seda.fm to personalize your experience?”
  - Choices:
    - ✅ Link my music profiles now.
    - ➡️ Skip (can link later).
- **Discovery Feed**
  - Section labeled **Recommended for You**.
  - Cards with:
    - Room name, cover art, top artists.
    - Friend avatars if friends are active.
    - CTA: “Join Room” / “Follow Artist.”
- **Notifications**
  - Examples:
    - “We think you’ll love #hiphop. Join now.”
    - “Your playlist activity matches #LoFi – check it out.”
    - “3 of your friends are in #electronic right now.”
---

## **9. Success Metrics**

- % of users who link external profiles during onboarding.
- Engagement uplift (rooms joined, playlists followed) from recommendations.
- CTR on recommendation notifications.
- Retention rate increase for users with recommendations enabled vs. disabled.
---

## **10. Resolved Decisions**

1. **Store raw listening data?** → No. Only store mapped entities (artists, playlists, genres) and summary signals (e.g., top artists/playlists). APIs don’t reliably expose raw histories and storing them raises privacy/scale concerns.
1. **Notification frequency?** → Daily cap. Only send if strong recommendations exist.
1. **Recalculation cadence?** → Hybrid: real-time for social triggers (friends in rooms) + daily batch for content-based recommendations.
1. **Boost for emerging artists?** → Not in MVP. Recommendations must remain organic.
---

## **11. Technical Architecture Draft**

### **Components**

- **Data Ingestion APIs**
  - Spotify Web API: recent plays, top artists/tracks, playlists, followed artists.
  - Apple MusicKit API: library, heavy rotation, recently played.
  - Other providers (YouTube Music, Deezer, etc.): playlists, likes, subscriptions.
- **Data Normalization Layer**
  - Map external entities → seda.fm canonical schema (Artist, Track, Playlist, Genre, Room).
  - Store in Postgres with **pgvector** for embeddings.
- **Recommendation Engine**
  - Content-based filtering: embeddings for artists/genres/playlists.
  - Collaborative filtering: room co-membership, playlist overlaps.
  - Social graph: friend activity, presence signals.
  - Hybrid scoring model (weighted).
- **Processing Cadence**
  - **Real-time**: Social activity (friends in rooms, artists going live).
  - **Daily Batch**: Refresh embeddings and re-rank recommendations based on new activity.
- **Notifications Service**
  - Event-driven microservice that pushes in-app notifications.
  - Applies daily cap rules and relevance thresholds.
### **Data Flow**

1. User links external profile → OAuth → ingest signals.
1. Data normalized and embedded → stored in Postgres/pgvector.
1. Engine runs hybrid real-time + daily jobs → generates ranked recommendation sets.
1. Notification service and feed modules surface recommendations to users.
---

## **12. High-Level Sequence Diagram**

```plain text
sequenceDiagram
    participant User
    participant ExternalPlatform as External Platform (Spotify/Apple)
    participant Ingestion as Data Ingestion Service
    participant DB as Postgres/pgvector
    participant Engine as Recommendation Engine
    participant Notifier as Notification Service
    participant UI as seda.fm UI

    User->>ExternalPlatform: OAuth Consent (Link Account)
    ExternalPlatform-->>Ingestion: Artist/Playlist/Genre Data
    Ingestion->>DB: Normalize + Store (canonical schema + embeddings)
    Engine->>DB: Fetch user + friend + content signals
    Engine->>DB: Store ranked recommendations
    Engine->>Notifier: Send new recommendations
    Notifier->>UI: Push notification / feed update
    UI-->>User: Display Recommended Rooms, Playlists, Artists
```

---

## **13. System Architecture Diagram**

```plain text
graph TD

    subgraph External Platforms
        SPOT[Spotify API]
        APPLE[Apple MusicKit API]
        YT[YouTube/Deezer APIs]
    end

    subgraph seda.fm Backend
        INGEST[Data Ingestion Service]
        NORM[Normalization Layer]
        DB[(Postgres + pgvector)]
        ENGINE[Recommendation Engine]
        NOTIFY[Notification Service]
    end

    subgraph seda.fm Frontend
        FEED[Discovery Feed]
        NOTIFS[In-app Notifications]
    end

    User -->|OAuth Consent| SPOT
    User --> APPLE
    User --> YT

    SPOT --> INGEST
    APPLE --> INGEST
    YT --> INGEST

    INGEST --> NORM --> DB
    ENGINE --> DB
    ENGINE --> NOTIFY
    NOTIFY --> NOTIFS
    ENGINE --> FEED
    FEED --> User
    NOTIFS --> User
```

---

## **14. Data Schema Draft**

### **Tables**

**users**

- id (PK)
- username
- email
- created_at
- updated_at
**linked_accounts**

- id (PK)
- user_id (FK → users.id)
- provider (spotify, apple, youtube, deezer)
- provider_user_id
- access_token
- refresh_token
- created_at
- updated_at
**artists**

- id (PK)
- name
- external_ids (JSON: spotify_id, apple_id, etc.)
- genres (array)
- embedding (vector)
**playlists**

- id (PK)
- user_id (FK → users.id, nullable for external)
- name
- description
- provider (spotify, apple, seda)
- external_id
- embedding (vector)
**rooms**

- id (PK)
- name
- genre
- created_by (FK → users.id)
- embedding (vector)
- created_at
**user_activity**

- id (PK)
- user_id (FK → users.id)
- type (join_room, follow_artist, play_track, create_playlist, vote_track, etc.)
- entity_id (FK to artists/playlists/rooms depending on type)
- created_at
**recommendations**

- id (PK)
- user_id (FK → users.id)
- type (room, playlist, artist)
- entity_id (FK → rooms/playlists/artists)
- score (float)
- created_at
**friends**

- id (PK)
- user_id (FK → users.id)
- friend_user_id (FK → users.id)
- created_at
### **Notes**

- All **embedding fields** use pgvector for similarity search.
- **recommendations** table stores daily batch outputs and real-time inserts.
- **user_activity** serves as the main behavioral log powering updates.
- **Naming convention**: Database schema uses snake_case (industry norm for Postgres). Application code and APIs use camelCase. ORMs/serialization layers (e.g., Prisma, Sequelize, TypeORM) handle mapping automatically (e.g., user_id → userId).
---

## **15. Rollout Plan**

### **Phase 1 – MVP (Foundations)**

- Enable Spotify + Apple Music linking (OAuth).
- Ingest artists, playlists, top tracks, genres (summary only).
- Implement basic content-based recommendations (artists → rooms, genres → playlists).
- Add daily batch refresh + daily capped notifications.
- Surface recommendations in feed + notifications.
**Success Metrics (Phase 1)**

- % of new users linking at least one external profile.
- CTR on initial recommendation notifications.
- 
# **of rooms joined via recommendations vs. search.**

---

### **Phase 2 – Social Layer**

- Add friend graph activity tracking (who’s in which rooms, recently followed artists).
- Enable real-time notifications when friends join rooms.
- Add collaborative filtering (room/playlist overlaps).
- Improve UX with dismiss/hide feedback loop.
**Success Metrics (Phase 2)**

- % of users engaging with recommendations based on friends’ activity.
- Uplift in DAUs and session length for users with social-driven recs.
- Reduction in dismissed recommendations (improved relevance).
---

### **Phase 3 – Expansion + Optimization**

- Expand connectors (YouTube Music, Deezer).
- Add embeddings-based semantic recommendations (similar artists/genres/rooms).
- Introduce A/B testing for recommendation strategies.
- Optimize scoring model (blend content, social, collaborative signals).
- Consider editorial modules (clearly labeled, not algorithmically boosted).
**Success Metrics (Phase 3)**

- Increase in linked external platforms per user (multi-platform adoption).
- Lift in retention (Day 30/90) for users exposed to embeddings-driven recs.
- Improved diversity of rooms/artists discovered (breadth of engagement).
- Positive A/B test deltas on CTR and engagement with optimized scoring model.
---

## **16. Risks & Mitigations**

**1. Spammy Notifications**

- *Risk*: Users may perceive notifications as intrusive or irrelevant, leading to churn.
- *Mitigation*: Daily cap, relevance thresholds, and feedback loop (dismiss/hide to retrain engine).
**2. API Rate Limits / Data Access Restrictions**

- *Risk*: External platforms (Spotify, Apple, YouTube) may restrict frequency or scope of data access.
- *Mitigation*: Cache summary data (e.g., top 50 artists), refresh less frequently, fallback to seda.fm native activity.
**3. Cold Start Problem (New Users)**

- *Risk*: Users without linked profiles or initial activity may see poor/no recommendations.
- *Mitigation*: Use onboarding genre selection + trending rooms/artists as bootstrap signals.
**4. Privacy & Data Consent**

- *Risk*: Users may be uncomfortable linking external accounts or storing listening history.
- *Mitigation*: Opt-in consent flow, store only normalized entities (not raw logs), transparent privacy policy.
**5. Model Bias / Over-Narrow Recommendations**

- *Risk*: Recommendations overfit to a narrow set of genres/artists, limiting discovery.
- *Mitigation*: Add diversity penalty in ranking model, rotate in trending/new content.
**6. Infra Costs (pgvector, real-time processing)**

- *Risk*: Vector similarity search + hybrid jobs may increase compute/storage costs at scale.
- *Mitigation*: Start with daily batch jobs, move to real-time selectively (only for social triggers), monitor query performance.
---

## **17. Dependencies**

- **External APIs**: Spotify Web API, Apple MusicKit, YouTube Music, Deezer (OAuth + data access).
- **OAuth Infrastructure**: Secure token management and refresh handling.
- **Database**: Postgres with pgvector extension for embeddings.
- **Notification System**: Event-driven microservice to send in-app push alerts.
- **ORM / API Layer**: Prisma/TypeORM/Sequelize for mapping snake_case DB → camelCase code.
- **Batch Processing Infra**: Cron jobs or workers (e.g., Supabase Edge Functions, Railway, or AWS Lambda) for daily jobs.
- **Real-Time Infra**: WebSockets or Pub/Sub for real-time friend activity triggers.
- **A/B Testing Framework** (Phase 3): PostHog, LaunchDarkly, or similar to test rec strategies.
---

## **18. Open Questions for Engineering**

1. **Embedding Strategy**: Preferred model (Open-source vs hosted), vector size, and refresh cadence.
1. **Similarity Indexing**: HNSW vs IVF/Flat for pgvector; memory/latency targets.
1. **Cache Strategy**: What to cache (top rec sets per user, friend presence) and invalidation triggers.
1. **Real-Time Transport**: WebSockets vs Server-Sent Events vs third-party (e.g., Ably/Pusher) for presence.
1. **Batch Orchestration**: Cron in Supabase vs external workers; failure/retry semantics and observability.
1. **Personalization Weights**: Default weights for content vs social vs collaborative signals; experiment toggles.
1. **Notification Guardrails**: Minimum score threshold, cooldown rules, per-user quiet hours.
## Docs

[file](assets/file-8c870cee2b.pdf)

[file](assets/file-01c17c959c.pdf)

[file](assets/file-b3a2702bdc.pdf)

[file](assets/file-3185544f96.pdf)

[file](assets/file-18fe1453ae.pdf)
