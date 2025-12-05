---
title: Setup
notionId: 2580d66a-3cf2-804c-b03e-c75bdfeca9ba
lastSynced: 2025-09-12T16:31:50.462Z
url: https://www.notion.so/Setup-2580d66a3cf2804cb03ec75bdfeca9ba
---
---

# 0) What you’ll create (once per env)

- **Supabase project**: Postgres, Auth, Storage, **Edge Functions** hosting
- **PostHog project**: product analytics
- **Sentry project**: error monitoring (optional in QA/SBX)
> You’ll do the steps for QA first, then repeat quickly for SBX and PROD.

---

# 1) Supabase (DB/Auth/Edge Functions)

## A. Create projects

- Create **three** projects:
  - `seda-qa`
  -  `seda-sbx`
  - `seda-prod`
- For each project, note:
  - **Project ref** (e.g., `abcd1234`)
  - **Database password** (copy it)
  - **URL & keys**: `Anon public`, `Service role` (Studio → Project Settings → API)
## B. Install CLI (local once)

```bash
npm i -g supabase
supabase --version
supabase login   # follow browser flow

```

## C. Link your local repo to **QA** first

```bash
cd your-repo
supabase link --project-ref <QA_PROJECT_REF>

```

## D. Set **Edge Function secrets** (QA)

> (These live in Supabase and are used by every function in that project)

```bash
# In your repo, with QA project linked:
supabase secrets set \
  ADMIN_API_SECRET="change-me-qa" \
  POSTHOG_KEY="phc_xxx_qa" \
  POSTHOG_HOST="https://app.posthog.com" \
  SENTRY_DSN=""   # leave empty if you want

```

> Repeat later for SBX/PROD with their own values after you link to them.

## E. Initialize your DB schema (QA)

Pick one method:

- **Easiest**: open **SQL Editor** in Supabase Studio and run your schema/migrations SQL (users, queues, votes, tracks, `feature_flags`, etc.).
- **Or via psql** (advanced): connect with the connection string and run your Knex‑generated SQL.
Then run your **seeds** (same way). At minimum, ensure `feature_flags` table exists and insert the baseline flags (we added a seed file for that—run the SQL in Studio).

## F. Create and deploy **Edge Functions** (QA)

You’ll have a few small functions that replace the Node server routes:

- `flags` → handles `/v1/flags` (list/get/upsert/toggle)
- `metrics` → handles `/v1/admin/metrics`
- `dev` → handles `/v1/dev/*` test events (only enable in QA/SBX)
- `health` → simple healthcheck
**Scaffold & deploy (pattern):**

```bash
supabase functions new flags
supabase functions new metrics
supabase functions new dev
supabase functions new health

# Deploy all
supabase functions deploy flags
supabase functions deploy metrics
supabase functions deploy dev
supabase functions deploy health

```

**Call pattern (after deploy):**

```plain text
POST https://<QA_PROJECT_REF>.functions.supabase.co/flags
     (and /flags/:key, /flags/:key/toggle)
GET  https://<QA_PROJECT_REF>.functions.supabase.co/metrics
POST https://<QA_PROJECT_REF>.functions.supabase.co/dev/identify (QA only)
GET  https://<QA_PROJECT_REF>.functions.supabase.co/health

```

> Each function uses createClient(SUPABASE_URL, SERVICE_ROLE_KEY) inside the function with secrets supplied by supabase secrets (we already set POSTHOG_*, SENTRY_DSN, ADMIN_API_SECRET; add SUPABASE_URL/SERVICE_KEY if you need service access from within a function).

**Auth for admin endpoints**: check header `x-admin-secret` equals your env’s secret.

## G. Repeat for **Sandbox** and **Production**

For SBX:

```bash
supabase link --project-ref <SBX_PROJECT_REF>
supabase secrets set ADMIN_API_SECRET="change-me-sbx" POSTHOG_KEY="phc_xxx_sbx" POSTHOG_HOST="https://app.posthog.com" SENTRY_DSN=""
supabase functions deploy flags metrics dev health

```

For PROD (usually **omit** `dev`):

```bash
supabase link --project-ref <PROD_PROJECT_REF>
supabase secrets set ADMIN_API_SECRET="super-secret-prod" POSTHOG_KEY="phc_xxx_prod" POSTHOG_HOST="https://app.posthog.com" SENTRY_DSN="https://..."
supabase functions deploy flags metrics health

```

---

# 2) PostHog (analytics)

## A. Create projects

- Create **3 PostHog projects**: QA, SBX, PROD (or 1 project + use `environment` prop—we already tag events).
- Copy **Project API Key** for each.
## B. Paste keys

