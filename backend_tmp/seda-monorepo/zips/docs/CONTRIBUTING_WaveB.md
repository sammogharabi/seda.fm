# CONTRIBUTING (Wave B Quickstart)

1. Apply SQL migration in `supabase/migrations/20250902_wave_b_social_leaderboards_trophies.sql`.
2. API: register routes
   ```ts
   import social from "./src/routes/social";
   import leaderboards from "./src/routes/leaderboards";
   import trophies from "./src/routes/trophies";
   app.use("/social", social);
   app.use("/leaderboards", leaderboards);
   app.use("/trophies", trophies);
   ```
3. Web: set flags in `.env` then wire pages to your router:
   - `/leaderboards/global`
   - `/u/[username]/trophies`
4. Add a scheduler to compute leaderboard snapshots and grant trophies.
