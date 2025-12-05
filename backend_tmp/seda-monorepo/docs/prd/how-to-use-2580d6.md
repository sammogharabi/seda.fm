---
title: How to use 
notionId: 2580d66a-3cf2-8043-9468-c011ef5573a5
lastSynced: 2025-09-12T16:33:48.655Z
url: https://www.notion.so/How-to-use-2580d66a3cf280439468c011ef5573a5
---
### What are these `.env` templates?

They are **environment variable files** that tell your app *how to run* in different environments:

- **QA** → your dev/testing playground (local development).
- **Sandbox (SBX)** → a mirror of prod where you do UAT/regression before going live.
- **Production (Prod)** → the live site your users see.
Each one has **the same structure** (same keys), but different values:

- **Database connection**: each environment has its own Postgres DB (via Supabase).
- **Admin secret**: different keys, so you don’t accidentally use the prod admin secret in QA.
- **PostHog key**: you can use one PostHog project, or separate ones per env.
- **Sentry DSN**: maybe empty in QA, real in Prod.
---

### Why do we need them?

Because you don’t want:

- QA testing data mixing into production.
- Accidental feature flag flips in Prod when you’re just playing around in QA.
- A broken feature rollout to affect real users before it’s tested in Sandbox.
So we create **3 isolated environments** with different configs, but the **same code**.

The `.env.*` files make it easy to switch between them.

---

### How you use them day-to-day

1. **Local dev (QA):**
```plain text
cp .env.qa .env
npm run dev

```

→ Now your app is talking to the QA DB, QA PostHog, QA flags.

1. **Testing UAT in Sandbox:**
In CI/CD, you copy `.env.sbx` into place when deploying Sandbox.

```plain text
cp .env.sbx .env
npm run start

```

1. **Deploying Production:**
In CI/CD, copy `.env.prod` into place.

```plain text
cp .env.prod .env
npm run start

```

---

### Why I gave you templates

The templates are just **starter files** so you don’t forget what values each env needs.

You’ll replace placeholders like:

- `PGPASSWORD=your-qa-db-password`
- `POSTHOG_KEY=phc_xxx`
- `SENTRY_DSN=...`
with the **real credentials** from Supabase, PostHog, Sentry, etc.

---

✅ So in short:

- These `.env` templates keep your QA, Sandbox, and Prod **separate and safe**.
- They’re just config files that Claude/Cursor/Node reads at startup.
- You’ll only edit them once per environment, then reuse them forever.
---

![](https://prod-files-secure.s3.us-west-2.amazonaws.com/0d17f9ed-e6fc-4ac0-bc65-ed03102e93de/9cf6e679-608c-4ca6-996e-8f66bfd68b5b/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667F7SIBMF%2F20250912%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250912T163348Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQD6%2B%2Bf%2BjoDfU2mHRavVkHBfxzmgKIBR8jUZ0%2BQHLll9TAIhALoUn7IUG3CY6XF1BWAt1BBNtLs7Ixm%2F%2BuF7UqOSEwSwKv8DCDEQABoMNjM3NDIzMTgzODA1Igxn9Zbe2J5NqtWX56Uq3AP4ZLu8VnMuM%2FvGT2Id9m2ST9nZmmamTiwml3hkWi2BkUR5lEb2n7AtkIZATE6BmlH28g0zIfMvezokiTNGmVailpwihBOV9nLGnlSQ%2Bq4gxkhdm1OFltk6d5R63RGtFn7s%2FdV365ylfdxpxMWRjt2DRxkcN69r7wLkHJctmbcfuxx%2BCDKrVvy8P1ohdJMDL%2BVG%2FeuyUx084pltQFE67%2Bv0rP77hKvJlqoTgBEiO6d6IDzvv56xS3nhw66MCtMvc0SyX49E%2FIfRNX0Xi7bGETB6g5i%2BktpzAv%2F4kvVWVBn6avJjJXV9Xne1RgIr68bjdTr96PUebM0nP%2BuIwWWNCU9VRtZQWmaFeiPhtF4TZ2IKOn2Y1v5bq2H2Ly31VsJXS%2FLl8sUK6XIF6e5QVtWlkw4D94uiKv%2Fkw7EozxxvybrFdVvneoSEBhg5txUosV4A9%2Fct8oP0qwHvJWxYoUfxCRAIu7v45nOKtYQLmxhjDne2XjmwgFJmkRs7xb2%2Bafh%2FBjAfZLrj7MqVWdzKN77fS%2BuXW1X8o1fA8oN1aZ7eZI2LU621%2BAUr9tyWt924ZTfvSr3ODvCqQRv3Vzl%2FhCz4kjlNLX1S1oOu9mS2ztwgnpKA6e8qTngftawzxhIPgDDKiZHGBjqkATTiNWZYenEm6VPaTszI%2BbtOt%2BSckjd738HRI%2Fo4d4N0JX0QGAxADjq%2F%2BPBKOdOYGmeKi5dgBxkAWmULjXmNPxXaZYiQ6PVbpQXrjvWGwddiTG4oS4uveZVqPu1xwjqjlwdmI50RgMCUNFxzAWi2ydijkkMhQkSVuN9GEst3SGARvGnHG9QlS4sofhEGkxVzDhq7AGK%2BcyIN%2F3n8XrUiFOox1CIf&X-Amz-Signature=674bbb09c127aa6d0df8f273ba56a113a55625d68a589b19c0366f7e94acfa29&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)
