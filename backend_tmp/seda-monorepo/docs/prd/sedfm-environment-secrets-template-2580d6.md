---
title: sedā.fm Environment Secrets Template
notionId: 2580d66a-3cf2-80fa-8c6e-dd0d56af43b1
lastSynced: 2025-09-12T16:33:55.170Z
url: https://www.notion.so/sed-fm-Environment-Secrets-Template-2580d66a3cf280fa8c6edd0d56af43b1
---
Perfect 🙌 — here’s a **copy-paste friendly template** you can drop into Notion, 1Password, or wherever you keep project secrets. It’s a blank sheet you’ll fill in for **QA, Sandbox, and Production** as you create Supabase, PostHog, and Sentry projects.

---

# 🔑 sedā.fm Environment Secrets Template

## Sandbox (SBX)

- **Supabase**
  - Project Ref: `seda-sbx`
  - Project ID: `ubfgyrgyxqccybqpcgxq`
  - SUPABASE_URL: [https://ubfgyrgyxqccybqpcgxq.supabase.co](https://ubfgyrgyxqccybqpcgxq.supabase.co/)
  - SUPABASE_ANON_KEY:
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmd5cmd5eHFjY3licXBjZ3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzUxMTgsImV4cCI6MjA3MTU1MTExOH0.R-JNrnn-o7h2rY0W4BisErBPbmHlVviZvwImRbXvChQ`
  - SUPABASE_SERVICE_ROLE_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZmd5cmd5eHFjY3licXBjZ3hxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk3NTExOCwiZXhwIjoyMDcxNTUxMTE4fQ.yD0fYJxzQNZ4Iw4oogezHkhK-22RzcTRm16EkvEZ69k`
  - Database Password: Sunnybunny27@
- **Functions**
  - ENV_TAG: `sandbox`
  - ADMIN_API_SECRET: `change-me-sbx`
- **Analytics**
  - POSTHOG_KEY: `phc_xxx_sbx`
  - POSTHOG_HOST: `https://app.posthog.com`
- **Errors**
  - SENTRY_DSN: *(blank or SBX DSN)*
---

## Production

- **Supabase**
  - Project Ref: `seda-prod`
  - Project ID: `ifrbbfqabeeyxrrliank`
  - SUPABASE_URL: [https://ifrbbfqabeeyxrrliank.supabase.co](https://ifrbbfqabeeyxrrliank.supabase.co/)
  - SUPABASE_ANON_KEY:
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcmJiZnFhYmVleXhycmxpYW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODIxMzUsImV4cCI6MjA3MTU1ODEzNX0.FL8mUiWWe4Z9FGy-Vyo8pzc5oU1G4PWRpZppakAqTJ0`
  - SUPABASE_SERVICE_ROLE_KEY:
`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcmJiZnFhYmVleXhycmxpYW5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk4MjEzNSwiZXhwIjoyMDcxNTU4MTM1fQ.2bPov7K_xAezi3MAM8oY6XWEj6Kqr3s27npPZNUzuCk`
  - Database Password: `Sunnybunny27@`
- **Functions**
  - ENV_TAG: `production`
  - ADMIN_API_SECRET: `super-secret-prod`
- **Analytics**
  - POSTHOG_KEY: `phc_xxx_prod`
  - POSTHOG_HOST: `https://app.posthog.com`
- **Errors**
  - SENTRY_DSN: `https://__________.ingest.sentry.io/_____`
---

# ✅ Usage notes

- **Supabase**: copy values from **Studio → Project Settings → API / Database**.
- **PostHog**: copy the Project API key (Studio → Project → Project Settings).
- **Sentry**: copy DSNs from each project’s Settings.
- **Secrets injection**: for Supabase Edge Functions, run:
```bash
supabase secrets set ENV_TAG="..." SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." ADMIN_API_SECRET="..." POSTHOG_KEY="..." POSTHOG_HOST="..." SENTRY_DSN="..."

```

---

⚡️ This way, every time you spin up a new environment, you just fill this sheet and you’ll never mix up keys.

Do you also want me to add a **“bootstrap checklist”** (like: 1. create Supabase project, 2. create PostHog project, 3. create Sentry project, 4. fill sheet, 5. run secrets set, 6. deploy functions), so you can literally follow step-by-step when you stand up Sandbox and Prod?
