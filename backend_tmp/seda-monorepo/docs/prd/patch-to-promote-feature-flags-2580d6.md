---
title: Patch to promote feature flags
notionId: 2580d66a-3cf2-805c-ad6b-fb45e4eea581
lastSynced: 2025-09-12T16:34:09.704Z
url: https://www.notion.so/Patch-to-promote-feature-flags-2580d66a3cf2805cad6bfb45e4eea581
---
Awesome — here’s a **Claude Code ****`apply_patch`** that adds a one‑command **“Promote Flag(s)”** script. It copies feature flag values (enabled + rules) from one environment’s DB to another (e.g., **QA → Sandbox**, **Sandbox → Prod**), so you don’t have to recreate them by hand.

It works entirely via **database connections** by reading `.env.qa`, `.env.sbx`, `.env.prod` (no HTTP calls needed).

```plain text
*** Begin Patch
*** Add File: scripts/promoteFlag.ts
+/**
+ * Promote one or all feature flags from one environment DB to another.
+ *
+ * Usage examples:
+ *   # Copy a single flag dj_mode from QA -> SBX
+ *   npm run promote:flag -- --from=qa --to=sbx --key=dj_mode
+ *
+ *   # Copy ALL flags QA -> SBX
+ *   npm run promote:flag -- --from=qa --to=sbx --all
+ *
+ *   # Override enabled state while copying rules
+ *   npm run promote:flag -- --from=sbx --to=prod --key=dj_mode --enabled=true
+ *
+ * Notes:
+ * - Reads DB creds from .env.qa / .env.sbx / .env.prod in repo root.
+ * - Upserts into target: same `rules` JSON, `enabled` (overridable), updates `updated_at`.
+ */
+import fs from 'fs';
+import path from 'path';
+import dotenv from 'dotenv';
+import knexFactory, { Knex } from 'knex';
+
+type EnvName = 'qa' | 'sbx' | 'prod';
+
+function parseArgs(argv: string[]) {
+  const out: Record<string, string | boolean> = {};
+  for (const a of argv.slice(2)) {
+    const m = a.match(/^--([^=]+)=(.*)$/);
+    if (m) out[m[1]] = m[2];
+    else if (a.startsWith('--')) out[a.slice(2)] = true;
+  }
+  return out as {
+    from?: EnvName; to?: EnvName; key?: string; all?: boolean|string;
+    enabled?: string; dry?: boolean|string;
+  };
+}
+
+function loadEnvFile(envName: EnvName): Record<string,string> {
+  const file = path.resolve(process.cwd(), `.env.${envName}`);
+  if (!fs.existsSync(file)) {
+    throw new Error(`Missing env file: ${file}`);
+  }
+  const parsed = dotenv.parse(fs.readFileSync(file));
+  const required = ['PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD'];
+  for (const k of required) {
+    if (!parsed[k]) throw new Error(`Missing ${k} in ${file}`);
+  }
+  return parsed;
+}
+
+function knexFrom(parsed: Record<string,string>): Knex {
+  return knexFactory({
+    client: 'pg',
+    connection: {
+      host: parsed.PGHOST,
+      port: Number(parsed.PGPORT || 5432),
+      database: parsed.PGDATABASE,
+      user: parsed.PGUSER,
+      password: parsed.PGPASSWORD,
+      ssl: /supabase\.co$/.test(parsed.PGHOST) ? { rejectUnauthorized: false } : undefined
+    }
+  });
+}
+
+async function promoteSingle(src: Knex, dst: Knex, key: string, enabledOverride: undefined | boolean, dry=false) {
+  const row = await src('feature_flags').where({ key }).first();
+  if (!row) throw new Error(`Flag '${key}' not found in source`);
+  const enabled = typeof enabledOverride === 'boolean' ? enabledOverride : !!row.enabled;
+  const rules = row.rules ?? [];
+  if (dry) {
+    console.log(`[dry-run] would upsert key='${key}', enabled=${enabled}, rules=${JSON.stringify(rules)}`);
+    return;
+  }
+  const res = await dst('feature_flags')
+    .insert({ key, enabled, rules: JSON.stringify(rules), updated_at: dst.fn.now() })
+    .onConflict('key')
+    .merge({ enabled, rules: JSON.stringify(rules), updated_at: dst.fn.now() })
+    .returning(['key','enabled','rules','updated_at']);
+  const r = res[0];
+  console.log(`✔ promoted '${key}' -> enabled=${r.enabled}, rules_count=${Array.isArray(r.rules)?r.rules.length:0}`);
+}
+
+async function promoteAll(src: Knex, dst: Knex, enabledOverride: undefined | boolean, dry=false) {
+  const rows = await src('feature_flags').select('*').orderBy('key');
+  if (!rows.length) {
+    console.log('No flags found in source.');
+    return;
+  }
+  for (const row of rows) {
+    await promoteSingle(src, dst, row.key, enabledOverride, dry);
+  }
+}
+
+async function main() {
+  const args = parseArgs(process.argv);
+  const from = args.from as EnvName | undefined;
+  const to = args.to as EnvName | undefined;
+  const key = args.key as string | undefined;
+  const all = args.all === true || args.all === 'true';
+  const dry = args.dry === true || args.dry === 'true';
+  const enabledOverride = typeof args.enabled === 'string'
+    ? args.enabled === 'true'
+    : undefined;
+
+  if (!from || !to || from === to) {
+    throw new Error(`Usage: --from=qa|sbx|prod --to=qa|sbx|prod [--key=flag_key | --all] [--enabled=true|false] [--dry]`);
+  }
+  if (!all && !key) {
+    throw new Error(`Specify --key=<flag_key> or --all`);
+  }
+
+  const srcEnv = loadEnvFile(from);
+  const dstEnv = loadEnvFile(to);
+  const src = knexFrom(srcEnv);
+  const dst = knexFrom(dstEnv);
+
+  console.log(`Promoting feature_flags from ${from.toUpperCase()} -> ${to.toUpperCase()} ${dry ? '(dry-run)' : ''}`);
+  try {
+    if (all) {
+      await promoteAll(src, dst, enabledOverride, dry);
+    } else {
+      await promoteSingle(src, dst, key!, enabledOverride, dry);
+    }
+  } finally {
+    await src.destroy();
+    await dst.destroy();
+  }
+}
+
+main().catch((e) => {
+  console.error('❌ Promote failed:', e.message);
+  process.exit(1);
+});
+
*** End Patch

```