- For **Edge Functions**: you already set `POSTHOG_KEY`/`POSTHOG_HOST` with `supabase secrets set`.
- For any **client app** (if you later add PWA), use the same QA/SBX/PROD keys in your `.env.*` (or inject at build).
## C. Verify

- Hit your QA `dev` endpoints:
```bash
curl -X POST -H "x-user-id: u1" https://<QA_REF>.functions.supabase.co/dev/identify

```

- Open **Live Events** in PostHog → you should see `auth_signed_in` with `environment=development`.
---

# 3) Sentry (errors)

- Create **3 projects** (QA/SBX/PROD) or reuse with environment tags.
- Copy **DSNs** and set via `supabase secrets set SENTRY_DSN=...` per project.
- Throw a harmless test error from QA to confirm ingestion (or call Sentry’s test endpoint in code).
---

# 4) Optional: Uptime monitoring

- **UptimeRobot** (free): monitor
  - `GET https://<ENV_REF>.functions.supabase.co/health`
  - alert via email/Slack.
---

# 5) Environment mapping (quick reference)

| Env | Supabase project | Secrets (examples) |
| --- | --- | --- |
| **QA** | `seda-qa` | `ADMIN_API_SECRET=change-me-qa` · `POSTHOG_KEY=phc_qa` · `SENTRY_DSN=` |
| **SBX** | `seda-sbx` | `ADMIN_API_SECRET=change-me-sbx` · `POSTHOG_KEY=phc_sbx` · `SENTRY_DSN=` |
| **PROD** | `seda-prod` | `ADMIN_API_SECRET=super-secret-prod` · `POSTHOG_KEY=phc_prod` · `SENTRY_DSN=https://...` |

> DB creds are managed by Supabase; functions access DB via service role using createClient(SUPABASE_URL, SERVICE_ROLE_KEY) stored in secrets (set them once if your functions read/write your tables).

---

## Sanity checklist (QA)

1. Supabase project exists, DB schema + seeds run ✅
1. `supabase secrets` set for QA (admin secret, PostHog, Sentry) ✅
1. Functions deployed: `flags`, `metrics`, `dev`, `health` ✅
1. `curl` to `dev/identify` → event appears in PostHog (environment=development) ✅
1. `curl` with `x-admin-secret` to `flags`/`metrics` works ✅
---

Awesome — here’s a tight, copy‑paste **Option A** playbook: **Prod + Sandbox on Free**, **QA local** via the Supabase CLI.

---

# 1) Prereqs (once)

```bash
npm i -g supabase
supabase login

```

---

# 2) Create your two Free Supabase projects

- **Project 1**: `seda-prod`
- **Project 2**: `seda-sbx` (sandbox / UAT)
In each project (Studio → Settings → API), note:

- **Project Ref** (e.g., `abcd1234`)
- **SUPABASE_URL** (`https://<REF>.supabase.co`)
- **Anon** & **Service role** keys
---

# 3) Configure **Sandbox** (Free project #2)

## 3.1 Link & set secrets

```bash
# Replace <SBX_REF> and keys
supabase link --project-ref <SBX_REF>
supabase secrets set \
  ENV_TAG="sandbox" \
  SUPABASE_URL="https://<SBX_REF>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<SBX_SERVICE_ROLE_KEY>" \
  ADMIN_API_SECRET="change-me-sbx" \
  POSTHOG_KEY="phc_xxx_sbx" \
  POSTHOG_HOST="https://app.posthog.com" \
  SENTRY_DSN=""

```

## 3.2 Deploy Edge Functions

```bash
# From your repo root (you already have: flags, metrics, dev, health)
supabase functions deploy flags
supabase functions deploy metrics
supabase functions deploy dev      # allowed in SBX
supabase functions deploy health

```

## 3.3 Initialize DB (schema + seeds)

Open **Studio → SQL Editor** and run your schema/migrations SQL.

Then run seeds (at minimum, ensure `feature_flags` exists and seed defaults).

**Quick flag seed (if you added the seed file, otherwise paste SQL):**

- Run your existing seed (or insert rows for `dj_mode`, `artist_sessions` disabled).
## 3.4 Sanity checks (SBX)

```bash
# Flags list (admin)
curl -H "x-admin-secret: change-me-sbx" \
  https://<SBX_REF>.functions.supabase.co/flags

# Metrics (admin)
curl -H "x-admin-secret: change-me-sbx" \
  https://<SBX_REF>.functions.supabase.co/metrics

# Dev PostHog events (needs user id)
curl -X POST -H "x-user-id: u1" \
  https://<SBX_REF>.functions.supabase.co/dev/identify

```

