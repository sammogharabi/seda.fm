---
title: Dashboards
notionId: 2580d66a-3cf2-80b4-8936-d42c44aa3f35
lastSynced: 2025-09-12T16:33:52.095Z
url: https://www.notion.so/Dashboards-2580d66a3cf280b48936d42c44aa3f35
---
Claude Code prompt (paste this as a single message)

**Goal:** finalize sedā.fm’s MVP on **Supabase Edge Functions** with **Prod + Sandbox (Free)** and **QA local**.

**What to do:**

1. **Create/verify files** (idempotent; create if missing, update if present):
  - `supabase/functions/_shared/utils.ts` (env helpers, Supabase admin client, JSON helpers, `getEnvTag()`using `ENV_TAG`→`NODE_ENV` fallback)
  - `supabase/functions/_shared/posthog.ts` (minimal HTTP capture with `environment` prop)
  - `supabase/functions/flags/index.ts` (list/get/upsert/toggle flags, admin‑secret protected)
  - `supabase/functions/metrics/index.ts` (DAU/WAU, active_channels, skip_rate_24h, top_tracks_24h; admin‑secret protected)
  - `supabase/functions/dev/index.ts` (PostHog test event endpoints; **disabled in production** via `ENV_TAG`)
  - `supabase/functions/health/index.ts` (simple JSON healthcheck)
  - Update `README.md` with an “Option A: Prod + Sandbox on Free; QA local (CLI)” section covering secrets, deploy, and curl tests.
1. **Do not touch** existing Node server files unless they collide. The Edge Functions are the API surface for MVP.
1. **Coding constraints:**
  - Deno Runtime (Supabase Edge), no extra libs besides `@supabase/supabase-js@2` via ESM.
  - All endpoints return JSON; `flags` & `metrics` require `x-admin-secret`.
  - PostHog events include `environment` from `ENV_TAG|NODE_ENV`.
  - `dev/*` returns 404 if `ENV_TAG=production`.
1. **Output:** apply all file changes using a single `apply_patch` block.
Then run this patch:

