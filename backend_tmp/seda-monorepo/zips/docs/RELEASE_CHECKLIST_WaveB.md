# RELEASE_CHECKLIST (Wave B)

- [ ] Run SQL migration for follows, likes, trophies, leaderboards
- [ ] Add server routes: /social, /leaderboards, /trophies
- [ ] Lock down RLS policies for follows/likes/trophies
- [ ] Add scheduled job (cron/edge function) for leaderboard snapshot recompute
- [ ] E2E tests: follow/unfollow, like/unlike, read leaderboards, view trophies
- [ ] Keep all UI behind flags until verified