---

# 4) Configure **Production** (Free project #1)

## 4.1 Link & set secrets

```bash
# Replace <PROD_REF> and keys
supabase link --project-ref <PROD_REF>
supabase secrets set \
  ENV_TAG="production" \
  SUPABASE_URL="https://<PROD_REF>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<PROD_SERVICE_ROLE_KEY>" \
  ADMIN_API_SECRET="super-secret-prod" \
  POSTHOG_KEY="phc_xxx_prod" \
  POSTHOG_HOST="https://app.posthog.com" \
  SENTRY_DSN="https://your-prod-dsn.ingest.sentry.io/12345"

```

## 4.2 Deploy Edge Functions (Prod)

```bash
supabase functions deploy flags
supabase functions deploy metrics
supabase functions deploy health
# Do NOT deploy 'dev' in production

```

## 4.3 Initialize DB (schema + seeds)

- Apply schema & seeds via Studio → SQL Editor (same as SBX).
- Seed **feature flags** so the keys exist (start disabled).
- You can copy flag states SBX → PROD later with your promote script (optional; you can also set via API).
## 4.4 Sanity checks (Prod)

```bash
# Flags list (admin)
curl -H "x-admin-secret: super-secret-prod" \
  https://<PROD_REF>.functions.supabase.co/flags

# Metrics (admin)
curl -H "x-admin-secret: super-secret-prod" \
  https://<PROD_REF>.functions.supabase.co/metrics

# Health
curl https://<PROD_REF>.functions.supabase.co/health

```

---

# 5) **QA Local** (no extra Supabase project used)

## 5.1 Start local Supabase

```bash
# In your repo
supabase init || true
supabase start          # spins up local Postgres/auth/storage

```

CLI outputs a local `API URL` and keys; export them to your app as needed or just use Studio’s local URL.

## 5.2 Apply schema & seeds locally

- `supabase db reset` (optional) or open the local SQL editor and run your schema/migrations + seed scripts.
- If you prefer Node scripts, point your local `.env` to the local DB and run `npm run migrate && npm run seed` (if present).
## 5.3 Run your app against local QA DB

- Point your local app to the local Postgres / or just use the Edge functions pattern if you build local function mocks.
- Use the **dev** endpoints locally or directly call PostHog using your QA key.
---

# 6) PostHog & Sentry quick wiring

- **PostHog**: Use separate projects (or one project with `environment` tag). You already tag events with `environment`automatically.
- **Sentry**: We patched it to use `ENV_TAG` → your Prod errors will show under **production**.
---

# 7) Day‑to‑day workflow

1. Build & break things in **QA local** (free, disposable).
1. Promote code to **Sandbox** (Free project #2), flip flags there, test UAT.
1. When happy, deploy the same functions to **Prod** (Free project #1) and enable flags gradually.
---

# 8) Helpful curl snippets (ready to paste)

**Enable a flag (SBX)**

```bash
curl -X POST -H "x-admin-secret: change-me-sbx" -H "content-type: application/json" \
  -d '{"enabled": true}' \
  https://<SBX_REF>.functions.supabase.co/flags/dj_mode

```

**Canary rule (10% in Prod)**

```bash
curl -X POST -H "x-admin-secret: super-secret-prod" -H "content-type: application/json" \
  -d '{"enabled": false, "rules":[{"id":"prod10","when":{"env":["production"]},"rollout":0.10,"salt":"djv2"}]}' \
  https://<PROD_REF>.functions.supabase.co/flags/dj_mode

```

**Metrics (Prod)**

```bash
curl -H "x-admin-secret: super-secret-prod" \
  https://<PROD_REF>.functions.supabase.co/metrics

```

---

# 9) Minimal checklist (print me)

- [ ] Create **Prod** & **Sandbox** projects (Free)
- [ ] Record **REF / URL / keys** for each
- [ ] **Sandbox**: set secrets → deploy `flags`, `metrics`, `dev`, `health`
- [ ] **Sandbox**: apply schema → seed flags → curl test OK
- [ ] **Production**: set secrets → deploy `flags`, `metrics`, `health`
- [ ] **Production**: apply schema → seed flags → curl test OK
- [ ] **QA local**: `supabase start` → apply schema/seeds → run app
- [ ] PostHog projects/keys set; Sentry DSN set (Prod)
- [ ] Optional: Uptime check on `/health` for SBX/Prod
---

If you want, I can generate **SQL snippets** for the baseline schema (users, queues, votes, tracks, feature_flags) tuned for Supabase so you can paste them straight into Studio and be running in 5 minutes.
