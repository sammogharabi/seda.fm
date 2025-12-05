# API_CONTRACTS (Wave A: Profiles & Playlists)

## Profiles
- `GET /profiles/:username` → 200 { username, display_name?, bio?, avatar_url? }
- `POST /profiles` (auth) body: { username, display_name?, bio?, avatar_url? } → 201 { id, ... }
- `PATCH /profiles/:username` (auth: owner) body: partial(Profile) → 200 { ... }

## Playlists
- `GET /playlists/:id` → 200 { id, title, description?, is_public, is_collaborative, items: [...] }
- `POST /playlists` (auth) body: { title, description?, is_public?, is_collaborative? } → 201 { id, ... }
- `PATCH /playlists/:id` (auth: owner/collab) → 200 { ... }
- `POST /playlists/:id/items` (auth: owner/collab) body: { provider, provider_track_id, position?, title?, artist?, artwork_url? } → 201 { id, ... }

### Notes
- All endpoints must enforce authZ (owner/collaborator for writes). 
- Pagination recommended for playlist items: `?limit=50&cursor=...`.
- Validate bodies with zod; respond with structured error map.
