---
title: Seeding patch for FF
notionId: 2580d66a-3cf2-80b6-8132-efbf6b91416b
lastSynced: 2025-09-12T16:34:10.450Z
url: https://www.notion.so/Seeding-patch-for-FF-2580d66a3cf280b68132efbf6b91416b
---
Absolutely—yes, you want the **same feature flag keys in all three environments** (QA, Sandbox, Prod), but with **independent values** per env. That way you can turn things on in QA, validate in Sandbox, and only then enable in Prod—without mixing states.

Here’s a tiny seed that creates your default flags in each environment’s database so they exist from day one.

```plain text
*** Begin Patch
*** Add File: seeds/003_feature_flags.ts
+import type { Knex } from 'knex';
+
+/**
+ * Seed default feature flags so they exist in every environment DB.
+ * Flags are created disabled; you toggle them per-env via the admin API:
+ *   POST /v1/flags/dj_mode  { "enabled": true }
+ */
+export async function seed(knex: Knex): Promise<void> {
+  const now = knex.fn.now();
+  const defaults = [
+    { key: 'dj_mode', enabled: false, rules: JSON.stringify([]), updated_at: now },
+    { key: 'artist_sessions', enabled: false, rules: JSON.stringify([]), updated_at: now },
+  ];
+
+  // Upsert each flag by key
+  for (const f of defaults) {
+    await knex('feature_flags')
+      .insert(f)
+      .onConflict('key')
+      .merge({ /* keep disabled by default; do not auto-enable in seeds */
+        rules: f.rules,
+        updated_at: now
+      });
+  }
+}
+
*** End Patch
```

## How to use it

- Run this in **each environment** (because each env has its own DB):
```bash
# QA (locally)
cp .env.qa .env
npm run migrate
npm run seed

```

```bash
# Sandbox (in your UAT deploy/CI with .env.sbx)
npm run migrate
npm run seed

```

```bash
# Production (in your prod deploy with .env.prod)
npm run migrate
npm run seed

```

## Toggling flags per environment

- Turn on in QA:
```bash
curl -X POST -H "x-admin-secret: change-me-qa" \
  -H "content-type: application/json" \
  -d '{"enabled": true}' \
  http://<qa-host>/v1/flags/dj_mode

```

- Validate in **Sandbox**, then enable there with the **SBX** admin secret.
- Finally enable in **Prod** with the **Prod** admin secret.
## Why flags should exist in all 3 envs

- **Same keys everywhere** → consistent code paths.
- **Different states per env** → safe rollouts.
- **No cross‑contamination** → QA experiments don’t affect live users.
If you want, I can also add a **seed for example rules** (e.g., a 10% production canary for `dj_mode_v2`) that stays **disabled**until you flip it on.
