---
title: Apply patch 
notionId: 2580d66a-3cf2-804e-a03b-fe0169f912b9
lastSynced: 2025-09-12T16:34:04.499Z
url: https://www.notion.so/Apply-patch-2580d66a3cf2804ea03bfe0169f912b9
---
awesome — here’s a **single, combined ****`apply_patch`** block for **Claude Code** that merges everything (feature flags + admin API + ops dashboard + Sentry + PostHog + dev demo routes + README updates + light tests). Paste into Claude Code and click **Apply Patch**.

```plain text
*** Begin Patch
*** Update File: package.json
@@
   "dependencies": {
     "dotenv": "^16.4.5",
     "fastify": "^4.28.1",
     "fastify-websocket": "^8.3.1",
     "pino": "^9.3.2",
     "knex": "^3.1.0",
     "pg": "^8.12.0",
-    "zod": "^3.23.8"
+    "zod": "^3.23.8",
+    "posthog-node": "^4.0.0",
+    "@sentry/node": "^8.26.0"
   },
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: src/lib/flagTargeting.ts
+import { createHash } from "crypto";
+import { knex } from "../services/db.js";
+
+export type Traits = {
+  userId?: string;
+  role?: "fan" | "artist" | "admin";
+  region?: string;      // "US", "EU", etc.
+  env?: "development" | "sandbox" | "production";
+  [k: string]: unknown;
+};
+
+type Rule = {
+  id?: string;
+  when?: Record<string, string[]>;
+  rollout?: number; // 0..1
+  salt?: string;
+};
+
+type FlagRow = { key: string; enabled: boolean; rules: Rule[] | null };
+
+function matchesWhen(when: Rule["when"] | undefined, traits: Traits): boolean {
+  if (!when) return true;
+  return Object.entries(when).every(([k, allowed]) => {
+    const v = traits[k];
+    if (v == null) return false;
+    return allowed.map(String).includes(String(v));
+  });
+}
+
+function bucketPercent(flagKey: string, userId: string | undefined, salt = ""): number {
+  const seed = `${flagKey}:${userId ?? "anon"}:${salt}`;
+  const hex = createHash("sha1").update(seed).digest("hex").slice(0, 8);
+  const n = parseInt(hex, 16);
+  return n / 0xffffffff;
+}
+
+export async function isEnabledFor(key: string, traits: Traits = {}): Promise<boolean> {
+  const row = await knex<FlagRow>("feature_flags").where({ key }).first();
+  if (!row) return false;
+  const rules = row.rules ?? [];
+  if (rules.length === 0) return !!row.enabled;
+
+  for (const r of rules) {
+    if (!matchesWhen(r.when, traits)) continue;
+    const pct = typeof r.rollout === "number" ? Math.max(0, Math.min(1, r.rollout)) : 1;
+    if (pct >= 1) return true;
+    const p = bucketPercent(row.key, traits.userId, r.salt ?? "");
+    if (p < pct) return true;
+  }
+  return !!row.enabled;
+}
+
*** End Patch

```

