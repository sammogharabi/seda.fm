---
title: Patch - Edge functions use ENV_TAG
notionId: 2580d66a-3cf2-8023-a751-cfc99c7ffcc7
lastSynced: 2025-09-12T16:34:03.542Z
url: https://www.notion.so/Patch-Edge-functions-use-ENV_TAG-2580d66a3cf28023a751cfc99c7ffcc7
---
Awesome — here’s a tiny **Claude Code ****`apply_patch`** to make the Edge Functions’ `getEnvTag()` prefer `ENV_TAG`, then fall back to `NODE_ENV`, with some light normalization (e.g., `prod` → `production`, `sbx`/`uat` → `sandbox`).

```plain text
*** Begin Patch
*** Update File: supabase/functions/_shared/utils.ts
@@
 export function getEnvTag(): 'development' | 'sandbox' | 'production' {
-  // Supabase doesn't set NODE_ENV; customize if you want different labels per project
-  // You can also create a secret ENV_TAG="development|sandbox|production"
-  const tag = Deno.env.get('ENV_TAG') as any;
-  return (tag || 'development') as 'development' | 'sandbox' | 'production';
+  // Prefer ENV_TAG (set via `supabase secrets`), then fall back to NODE_ENV.
+  // Normalize common aliases so PostHog & Sentry are consistent.
+  const raw = (Deno.env.get('ENV_TAG') || Deno.env.get('NODE_ENV') || 'development').toLowerCase();
+  let normalized: 'development' | 'sandbox' | 'production' = 'development';
+  switch (raw) {
+    case 'development':
+    case 'dev':
+      normalized = 'development'; break;
+    case 'sandbox':
+    case 'sbx':
+    case 'uat':
+      normalized = 'sandbox'; break;
+    case 'production':
+    case 'prod':
+      normalized = 'production'; break;
+    default:
+      normalized = 'development';
+  }
+  return normalized;
 }
*** End Patch

```

### What this gives you

- Edge Functions now tag analytics/errors with a consistent env:
  - QA → `development`
  - Sandbox → `sandbox`
  - Production → `production`
- Works even if you forget to set `ENV_TAG` (it’ll use `NODE_ENV`, else default to `development`).
### Quick check

- Ensure you’ve set `ENV_TAG` per project (as we did earlier).
- Re‑deploy functions:
```bash
supabase functions deploy flags
supabase functions deploy metrics
supabase functions deploy dev     # skip in PROD
supabase functions deploy health

```

- Trigger a QA event and confirm `environment=development` in PostHog Live Events.