```plain text
*** Begin Patch
*** Add File: supabase/functions/_shared/utils.ts
+import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
+
+export function env(name: string, fallback?: string): string {
+  const v = Deno.env.get(name) ?? fallback;
+  if (!v) throw new Error(`Missing env: ${name}`);
+  return v;
+}
+
+export function supabaseAdmin() {
+  const url = env('SUPABASE_URL');
+  const key = env('SUPABASE_SERVICE_ROLE_KEY');
+  return createClient(url, key, {
+    auth: { persistSession: false },
+    global: { headers: { 'x-application-name': 'seda.fm-edge' } },
+  });
+}
+
+export function json(data: unknown, init: ResponseInit = {}) {
+  return new Response(JSON.stringify(data), {
+    ...init,
+    headers: {
+      'content-type': 'application/json; charset=utf-8',
+      ...(init.headers || {}),
+    },
+  });
+}
+
+export async function readJson<T>(req: Request): Promise<T> {
+  const ct = req.headers.get('content-type') || '';
+  if (!ct.includes('application/json')) return {} as T;
+  try { return (await req.json()) as T; } catch { return {} as T; }
+}
+
+export function requireAdmin(req: Request) {
+  const secret = env('ADMIN_API_SECRET', '');
+  const header = req.headers.get('x-admin-secret');
+  if (!secret || header !== secret) throw new Response('Unauthorized', { status: 401 });
+}
+
+export function getEnvTag(): 'development' | 'sandbox' | 'production' {
+  const raw = (Deno.env.get('ENV_TAG') || Deno.env.get('NODE_ENV') || 'development').toLowerCase();
+  switch (raw) {
+    case 'development': case 'dev': return 'development';
+    case 'sandbox': case 'sbx': case 'uat': return 'sandbox';
+    case 'production': case 'prod': return 'production';
+    default: return 'development';
+  }
+}
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: supabase/functions/_shared/posthog.ts
+import { env, getEnvTag } from './utils.ts';
+
+const POSTHOG_HOST = () => env('POSTHOG_HOST', 'https://app.posthog.com');
+const POSTHOG_KEY = () => env('POSTHOG_KEY', '');
+
+export async function capturePH(
+  event: string,
+  distinctId: string,
+  properties: Record<string, unknown> = {},
+) {
+  const key = POSTHOG_KEY();
+  if (!key) return;
+  const payload = {
+    api_key: key,
+    event,
+    distinct_id: distinctId,
+    properties: { ...properties, environment: getEnvTag() },
+  };
+  await fetch(`${POSTHOG_HOST()}/capture/`, {
+    method: 'POST',
+    headers: { 'content-type': 'application/json' },
+    body: JSON.stringify(payload),
+  }).catch(() => {});
+}
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: supabase/functions/flags/index.ts
+import { json, readJson, requireAdmin, supabaseAdmin } from '../_shared/utils.ts';
+
+type Rule = { id?: string; when?: Record<string, string[]>; rollout?: number; salt?: string };
+type Body = { enabled?: boolean; rules?: Rule[] };
+
+Deno.serve(async (req) => {
+  try {
+    const url = new URL(req.url);
+    const parts = url.pathname.split('/').filter(Boolean); // [flags, ...]
+    if (parts[0] !== 'flags') return new Response('Not found', { status: 404 });
+    const sb = supabaseAdmin();
+    requireAdmin(req);
+
+    // GET /flags
+    if (req.method === 'GET' && parts.length === 1) {
+      const { data, error } = await sb
+        .from('feature_flags')
+        .select('key, enabled, rules, updated_at')
+        .order('key', { ascending: true });
+      if (error) throw error;
+      return json(data || []);
+    }
+
+    const key = parts[1];
+    if (!key) return new Response('Bad request', { status: 400 });
+
+    // GET /flags/:key
+    if (req.method === 'GET' && parts.length === 2) {
+      const { data, error } = await sb
+        .from('feature_flags')
+        .select('key, enabled, rules, updated_at')
+        .eq('key', key)
+        .maybeSingle();
+      if (error) throw error;
+      return json(data ?? { key, enabled: false, rules: [], missing: true });
+    }
+
+    // POST /flags/:key
+    if (req.method === 'POST' && parts.length === 2) {
+      const body = await readJson<Body>(req);
+      const enabled = body.enabled ?? false;
+      const rules = Array.isArray(body.rules) ? body.rules : [];
+      const { data, error } = await sb
+        .from('feature_flags')
+        .upsert({ key, enabled, rules, updated_at: new Date().toISOString() })
+        .select('key, enabled, rules, updated_at')
+        .single();
+      if (error) throw error;
+      return json(data);
+    }
+
+    // POST /flags/:key/toggle
+    if (req.method === 'POST' && parts.length === 3 && parts[2] === 'toggle') {
+      const body = await readJson<Body>(req);
+      if (typeof body.enabled !== 'boolean') {
+        return json({ error: "Missing 'enabled' boolean" }, { status: 400 });
+      }
+      const { data, error } = await sb
+        .from('feature_flags')
+        .upsert({ key, enabled: body.enabled, rules: [], updated_at: new Date().toISOString() })
+        .select('key, enabled, rules, updated_at')
+        .single();
+      if (error) throw error;
+      return json(data);
+    }
+
+    return new Response('Not found', { status: 404 });
+  } catch (e) {
+    if (e instanceof Response) return e;
+    return json({ error: String(e?.message ?? e) }, { status: 500 });
+  }
+});
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: supabase/functions/metrics/index.ts
+import { json, requireAdmin, supabaseAdmin } from '../_shared/utils.ts';
+
+Deno.serve(async (req) => {
+  try {
+    const url = new URL(req.url);
+    if (url.pathname !== '/metrics') return new Response('Not found', { status: 404 });
+    requireAdmin(req);
+    const sb = supabaseAdmin();
+    const now = new Date();
+    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
+    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
+
+    const { count: dau } = await sb.from('users').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo);
+    const { count: wau } = await sb.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo);
+
+    const { data: q1, error: e1 } = await sb.from('queues').select('channel_id').gte('queued_at', dayAgo);
+    if (e1) throw e1;
+    const active_channels = new Set((q1 || []).map((r: any) => r.channel_id)).size;
+
+    const { data: votes, error: ev } = await sb.from('votes').select('like').gte('created_at', dayAgo);
+    if (ev) throw ev;
+    const total = (votes || []).length || 0;
+    const dislikes = (votes || []).filter((v: any) => v.like === false).length;
+    const skip_rate_24h = total > 0 ? dislikes / total : 0;
+
+    const { data: q2, error: e2 } = await sb.from('queues').select('track_id').gte('queued_at', dayAgo);
+    if (e2) throw e2;
+    const counts: Record<string, number> = {};
+    for (const r of q2 || []) counts[r.track_id] = (counts[r.track_id] || 0) + 1;
+    const top_tracks_24h = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([track_id, plays_last_24h]) => ({ track_id, plays_last_24h }));
+
+    return json({ dau: dau || 0, wau: wau || 0, active_channels, skip_rate_24h, top_tracks_24h });
+  } catch (e) {
+    if (e instanceof Response) return e;
+    return json({ error: String(e?.message ?? e) }, { status: 500 });
+  }
+});
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: supabase/functions/dev/index.ts
+import { json, readJson } from '../_shared/utils.ts';
+import { capturePH } from '../_shared/posthog.ts';
+
+function requireUserId(req: Request): string {
+  const uid = req.headers.get('x-user-id');
+  if (!uid) throw new Response('Missing x-user-id header', { status: 400 });
+  return uid;
+}
+
+const ENV_OK = (Deno.env.get('ENV_TAG') || 'development') !== 'production';
+
+Deno.serve(async (req) => {
+  try {
+    if (!ENV_OK) return new Response('Not available in production', { status: 404 });
+    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
+    const url = new URL(req.url);
+    const parts = url.pathname.split('/').filter(Boolean); // ['dev', action]
+    if (parts[0] !== 'dev') return new Response('Not found', { status: 404 });
+    const userId = requireUserId(req);
+
+    switch (parts[1]) {
+      case 'identify': {
+        type Body = { method?: 'email' | 'spotify' | 'apple' };
+        const { method = 'email' } = await readJson<Body>(req);
+        await capturePH('auth_signed_in', userId, { method });
+        return json({ ok: true });
+      }
+      case 'join-channel': {
+        type Body = { channel_id: string; channel_type: 'genre' | 'artist'; genre?: string };
+        const body = await readJson<Body>(req);
+        await capturePH('channel_joined', userId, body);
+        return json({ ok: true });
+      }
+      case 'queue': {
+        type Body = { channel_id: string; track_id: string; source_provider: 'spotify' | 'apple' | 'youtube' | 'beatport' };
+        const body = await readJson<Body>(req);
+        await capturePH('track_queued', userId, body);
+        return json({ ok: true });
+      }
+      case 'start': {
+        type Body = { channel_id: string; track_id: string };
+        const body = await readJson<Body>(req);
+        await capturePH('track_started', userId, body);
+        return json({ ok: true });
+      }
+      case 'vote': {
+        type Body = { channel_id: string; track_id: string; like: boolean };
+        const body = await readJson<Body>(req);
+        await capturePH('track_voted', userId, body);
+        return json({ ok: true });
+      }
+      case 'skip': {
+        type Body = { channel_id: string; track_id: string; reason: 'votes' | 'dj_skip' | 'timeout' };
+        const body = await readJson<Body>(req);
+        await capturePH('track_skipped', userId, body);
+        return json({ ok: true });
+      }
+      default:
+        return new Response('Not found', { status: 404 });
+    }
+  } catch (e) {
+    if (e instanceof Response) return e;
+    return json({ error: String(e?.message ?? e) }, { status: 500 });
+  }
+});
*** End Patch

```