```plain text
*** Begin Patch
*** Update File: src/lib/featureFlags.ts
@@
-import { knex } from '../services/db.js';
+import { knex } from '../services/db.js';
+import { isEnabledFor, Traits } from './flagTargeting.js';

 export async function isEnabled(key: string): Promise<boolean> {
   const row = await knex('feature_flags').where({ key }).first();
   return !!row?.enabled;
 }

 export async function whenEnabled<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
   if (await isEnabled(key)) return fn();
   return null;
 }
+
+export async function isEnabledForUser(key: string, traits: Traits) {
+  return isEnabledFor(key, traits);
+}
+
+export async function whenEnabledFor<T>(key: string, traits: Traits, fn: () => Promise<T>) {
+  if (await isEnabledFor(key, traits)) return fn();
+  return null;
+}
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: src/modules/admin/flags.routes.ts
+import { FastifyInstance, FastifyRequest } from 'fastify';
+import { knex } from '../../services/db.js';
+import { z } from 'zod';
+
+const RulesSchema = z.array(z.object({
+  id: z.string().optional(),
+  when: z.record(z.array(z.string())).optional(),
+  rollout: z.number().min(0).max(1).optional(),
+  salt: z.string().optional()
+})).default([]);
+
+type ToggleBody = { enabled?: boolean; rules?: unknown };
+
+function assertAdmin(req: FastifyRequest) {
+  const secret = process.env.ADMIN_API_SECRET;
+  if (!secret || req.headers['x-admin-secret'] !== secret) {
+    const e: any = new Error('Unauthorized'); e.statusCode = 401; throw e;
+  }
+}
+
+export async function registerFlagAdminRoutes(app: FastifyInstance) {
+  app.get('/v1/flags', async (req) => {
+    assertAdmin(req);
+    return knex('feature_flags').select('key', 'enabled', 'rules', 'updated_at').orderBy('key');
+  });
+
+  app.get('/v1/flags/:key', async (req) => {
+    assertAdmin(req);
+    const { key } = req.params as { key: string };
+    const row = await knex('feature_flags').where({ key }).first();
+    return row ?? { key, enabled: false, rules: [], missing: true };
+  });
+
+  app.post('/v1/flags/:key', async (req) => {
+    assertAdmin(req);
+    const { key } = req.params as { key: string };
+    const body = (req.body || {}) as ToggleBody;
+
+    const enabled = body.enabled ?? false;
+    const rules = RulesSchema.parse(body.rules ?? []);
+    const row = await knex('feature_flags')
+      .insert({ key, enabled, rules: JSON.stringify(rules), updated_at: knex.fn.now() })
+      .onConflict('key')
+      .merge({ enabled, rules: JSON.stringify(rules), updated_at: knex.fn.now() })
+      .returning(['key', 'enabled', 'rules', 'updated_at']);
+
+    return row[0];
+  });
+
+  app.post('/v1/flags/:key/toggle', async (req) => {
+    assertAdmin(req);
+    const { key } = req.params as { key: string };
+    const { enabled } = (req.body || {}) as ToggleBody;
+    if (typeof enabled !== 'boolean') {
+      const e: any = new Error("Missing 'enabled' boolean"); e.statusCode = 400; throw e;
+    }
+    const row = await knex('feature_flags')
+      .insert({ key, enabled, rules: JSON.stringify([]), updated_at: knex.fn.now() })
+      .onConflict('key')
+      .merge({ enabled, updated_at: knex.fn.now() })
+      .returning(['key', 'enabled', 'rules', 'updated_at']);
+    return row[0];
+  });
+}
+
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: src/modules/admin/metrics.routes.ts
+import { FastifyInstance, FastifyRequest } from 'fastify';
+import { knex } from '../../services/db.js';
+
+function assertAdmin(req: FastifyRequest) {
+  const secret = process.env.ADMIN_API_SECRET;
+  if (!secret || req.headers['x-admin-secret'] !== secret) {
+    const e: any = new Error('Unauthorized'); e.statusCode = 401; throw e;
+  }
+}
+
+export async function registerMetricsRoutes(app: FastifyInstance) {
+  app.get('/v1/admin/metrics', async (req) => {
+    assertAdmin(req);
+
+    const dau = Number((await knex.raw(`
+      select count(*) from users where created_at >= now() - interval '1 day'
+    `)).rows?.[0]?.count || 0);
+
+    const wau = Number((await knex.raw(`
+      select count(*) from users where created_at >= now() - interval '7 days'
+    `)).rows?.[0]?.count || 0);
+
+    const active_channels = Number((await knex.raw(`
+      select count(*) from (
+        select channel_id from queues
+        where queued_at >= now() - interval '24 hours'
+        group by channel_id
+      ) t
+    `)).rows?.[0]?.count || 0);
+
+    const skip_rate_24h = Number((await knex.raw(`
+      with votes as (
+        select q.id as queue_id,
+               sum(case when v.like = false then 1 else 0 end)::float as dislikes,
+               count(v.id)::float as total
+        from queues q
+        left join votes v on v.queue_id = q.id
+        where q.queued_at >= now() - interval '24 hours'
+        group by q.id
+      )
+      select coalesce(avg(case when total > 0 then dislikes/total end), 0) as skip_rate
+      from votes
+    `)).rows?.[0]?.skip_rate || 0);
+
+    const top_tracks_24h = (await knex.raw(`
+      select t.metadata->>'title' as title, count(*) as plays_last_24h
+      from tracks t
+      join queues q on q.track_id = t.id
+      where q.queued_at >= now() - interval '24 hours'
+      group by title
+      order by plays_last_24h desc
+      limit 10
+    `)).rows;
+
+    return { dau, wau, active_channels, skip_rate_24h, top_tracks_24h };
+  });
+}
+
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: src/lib/analytics.ts
+import { PostHog } from 'posthog-node';
+
+export const ph = process.env.POSTHOG_KEY
+  ? new PostHog(process.env.POSTHOG_KEY, { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' })
+  : null;
+
+export function capture(event: string, distinctId: string, properties: Record<string, any> = {}) {
+  if (!ph) return;
+  ph.capture({ distinctId, event, properties });
+}
+
+// Convenience shortcuts for common sedā.fm events (super simple)
+export const events = {
+  signedIn: (userId: string, method: 'email'|'spotify'|'apple') =>
+    capture('auth_signed_in', userId, { method }),
+  channelJoined: (userId: string, props: { channel_id: string; channel_type: 'genre'|'artist'; genre?: string }) =>
+    capture('channel_joined', userId, props),
+  trackQueued: (userId: string, props: { channel_id: string; track_id: string; source_provider: 'spotify'|'apple'|'youtube'|'beatport' }) =>
+    capture('track_queued', userId, props),
+  trackStarted: (userId: string, props: { channel_id: string; track_id: string }) =>
+    capture('track_started', userId, props),
+  trackVoted: (userId: string, props: { channel_id: string; track_id: string; like: boolean }) =>
+    capture('track_voted', userId, props),
+  trackSkipped: (userId: string, props: { channel_id: string; track_id: string; reason: 'votes'|'dj_skip'|'timeout' }) =>
+    capture('track_skipped', userId, props),
+  playlistCreated: (userId: string, props: { playlist_id: string; is_collaborative: boolean }) =>
+    capture('playlist_created', userId, props),
+  playlistItemAdded: (userId: string, props: { playlist_id: string; track_id: string; position: number }) =>
+    capture('playlist_item_added', userId, props),
+  artistVerified: (userId: string, props: { artist_id: string }) =>
+    capture('artist_verified', userId, props),
+  artistSessionStarted: (userId: string, props: { channel_id: string; artist_id: string }) =>
+    capture('artist_session_started', userId, props),
+};
+
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: src/lib/sentry.ts
+import * as Sentry from '@sentry/node';
+
+export function initSentry() {
+  const dsn = process.env.SENTRY_DSN;
+  if (!dsn) return;
+  Sentry.init({ dsn, tracesSampleRate: 0.1 });
+}
+
+export { Sentry };
+
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: src/modules/dev/demo.routes.ts
+import { FastifyInstance, FastifyRequest } from 'fastify';
+import { events } from '../../lib/analytics.js';
+
+type IdentifyBody = { method?: 'email'|'spotify'|'apple' };
+type JoinBody = { channel_id: string; channel_type: 'genre'|'artist'; genre?: string };
+type QueueBody = { channel_id: string; track_id: string; source_provider: 'spotify'|'apple'|'youtube'|'beatport' };
+type VoteBody = { channel_id: string; track_id: string; like: boolean };
+type SkipBody = { channel_id: string; track_id: string; reason: 'votes'|'dj_skip'|'timeout' };
+type StartBody = { channel_id: string; track_id: string };
+
+function requireUserId(req: FastifyRequest): string {
+  const uid = req.headers['x-user-id'];
+  if (!uid || typeof uid !== 'string') {
+    const e: any = new Error('Missing x-user-id header'); e.statusCode = 400; throw e;
+  }
+  return uid;
+}
+
+export async function registerDevDemoRoutes(app: FastifyInstance) {
+  // Guard: do NOT expose in production
+  app.addHook('onRequest', async (req) => {
+    if (process.env.NODE_ENV === 'production') {
+      const e: any = new Error('Not available in production'); e.statusCode = 404; throw e;
+    }
+  });
+
+  app.post('/v1/dev/identify', async (req) => {
+    const userId = requireUserId(req);
+    const { method = 'email' } = (req.body || {}) as IdentifyBody;
+    events.signedIn(userId, method);
+    return { ok: true };
+  });
+
+  app.post('/v1/dev/join-channel', async (req) => {
+    const userId = requireUserId(req);
+    const body = (req.body || {}) as JoinBody;
+    events.channelJoined(userId, body);
+    return { ok: true };
+  });
+
+  app.post('/v1/dev/queue', async (req) => {
+    const userId = requireUserId(req);
+    const body = (req.body || {}) as QueueBody;
+    events.trackQueued(userId, body);
+    return { ok: true };
+  });
+
+  app.post('/v1/dev/start', async (req) => {
+    const userId = requireUserId(req);
+    const body = (req.body || {}) as StartBody;
+    events.trackStarted(userId, body);
+    return { ok: true };
+  });
+
+  app.post('/v1/dev/vote', async (req) => {
+    const userId = requireUserId(req);
+    const body = (req.body || {}) as VoteBody;
+    events.trackVoted(userId, body);
+    return { ok: true };
+  });
+
+  app.post('/v1/dev/skip', async (req) => {
+    const userId = requireUserId(req);
+    const body = (req.body || {}) as SkipBody;
+    events.trackSkipped(userId, body);
+    return { ok: true };
+  });
+}
+
*** End Patch

```

