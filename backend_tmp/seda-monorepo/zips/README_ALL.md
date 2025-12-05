# sedā.fm — All-in Starter Bundle (Wave A + Wave B + FIGMA_MAP)

This archive combines:
- **Wave A (Profiles & Playlists)** scaffolding
- **Wave B (Social, Leaderboards, Trophy Case)** scaffolding
- **FIGMA_MAP.md** mapping prototype → routes/APIs
- **README files** with quickstart and release steps

---

## Structure

- `supabase/migrations/` → SQL for Wave A & Wave B (Profiles, Playlists, Social, Leaderboards, Trophies)
- `apps/api/` → Express route stubs, zod schemas, db lib
- `apps/web/` → Flags + page/component stubs for Wave A & B
- `docs/` → API contracts, acceptance criteria, release checklists, contributing guides, FIGMA_MAP
- `.env.example` & `.env.example.waveb` → feature flags + DB URL templates

---

## Quickstart

1. Apply migrations in order:
   ```bash
   psql $DATABASE_URL -f supabase/migrations/20250902_wave_a_profiles_playlists.sql
   psql $DATABASE_URL -f supabase/migrations/20250902_wave_b_social_leaderboards_trophies.sql
   ```

2. Wire API routes:
   ```ts
   // apps/api/server.ts
   import profiles from "./src/routes/profiles";
   import playlists from "./src/routes/playlists";
   import social from "./src/routes/social";
   import leaderboards from "./src/routes/leaderboards";
   import trophies from "./src/routes/trophies";

   app.use("/profiles", profiles);
   app.use("/playlists", playlists);
   app.use("/social", social);
   app.use("/leaderboards", leaderboards);
   app.use("/trophies", trophies);
   ```

3. Set feature flags in `.env`:
   ```env
   NEXT_PUBLIC_FEATURE_PROFILES=false
   NEXT_PUBLIC_FEATURE_PLAYLISTS=false
   NEXT_PUBLIC_FEATURE_SOCIAL=false
   NEXT_PUBLIC_FEATURE_LEADERBOARDS=false
   NEXT_PUBLIC_FEATURE_TROPHY_CASE=false
   ```

4. Run web app. Pages available:
   - `/u/[username]` → Profile
   - `/pl/[playlistId]` → Playlist
   - `/leaderboards/global` → Global Leaderboard
   - `/u/[username]/trophies` → Trophy Case

---

## Next Steps

- **Phase 1:** Connect built features (auth, chat, verification, admin).  
- **Phase 2 Wave A:** Flesh out Profiles & Playlists.  
- **Phase 2 Wave B:** Implement Social, Leaderboards, Trophy Case.  
- **Phase 3:** Plan Player, Discovery/Search, advanced social.  

---

Happy building 🚀