```plain text
*** Begin Patch
*** Update File: package.json
@@
   "dependencies": {
@@
     "@sentry/node": "^8.26.0"
   },
+  "devDependencies": {
+    "ts-node": "^10.9.2"
+  },
   "scripts": {
-    "seed:users": "ts-node scripts/seedUsers.ts"
+    "seed:users": "ts-node scripts/seedUsers.ts",
+    "promote:flag": "ts-node scripts/promoteFlag.ts"
   },
*** End Patch

```

```plain text
*** Begin Patch
*** Update File: README.md
@@
 ## PostHog (simplest usage)
@@
 > Note: the `/v1/dev/*` routes are **disabled in production** automatically (available only when `NODE_ENV !== 'production'`).
+
+## Promoting feature flags (QA → Sandbox → Prod)
+This script copies `feature_flags` rows between environment databases by reading `.env.qa`, `.env.sbx`, `.env.prod`.
+
+Examples:
+```bash
+# Single flag: QA -> SBX
+npm run promote:flag -- --from=qa --to=sbx --key=dj_mode
+
+# All flags: QA -> SBX
+npm run promote:flag -- --from=qa --to=sbx --all
+
+# Override enabled while copying rules: SBX -> PROD
+npm run promote:flag -- --from=sbx --to=prod --key=dj_mode --enabled=true
+
+# Dry run (no writes)
+npm run promote:flag -- --from=qa --to=sbx --all --dry
+```
*** End Patch

```

---

## How to use (quick)

1. Make sure **.env files exist**:
  - `.env.qa` with QA DB creds
  - `.env.sbx` with Sandbox DB creds
  - `.env.prod` with Prod DB creds
1. Install the new dev dep:
```bash
npm i

```

1. Promote a single flag from **QA → SBX**:
```bash
npm run promote:flag -- --from=qa --to=sbx --key=dj_mode

```

1. Promote **all** flags from **SBX → PROD**:
```bash
npm run promote:flag -- --from=sbx --to=prod --all

```

1. If you want to flip the state during promotion:
```bash
npm run promote:flag -- --from=sbx --to=prod --key=dj_mode --enabled=true

```

This keeps your **flag keys** identical across environments while letting each env’s **state** be independent — and it fits your QA → Sandbox → Production release flow perfectly.
