# Admin Portal Implementation Plan

## Overview

Create a standalone admin portal with its own URL (`admin.seda.fm`) and separate authentication system for managing the seda.fm platform.

## Architecture Decision

**Approach: Separate Frontend Application**

Create a new `admin-portal/` directory in the monorepo with its own Vite + React app. This keeps admin code completely isolated from the main frontend, has its own build/deploy pipeline, and can be hosted at a separate subdomain.

**Why not integrate into frontend-v2?**
- Security isolation (admin code never shipped to regular users)
- Separate deployment (can update admin without touching main app)
- Cleaner codebase (admin has different UI patterns)
- Performance (main app bundle stays smaller)

## Features

### 1. Dashboard (Home)
- Quick stats: Total users, active users (24h), new signups (7d)
- Revenue overview: Today, this week, this month
- Recent admin actions log
- Pending items requiring attention (verification requests, flagged content)

### 2. User Management
- List all users with search/filter (by email, username, role, status)
- View user details (profile, activity, purchases, content)
- Actions:
  - Deactivate/Reactivate user (soft disable, preserves data)
  - Change role (USER ↔ ARTIST, promote to ADMIN)
  - Reset password (trigger email)
  - View user's content (posts, comments, rooms)

### 3. Content Moderation
- **Comments**: List, search, delete with reason logging
- **Posts**: List, search, delete with reason logging
- **Rooms**: List, view members, delete room
- **Playlists**: List, view, delete

### 4. Financial / Refunds
- List all purchases with filters (status, date range, payment method)
- View purchase details (buyer, seller, product, payment info)
- Issue refund (full or partial) with reason
- Revenue reports by period

### 5. Analytics Dashboard
- User growth chart (daily/weekly/monthly signups)
- Revenue charts (by day, by product type, by payment method)
- Active users trends
- Top artists by revenue
- Geographic distribution

### 6. Verification Requests
- (Already exists) - integrate into new admin UI

## Technical Implementation

### Backend Changes

#### New Admin Endpoints (extend existing admin module)

```
# User Management
GET    /admin/users                    - List users with pagination/filters
GET    /admin/users/:id                - Get user details
PATCH  /admin/users/:id/status         - Activate/deactivate user
PATCH  /admin/users/:id/role           - Change user role

# Content Moderation
GET    /admin/comments                 - List comments with filters
DELETE /admin/comments/:id             - Delete comment (with reason)
GET    /admin/posts                    - List posts with filters
DELETE /admin/posts/:id                - Delete post (with reason)
GET    /admin/rooms                    - List rooms with filters
DELETE /admin/rooms/:id                - Delete room (with reason)
GET    /admin/playlists                - List playlists with filters
DELETE /admin/playlists/:id            - Delete playlist (with reason)

# Financial
GET    /admin/purchases                - List purchases with filters
GET    /admin/purchases/:id            - Get purchase details
POST   /admin/purchases/:id/refund     - Issue refund

# Analytics
GET    /admin/analytics/overview       - Dashboard stats
GET    /admin/analytics/users          - User growth data
GET    /admin/analytics/revenue        - Revenue data
GET    /admin/analytics/top-artists    - Top artists by metric
```

#### Database Changes

Add to Prisma schema:
```prisma
// Track user status
model User {
  // ... existing fields
  isActive    Boolean  @default(true)  // For deactivation
  deactivatedAt DateTime?
  deactivatedBy String?  // Admin who deactivated
}

// Extend AdminAction for more action types
enum AdminActionType {
  APPROVE_VERIFICATION
  DENY_VERIFICATION
  DEACTIVATE_USER
  REACTIVATE_USER
  CHANGE_ROLE
  DELETE_COMMENT
  DELETE_POST
  DELETE_ROOM
  DELETE_PLAYLIST
  ISSUE_REFUND
}
```

#### Authentication

Keep existing X-Admin-Key system but add:
- Admin login endpoint that returns a session token
- Admin users table or flag in User model
- Session management for admin portal

### Frontend (New admin-portal app)

#### Tech Stack
- Vite + React + TypeScript (same as frontend-v2)
- Tailwind CSS for styling
- Shadcn/ui components (same design system)
- React Router for navigation (unlike frontend-v2's state-based)
- React Query for data fetching
- Recharts for analytics charts

#### Directory Structure
```
admin-portal/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── users/
│   │   ├── content/
│   │   ├── financial/
│   │   └── analytics/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Comments.tsx
│   │   ├── Posts.tsx
│   │   ├── Rooms.tsx
│   │   ├── Playlists.tsx
│   │   ├── Purchases.tsx
│   │   ├── Refunds.tsx
│   │   ├── Analytics.tsx
│   │   └── Verifications.tsx
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

#### Pages

1. **Login** - Admin key + optional email/password
2. **Dashboard** - Overview stats, recent actions, pending items
3. **Users** - DataTable with search, filters, actions
4. **Comments** - List with delete action
5. **Posts** - List with delete action
6. **Rooms** - List with member count, delete action
7. **Playlists** - List with delete action
8. **Purchases** - List with refund action
9. **Analytics** - Charts and reports
10. **Verifications** - Existing verification workflow

## Deployment

### Option A: Vercel (Recommended)
- Deploy admin-portal to Vercel
- Configure `admin.seda.fm` subdomain
- Environment variables for API URL and admin key

### Option B: Railway
- Add as separate service in Railway
- Configure custom domain

## Implementation Order

### Phase 1: Foundation
1. Create admin-portal Vite app with basic structure
2. Set up Tailwind + Shadcn/ui
3. Create Layout with Sidebar navigation
4. Implement admin authentication (login page)
5. Create Dashboard page with placeholder stats

### Phase 2: User Management
6. Backend: Add user management endpoints
7. Frontend: Users list page with DataTable
8. Frontend: User detail modal/page
9. Implement deactivate/reactivate actions

### Phase 3: Content Moderation
10. Backend: Add content moderation endpoints
11. Frontend: Comments, Posts, Rooms, Playlists pages
12. Implement delete actions with confirmation

### Phase 4: Financial
13. Backend: Add purchase/refund endpoints
14. Frontend: Purchases page with filters
15. Implement refund flow (integrate with Stripe)

### Phase 5: Analytics
16. Backend: Add analytics aggregation endpoints
17. Frontend: Analytics dashboard with charts
18. User growth, revenue, top artists visualizations

### Phase 6: Polish
19. Add audit logging for all actions
20. Add confirmation dialogs for destructive actions
21. Add toast notifications
22. Mobile responsive adjustments
23. Deploy to production

## Security Considerations

1. **Separate domain** - admin.seda.fm isolated from main app
2. **Admin key required** - 64-char cryptographic key for all requests
3. **IP allowlisting** (optional) - restrict admin access to known IPs
4. **Audit logging** - all admin actions logged with who/when/what
5. **Rate limiting** - prevent brute force on admin endpoints
6. **HTTPS only** - enforce TLS for admin portal
7. **Session timeout** - auto-logout after inactivity

## Questions for User

1. **Admin authentication**:
   - Use existing X-Admin-Key only?
   - Add email/password login for admins?
   - Both (key + optional user identity)?

2. **Deployment target**: Vercel or Railway?

3. **Design**: Match frontend-v2 dark theme or different admin style?

4. **Priority order**: Which features are most urgent?
   - User management
   - Content moderation
   - Refunds
   - Analytics