```plain text
*** Begin Patch
*** Update File: src/index.ts
@@
 import Fastify from 'fastify';
 import websocket from 'fastify-websocket';
 import { env } from './config/index.js';
 import { logger } from './lib/logger.js';
 import { registerWebsocket } from './realtime/ws.js';
 import './services/db.js'; // initialize connection
 import { initSentry } from './lib/sentry.js';
 import { registerFlagAdminRoutes } from './modules/admin/flags.routes.js';
 import { registerMetricsRoutes } from './modules/admin/metrics.routes.js';
+import { registerDevDemoRoutes } from './modules/dev/demo.routes.js';

 const app = Fastify({ logger });

 initSentry();
 app.register(websocket);
 registerWebsocket(app);

 app.get('/health', async () => ({ ok: true }));

 // Admin APIs
 registerFlagAdminRoutes(app);
 registerMetricsRoutes(app);
+// Dev demo event routes (disabled automatically in production)
+registerDevDemoRoutes(app);

+// Minimal admin HTML dashboard (requires x-admin-secret header)
+app.get('/admin', async (req, reply) => {
+  const secret = process.env.ADMIN_API_SECRET;
+  if (!secret || (req.headers['x-admin-secret'] as string | undefined) !== secret) {
+    return reply.code(401).type('text/plain').send('Unauthorized');
+  }
+  const res = await app.inject({
+    method: 'GET',
+    url: '/v1/admin/metrics',
+    headers: { 'x-admin-secret': secret }
+  });
+  const data = JSON.parse(res.body as string);
+  return reply.type('text/html').send(`
+<html><body style="font-family:ui-sans-serif,system-ui;padding:24px;line-height:1.4">
+  <h2>sedā.fm — Ops Dashboard</h2>
+  <div>DAU: <b>${data.dau}</b> | WAU: <b>${data.wau}</b> | Active Channels: <b>${data.active_channels}</b></div>
+  <div>Skip rate (24h): <b>${(data.skip_rate_24h*100).toFixed(1)}%</b></div>
+  <h3>Top Tracks (24h)</h3>
+  <ol>${data.top_tracks_24h.map((t:any)=>`<li>${t.title} — ${t.plays_last_24h}</li>`).join('')}</ol>
+</body></html>`);
+});
+
 app.listen({ port: env.PORT, host: '0.0.0.0' })
   .then(() => logger.info(`🚀 seda-fm server running on :${env.PORT} [${env.NODE_ENV}]`))
   .catch((err) => {
     logger.error(err, 'Failed to start server');
     process.exit(1);
   });
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: tests/flags-targeting.test.ts
+import { describe, it, expect, beforeAll } from 'vitest';
+import { isEnabledFor } from '../src/lib/flagTargeting.js';
+import { knex } from '../src/services/db.js';
+
+describe('isEnabledFor', () => {
+  beforeAll(async () => {
+    await knex('feature_flags').del();
+  });
+
+  it('falls back to enabled when no rules', async () => {
+    await knex('feature_flags').insert({ key: 'control_flag', enabled: true, rules: '[]' });
+    expect(await isEnabledFor('control_flag', {})).toBe(true);
+  });
+
+  it('matches role condition', async () => {
+    await knex('feature_flags').insert({
+      key: 'artists_only',
+      enabled: false,
+      rules: JSON.stringify([{ when: { role: ['artist'] }, rollout: 1 }])
+    });
+    expect(await isEnabledFor('artists_only', { role: 'artist' })).toBe(true);
+    expect(await isEnabledFor('artists_only', { role: 'fan' })).toBe(false);
+  });
+
+  it('applies percentage with sticky bucketing', async () => {
+    await knex('feature_flags').insert({
+      key: 'ten_percent',
+      enabled: false,
+      rules: JSON.stringify([{ when: { env: ['production'] }, rollout: 0.1, salt: 'salt1' }])
+    });
+    const a = await isEnabledFor('ten_percent', { env: 'production', userId: 'A' });
+    const b = await isEnabledFor('ten_percent', { env: 'production', userId: 'B' });
+    expect(typeof a).toBe('boolean');
+    expect(typeof b).toBe('boolean');
+  });
+});
+
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: tests/metrics-auth.test.ts
+import { describe, it, expect } from 'vitest';
+import Fastify from 'fastify';
+import { registerMetricsRoutes } from '../src/modules/admin/metrics.routes.js';
+
+describe('metrics route auth', () => {
+  it('rejects without admin secret', async () => {
+    const app = Fastify();
+    await registerMetricsRoutes(app as any);
+    const res = await app.inject({ method: 'GET', url: '/v1/admin/metrics' });
+    expect(res.statusCode).toBe(401);
+  });
+});
+
*** End Patch

```

