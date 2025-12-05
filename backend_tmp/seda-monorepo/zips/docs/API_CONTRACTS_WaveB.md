# API_CONTRACTS (Wave B: Social, Leaderboards, Trophy Case)

## Social
- `POST /social/follow` body: { target_user_id } → 201
- `DELETE /social/follow` body: { target_user_id } → 200
- `POST /social/like` body: { entity_type, entity_id } → 201
- `DELETE /social/like` body: { entity_type, entity_id } → 200

## Leaderboards
- `GET /leaderboards?scope=global|genre:slug|channel:id|artist:username&limit=50` → 200 { scope, entries: [{rank, user_id, score, extra}] }

## Trophies
- `GET /trophies/:username` → 200 { username, trophies: [{badge_code, earned_at}] }
- `POST /trophies` (admin/internal) body: { user_id, badge_code } → 201

### Notes
- Scoring inputs (DJ Points) are deferred; endpoints return precomputed snapshots.
- Add scheduled job to recompute snapshots and grant trophies.
