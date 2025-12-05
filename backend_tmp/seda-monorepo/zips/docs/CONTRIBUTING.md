# CONTRIBUTING (Wave A Quickstart)

1. Apply SQL migration in `supabase/migrations/20250902_wave_a_profiles_playlists.sql`.
2. API: `apps/api` uses Express; add routes to your server entry:
   ```ts
   import profiles from "./src/routes/profiles";
   import playlists from "./src/routes/playlists";
   app.use("/profiles", profiles);
   app.use("/playlists", playlists);
   ```
3. Web: wire pages under `apps/web/src/features/...` to your router.
4. Set feature flags via env; ship behind flags first.
