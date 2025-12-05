---
title: Environment/Dashboards/FeatureFlags
notionId: 2580d66a-3cf2-8015-9056-de0fcbc2ae45
lastSynced: 2025-09-16T22:53:17.675Z
url: https://www.notion.so/Environment-Dashboards-FeatureFlags-2580d66a3cf280159056de0fcbc2ae45
---
Perfect 🙌 — here’s a **full set of ****`.env`**** templates** for **QA**, **Sandbox**, and **Production**. They all share the same structure so it’s easy to keep them aligned.

---

# `.env.qa` (for development & testing)

```plain text
# -------------------
# Core App
# -------------------
NODE_ENV=development
PORT=3000

# -------------------
# Supabase (Postgres DB - QA project)
# -------------------
PGHOST=db.supabase.co
PGPORT=5432
PGDATABASE=seda_qa
PGUSER=postgres
PGPASSWORD=your-qa-db-password

# -------------------
# Feature Flags / Admin
# -------------------
ADMIN_API_SECRET=change-me-qa

# -------------------
# Analytics (PostHog - QA)
# -------------------
POSTHOG_KEY=phc_xxx_your_project_key_here
POSTHOG_HOST=https://app.posthog.com

# -------------------
# Error Tracking (Sentry - optional in QA)
# -------------------
SENTRY_DSN=

```

---

# `.env.sbx` (for Sandbox / UAT)

```plain text
# -------------------
# Core App
# -------------------
NODE_ENV=sandbox
PORT=3000

# -------------------
# Supabase (Postgres DB - Sandbox project)
# -------------------
PGHOST=db.supabase.co
PGPORT=5432
PGDATABASE=seda_sbx
PGUSER=postgres
PGPASSWORD=your-sbx-db-password

# -------------------
# Feature Flags / Admin
# -------------------
ADMIN_API_SECRET=change-me-sbx

# -------------------
# Analytics (PostHog - Sandbox)
# -------------------
POSTHOG_KEY=phc_xxx_your_project_key_here
POSTHOG_HOST=https://app.posthog.com

# -------------------
# Error Tracking (Sentry - optional in Sandbox)
# -------------------
SENTRY_DSN=

```

---

# `.env.prod` (for Production)

```plain text
# -------------------
# Core App
# -------------------
NODE_ENV=production
PORT=3000

# -------------------
# Supabase (Postgres DB - Production project)
# -------------------
PGHOST=db.supabase.co
PGPORT=5432
PGDATABASE=seda_prod
PGUSER=postgres
PGPASSWORD=your-prod-db-password

# -------------------
# Feature Flags / Admin
# -------------------
ADMIN_API_SECRET=super-secret-prod-key

# -------------------
# Analytics (PostHog - Production project)
# -------------------
POSTHOG_KEY=phc_xxx_your_prod_project_key
POSTHOG_HOST=https://app.posthog.com

# -------------------
# Error Tracking (Sentry - Production DSN)
# -------------------
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/12345

```

---

## How to use

- Always copy the one you need into `.env` before running locally or deploying:
```bash
cp .env.qa .env     # for dev
cp .env.sbx .env    # for sandbox UAT
cp .env.prod .env   # for production

```

- In CI/CD (GitHub Actions), save the **contents** of `.env.sbx` and `.env.prod` into repo secrets:
  - `ENV_SBX`
  - `ENV_PROD`
The promote workflow will drop those into place when you run a promotion.

---

👉 Do you want me to also prepare a **pre-filled GitHub Actions secrets setup guide** (step-by-step: where to paste `ENV_SBX` and `ENV_PROD` in GitHub) so your CI/CD flow works without touching local `.env` for Sandbox/Prod?
