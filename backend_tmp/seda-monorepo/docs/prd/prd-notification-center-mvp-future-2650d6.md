---
title: PRD – Notification Center (MVP + Future)
notionId: 2650d66a-3cf2-802c-8d5f-cc39e25056fc
lastSynced: 2025-09-12T16:33:37.633Z
url: https://www.notion.so/PRD-Notification-Center-MVP-Future-2650d66a3cf2802c8d5fcc39e25056fc
---
# **PRD – Notification Center (MVP + Future)**

---

## **1) Objectives**

- Provide a centralized **Notification Center** within the PWA to surface relevant updates (recommendations, playlist activity, friend activity, room updates).
- Integrate tightly with the **Recommendation Engine** so users are proactively nudged toward new tracks, artists, playlists, or rooms that match their interests.
- Establish a framework that can later support **push notifications** when seda.fm is released as a native app (iOS/Android).
---

## **2) Scope**

### **In-Scope (MVP – PWA)**

- **Notification Center UI** accessible from the top nav (bell icon).
- **Types of Notifications (MVP):**
  1. **Recommendations** – new track/artist/playlist/room suggestions (from Rec Engine). Appear as **separate notifications**, highlighted visually.
  1. **Playlist activity** – when a track you added gets upvoted/downvoted.
  1. **Room activity** – new track added in a room you follow.
  1. **Friend activity** – when a friend joins a room or follows an artist.
- **Delivery Method**:
  - In-app only (no push for MVP).
  - Badge count on bell icon (**global only**).
  - Scrollable list inside Notification Center.
- **Controls**:
  - “Mark all as read.” (✅ logs a bulk action in notification_logs)
  - Dismiss individual notifications (✅ logged for analytics).
- **Storage/State**:
  - Notifications stored in backend (Supabase/Postgres).
  - Persist **read/unread state across devices**.
  - Notifications **hard deleted after 30 days** (no recovery).
- **Recommendation Engine Integration**:
  - Daily recommendations injected as notifications (max 1 per day).
  - Notifications **deep link** to full page (track/playlist/room/artist).
### **Out of Scope (MVP)**

- Push notifications (mobile OS-level).
- Email/SMS notifications.
- Advanced settings (mute per category, frequency).
- Recommendation cover art previews (**post-MVP**).
- History/archive view (**hard delete only**).
---

## **3) Future Enhancements (Post-MVP)**

- Push notifications (Android/iOS).
- Email/SMS alerts.
- User settings & preferences (mute, frequency).
- Bundled/grouped notifications.
- Rich media (cover art for all notification types).
- History/archive of expired/dismissed notifications.
---

## **4) Target Customers**

- **Music Fans** – want timely updates on new tracks/artists they’ll enjoy.
- **Room Members** – want to know when activity happens in their communities.
- **Creators/DJs** – want feedback when fans interact with their playlists or rooms.
---

## **5) Underserved Needs**

- Current music apps either overwhelm users with irrelevant notifications or fail to surface timely, relevant ones.
- PWA users rarely get a consolidated “inbox” of updates without push. seda.fm solves this by building a central hub that feels **real-time and social**.
---

## **6) Value Proposition**

- Keeps users **engaged** without requiring push (critical for PWA limitations).
- Makes recommendations **actionable**.
- Provides a **foundation for future push + personalization**.
---

## **7) Feature Set**

| **Feature** | **MVP** | **Future** |
| --- | --- | --- |
| Notification Center UI (bell + list) | ✅ | ✅ |
| Recommendations as separate notifications | ✅ | ✅ |
| Recommendations highlighted visually | ✅ | ✅ |
| Playlist/Room/Friend activity updates | ✅ | ✅ |
| Read/unread + dismiss | ✅ | ✅ |
| Badge count indicator (global) | ✅ | ✅ |
| Log dismissed notifications (analytics) | ✅ | ✅ |
| Bulk action logging (“mark all as read”) | ✅ | ✅ |
| Persist read/unread across devices | ✅ | ✅ |
| Hard delete expired notifications (30 days) | ✅ | ✅ |
| Prioritization = time-based (not levels) | ✅ | ✅ |
| Deep link to full page | ✅ | ✅ |
| Push notifications (native) | ❌ | ✅ |
| Email/SMS alerts | ❌ | ✅ |
| User settings (mute, freq.) | ❌ | ✅ |
| Bundled/grouped notifications | ❌ | ✅ |
| Rich media (cover art for recs/others) | ❌ | ✅ |
| History view/archive | ❌ | ✅ |

---

## **8) UX Considerations**

- Recommendations highlighted with distinct styling (cover art post-MVP).
- Lightweight feed-style list (timestamp, type icon, CTA).
- Clear actions (“Play now,” “Join room”).
- Badge count synced instantly across devices.
- Notifications auto-delete after 30 days.
- Deep links open full detail pages.
---

## **9) Data Model (Backend Schema)**

**Table: notifications**

