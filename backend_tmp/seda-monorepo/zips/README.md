# sedā.fm — Wave A Starter + Figma Map Bundle

This bundle contains the **Wave A scaffolding** (Profiles & Playlists) and the **FIGMA_MAP.md** that links your prototype frames to implementation routes/APIs.

---

## Contents

### supabase/migrations
- `20250902_wave_a_profiles_playlists.sql`  
  Database schema for `profiles`, `playlists`, `playlist_items`, and `playlist_collaborators`.

### apps/api
- **schemas/** → Zod schemas for Profiles & Playlists.  
- **routes/** → Express route stubs (`/profiles`, `/playlists`).  
- **lib/db.ts** → Placeholder pg client.

### apps/web
- **lib/flags.ts** → Feature flags (`FEATURE_PROFILES`, `FEATURE_PLAYLISTS`).  
- **features/profiles/pages/[username].tsx** → Profile page stub.  
- **features/playlists/pages/[playlistId].tsx** → Playlist page stub.

### docs
- **API_CONTRACTS.md** → Contract for Profiles & Playlists.  
- **AC_profiles.md**, **AC_playlists.md** → Acceptance criteria.  
- **RELEASE_CHECKLIST.md** → Steps before enabling features.  
- **CONTRIBUTING.md** → Quickstart instructions.  
- **FIGMA_MAP.md** → Mapping of prototype frames → routes → APIs.

### Root
- `.env.example` → Example config with feature flags and DB URL.

---

## Quickstart

1. Apply the migration:  
   ```bash
   psql $DATABASE_URL -f supabase/migrations/20250902_wave_a_profiles_playlists.sql
   ```

2. Wire API routes in `apps/api/server.ts`:  
   ```ts
   import profiles from "./src/routes/profiles";
   import playlists from "./src/routes/playlists";
   app.use("/profiles", profiles);
   app.use("/playlists", playlists);
   ```

3. Set feature flags in `.env`:  
   ```env
   NEXT_PUBLIC_FEATURE_PROFILES=false
   NEXT_PUBLIC_FEATURE_PLAYLISTS=false
   ```

4. Run the web app. Visit:  
   - `/u/[username]` for Profiles  
   - `/pl/[playlistId]` for Playlists

5. Enable flags when ready for internal testers.

---

## Next Steps

- Phase 1: Connect built features (auth, chat, verification, admin).  
- Phase 2 Wave A: Flesh out Profiles & Playlists using this scaffolding.  
- Phase 2 Wave B: Extend with Social, Leaderboards, Trophy Case.  
- Phase 3: Plan-only features (Player, Search, advanced social).

---

Happy building 🚀