```plain text
*** Begin Patch
*** Add File: supabase/functions/health/index.ts
+import { json } from '../_shared/utils.ts';
+Deno.serve(() => json({ ok: true, ts: new Date().toISOString() }));
*** End Patch

```

```plain text
*** Begin Patch
*** Update File: README.md
@@
+## Supabase Edge Functions (Option A: Prod + Sandbox on Free; QA local)
+
+### Set secrets per project
+After `supabase link --project-ref <REF>`:
+```bash
+supabase secrets set \
+  ENV_TAG="sandbox|production" \
+  SUPABASE_URL="https://<REF>.supabase.co" \
+  SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>" \
+  ADMIN_API_SECRET="<env-admin-secret>" \
+  POSTHOG_KEY="phc_xxx_env" \
+  POSTHOG_HOST="https://app.posthog.com" \
+  SENTRY_DSN=""
+```
+
+### Deploy functions
+```bash
+supabase functions deploy flags
+supabase functions deploy metrics
+supabase functions deploy dev      # deploy only in Sandbox (not in Prod)
+supabase functions deploy health
+```
+
+### Quick calls
+```bash
+# Flags (admin)
+curl -H "x-admin-secret: <env-admin-secret>" https://<REF>.functions.supabase.co/flags
+# Toggle
+curl -X POST -H "x-admin-secret: <env-admin-secret>" -H "content-type: application/json" \
+  -d '{"enabled": true}' https://<REF>.functions.supabase.co/flags/dj_mode
+# Metrics (admin)
+curl -H "x-admin-secret: <env-admin-secret>" https://<REF>.functions.supabase.co/metrics
+# Dev events (Sandbox only)
+curl -X POST -H "x-user-id: u1" https://<REF>.functions.supabase.co/dev/identify
+```
*** End Patch

```

---

## Do you need a new set of env templates?

- **No.** For Edge Functions, you store secrets **in Supabase** with `supabase secrets set`.
- Keep your existing `.env.qa/.env.sbx/.env.prod` only for **local QA** and any **Node scripts** you still run locally (e.g., seeds or utilities). You don’t need new templates just for Edge.
## Do you need new apply patches?

- If you **haven’t** added the Edge Functions yet, **apply the patch above** (it’s self‑contained).
- If you **already applied** my previous Edge Functions patch, you don’t need another; you’re set. (This one is the same structure.)
Want me to also generate a **baseline SQL schema** (users, queues, votes, tracks, feature_flags) to paste into Supabase Studio so your tables are ready instantly?

---