- id (UUID, PK)
- user_id (UUID, FK → users.id)
- type (ENUM: recommendation, playlist_activity, room_activity, friend_activity)
- entity_id (UUID, nullable)
- title (TEXT)
- body (TEXT)
- is_read (BOOLEAN)
- is_dismissed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- expires_at (TIMESTAMP, default created_at + 30 days)
**Table: notification_logs**

- id (UUID, PK)
- notification_id (UUID, FK → notifications.id, nullable for bulk actions)
- user_id (UUID, FK → users.id)
- action (ENUM: viewed, dismissed, clicked, bulk_read)
- timestamp (TIMESTAMP)
---

## **10) Decisions**

- **Expired notifications:** hard delete, no recovery.
- **Prioritization:** time-based only.
- **Recommendations:** separate notifications, highlighted visually, cover art post-MVP.
- **“Mark all as read”:** logs a bulk action in notification_logs.
---

## **11) API Design (MVP)**

### **REST Endpoints**

- GET /api/v1/notifications → list w/ filters + pagination.
- GET /api/v1/notifications/unread-count → unread badge.
- PATCH /api/v1/notifications/{id} → mark read.
- POST /api/v1/notifications/{id}/dismiss → dismiss one.
- POST /api/v1/notifications/mark-all-read → bulk mark read.
- POST /api/v1/notifications/{id}/click → log CTR.
- DELETE /api/v1/notifications/expired → cleanup (internal).
### **GraphQL Queries & Mutations**

- notifications(...)
- unreadNotificationCount
- markNotificationRead(id: ID!, isRead: Boolean)
- dismissNotification(id: ID!)
- markAllNotificationsRead(type: [NotificationType!])
- logNotificationClick(id: ID!)
- deleteExpiredNotifications (service only)
---

## **12) Supabase Migrations (DDL)**

### **Enums**

```plain text
create type notification_type as enum (
  'recommendation',
  'playlist_activity',
  'room_activity',
  'friend_activity'
);

create type notification_action as enum (
  'viewed',
  'dismissed',
  'clicked',
  'bulk_read'
);
```

### **Tables**

```plain text
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  entity_id uuid,
  title text not null,
  body text,
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action notification_action not null,
  timestamp timestamptz not null default now()
);
```

### **Indexes**

```plain text
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_user_unread on notifications(user_id, is_read) where is_read = false;
create index idx_notifications_expiry on notifications(expires_at);

create index idx_logs_user on notification_logs(user_id);
create index idx_logs_action on notification_logs(action);
```

### **RLS Policies**

```plain text
alter table notifications enable row level security;
alter table notification_logs enable row level security;

create policy user_can_select_notifications
on notifications for select using (user_id = auth.uid());

create policy user_can_update_notifications
on notifications for update using (user_id = auth.uid());

create policy user_can_delete_notifications
on notifications for delete using (user_id = auth.uid());

create policy user_can_insert_logs
on notification_logs for insert with check (user_id = auth.uid());

create policy user_can_select_logs
on notification_logs for select using (user_id = auth.uid());
```

### **RPCs**

```plain text
-- Bulk mark as read
create or replace function mark_all_notifications_read(_user uuid, _types notification_type[] default null)
returns integer
language plpgsql security definer as $$
declare _updated int;
begin
  update notifications n
     set is_read = true, updated_at = now()
   where n.user_id = _user
     and n.is_read = false
     and (_types is null or n.type = any(_types));
  get diagnostics _updated = row_count;

  insert into notification_logs (id, notification_id, user_id, action, timestamp)
  values (gen_random_uuid(), null, _user, 'bulk_read', now());

  return _updated;
end $$;

-- Delete expired
create or replace function delete_expired_notifications()
returns integer
language plpgsql security definer as $$
declare _deleted int;
begin
  delete from notifications where expires_at <= now();
  get diagnostics _deleted = row_count;
  return _deleted;
end $$;
```

---

## **13) TypeScript SDK (MVP Stubs)**

```plain text
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!);

export async function getNotifications({ page = 1, pageSize = 20 } = {}) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;
  return data;
}

export async function getUnreadCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await supabase.from('notification_logs').insert({
    notification_id: id,
    user_id: data.user_id,
    action: 'viewed',
  });

  return data;
}

export async function dismissNotification(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_dismissed: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await supabase.from('notification_logs').insert({
    notification_id: id,
    user_id: data.user_id,
    action: 'dismissed',
  });

  return data;
}

export async function markAllRead(types?: string[]) {
  const { data, error } = await supabase.rpc('mark_all_notifications_read', {
    _user: (await supabase.auth.getUser()).data.user?.id,
    _types: types ?? null,
  });
  if (error) throw error;
  return data;
}
```

---

## **14) Engineering Handoff Notes**

- Expiration = **hard delete** after 30 days.
- Recommendations = **1/day max** (rec engine enforced).
- Recommendations = **highlighted in UI**, cover art **post-MVP**.
- Analytics events: notification_viewed, notification_dismissed, notification_clicked, notification_bulk_read.
- Edge cases: If deep link target missing, auto-dismiss + show toast.
---