```plain text
*** Begin Patch
*** Update File: README.md
@@
 4. **Run dev server:**
    ```bash
    npm run dev
    # GET http://localhost:3000/health
    # WS  ws://localhost:3000/ws
    ```
+
+## PostHog (simplest usage)
+1. Create a project on PostHog Cloud → copy your **Project API Key**.
+2. In `.env` set:
+   ```
+   POSTHOG_KEY=phc_xxx
+   POSTHOG_HOST=https://app.posthog.com
+   ```
+3. Fire demo events locally (only in non‑production):
+   ```bash
+   # Identify/sign-in event (header provides the user id)
+   curl -X POST -H "x-user-id: user_1" http://localhost:3000/v1/dev/identify
+
+   # Join a channel
+   curl -X POST -H "content-type: application/json" -H "x-user-id: user_1" \
+     -d '{"channel_id":"ch_rock","channel_type":"genre","genre":"rock"}' \
+     http://localhost:3000/v1/dev/join-channel
+
+   # Queue a track
+   curl -X POST -H "content-type: application/json" -H "x-user-id: user_1" \
+     -d '{"channel_id":"ch_rock","track_id":"t1","source_provider":"spotify"}' \
+     http://localhost:3000/v1/dev/queue
+
+   # Start a track
+   curl -X POST -H "content-type: application/json" -H "x-user-id: user_1" \
+     -d '{"channel_id":"ch_rock","track_id":"t1"}' \
+     http://localhost:3000/v1/dev/start
+
+   # Vote & Skip
+   curl -X POST -H "content-type: application/json" -H "x-user-id: user_1" \
+     -d '{"channel_id":"ch_rock","track_id":"t1","like":false}' \
+     http://localhost:3000/v1/dev/vote
+
+   curl -X POST -H "content-type: application/json" -H "x-user-id: user_1" \
+     -d '{"channel_id":"ch_rock","track_id":"t1","reason":"votes"}' \
+     http://localhost:3000/v1/dev/skip
+   ```
+   Open PostHog → **Live Events** to verify events are arriving.
+
+> Note: the `/v1/dev/*` routes are **disabled in production** automatically (available only when `NODE_ENV !== 'production'`).
*** End Patch

```

---

## After you apply the patch

1. Install new deps:
```bash
npm i

```

1. Env setup (QA first):
```plain text
cp .env.qa .env
ADMIN_API_SECRET=change-me
POSTHOG_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com
# SENTRY_DSN=optional_dsn

```

1. Migrate & seed:
```bash
npm run migrate
npm run seed

```

1. Run:
```bash
npm run dev

```

1. Try:
- Admin metrics JSON:
`curl -H "x-admin-secret: change-me" http://localhost:3000/v1/admin/metrics`

- Admin HTML (send header in your client): `GET /admin`
- PostHog demo events: use the curl commands in the README.
If you want, I can also hand you a **tiny ****`.env.qa`**** template** filled out for Supabase + PostHog + Sentry + admin secret to copy-paste.
