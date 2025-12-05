---
title: Apply patch 2
notionId: 2580d66a-3cf2-8054-b1f9-ec568abc46dd
lastSynced: 2025-09-12T16:34:09.212Z
url: https://www.notion.so/Apply-patch-2-2580d66a3cf28054b1f9ec568abc46dd
---
Got it. To keep things simple, here’s a **small ****`apply_patch`** that **adds the ****`identifyUser`**** helper** to the analytics module you already installed with the big combined patch.

> If you’ve already applied the big patch, just apply this one and you’re done.

```plain text
*** Begin Patch
*** Update File: src/lib/analytics.ts
@@
 export function capture(event: string, distinctId: string, properties: Record<string, any> = {}) {
   if (!ph) return;
   const env = process.env.NODE_ENV || 'development';
   ph.capture({
     distinctId,
     event,
     properties: { ...properties, environment: env }
   });
 }

+/**
+ * Identify a user once after successful login/auth.
+ * Call this in your auth callback or session creation step.
+ *
+ * Example:
+ *   await identifyUser({ id: user.id, role: user.role, region: user.region, provider: user.provider });
+ */
+export async function identifyUser(user: {
+  id: string;
+  role: 'fan' | 'artist' | 'admin';
+  region?: string;
+  provider: 'email' | 'spotify' | 'apple';
+}) {
+  if (!ph) return;
+  const env = process.env.NODE_ENV || 'development';
+  ph.identify({
+    distinctId: user.id,
+    properties: {
+      role: user.role,
+      region: user.region,
+      auth_provider: user.provider,
+      environment: env
+    }
+  });
+  // Optional: also capture the login event for funnels
+  capture('auth_signed_in', user.id, { method: user.provider });
+}
*** End Patch

```

### How to use

In your login success handler:

```typescript
import { identifyUser, events } from '../lib/analytics.js';

async function onLogin(user: { id: string; role: 'fan'|'artist'|'admin'; region?: string; provider: 'email'|'spotify'|'apple' }) {
  await identifyUser(user); // one-time after login
  // later in the app:
  events.channelJoined(user.id, { channel_id: 'ch_rock', channel_type: 'genre', genre: 'rock' });
}

```

Want me to also add a one-liner **TypeScript type** for your `User` model so you don’t have to repeat that shape?
