# Sedā v2 - Startup & Testing Guide

Complete guide to get the Sedā v2 backend and frontend running end-to-end.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (or Docker for Supabase)
- Git
- npm or pnpm

---

## Option 1: Using Existing PostgreSQL Database

### 1. Start PostgreSQL

If you have PostgreSQL installed locally:
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# If not running, start it:
# macOS (Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### 2. Create Database (if needed)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE seda_dev;

# Exit psql
\q
```

### 3. Update Backend Connection String

Edit `backend/.env.development`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/seda_dev
```

---

## Option 2: Using Supabase Local

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Start Supabase

```bash
# From project root
supabase start

# This will start:
# - PostgreSQL on port 54322
# - Supabase Studio on port 54323
# - API on port 54321
```

### 3. Backend is Already Configured

The backend `.env.development` already points to:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migrations

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Or create and apply a new migration
npx prisma migrate dev
```

### 4. (Optional) Seed Database

```bash
# If you have a seed script
npx prisma db seed

# Or manually insert test data
npx prisma studio
# Opens GUI at http://localhost:5555
```

### 5. Start Backend

```bash
npm run start:dev
```

**Expected output:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] FeedController {/api/v1/feed}
[Nest] LOG [RoutesResolver] PlaylistsController {/api/v1/playlists}
[Nest] LOG [RoutesResolver] DiscoverController {/api/v1/discover}
...
[Nest] LOG Application is running on: http://localhost:3001
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend-v2
npm install
```

### 2. Verify Environment Variables

Check `.env.local` exists with:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

### 3. Start Frontend

```bash
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3002/
  ➜  Network: use --host to expose
```

---

## Verification & Testing

### Test 1: Health Check

```bash
curl http://localhost:3001/api/v1/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "seda-api",
  "timestamp": "2025-11-10T..."
}
```

### Test 2: Trending Playlists

```bash
curl http://localhost:3001/api/v1/playlists/trending?limit=5
```

**Expected response:**
```json
[
  {
    "id": "...",
    "title": "...",
    "owner": {...},
    "_count": {...}
  }
]
```

### Test 3: Search

```bash
curl "http://localhost:3001/api/v1/search?q=test&type=all&limit=5"
```

**Expected response:**
```json
{
  "users": [...],
  "crates": [...],
  "rooms": [...]
}
```

### Test 4: Frontend API Client

1. Open browser to `http://localhost:3002`
2. Navigate to the API example component (if added to routing)
3. Click "Load Feed" button
4. Check browser console for:
   - No CORS errors
   - Successful API calls
   - Proper response data

### Test 5: Check Backend Logs

In the backend terminal, you should see requests being logged:
```
[Nest] LOG GET /api/v1/health 200 5ms
[Nest] LOG GET /api/v1/playlists/trending 200 12ms
```

---

## Common Issues & Solutions

### Issue: "Can't reach database server"

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# Or for Supabase
supabase status

# Restart if needed
supabase stop && supabase start
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue: "Module not found: @/lib/api"

**Solution:**
```bash
cd frontend-v2
# Check if node_modules exists
npm install

# Verify tsconfig paths are correct
cat tsconfig.json | grep "@"
```

### Issue: "CORS error in browser"

**Solution:**
```bash
# Verify backend .env.development has:
CORS_ORIGINS=*

# Restart backend after changing
```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change port in backend/src/main.ts
```

---

## Quick Start (All-in-One)

```bash
# Terminal 1: Database
supabase start

# Terminal 2: Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev

# Terminal 3: Frontend
cd frontend-v2
npm install
npm run dev

# Terminal 4: Test
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/playlists/trending
```

---

## API Testing with the Example Component

### Add to App.tsx (or create route)

```typescript
import { ApiClientExample } from './components/ApiClientExample';

// In your routing or main component:
<ApiClientExample />
```

### Features to Test

1. **Load Feed** - Tests `feedApi.getFeed()`
2. **Load Trending** - Tests `playlistsApi.getTrending()`
3. **Load Profile** - Tests `profilesApi.getMe()`
4. **Create Post** - Tests `feedApi.createPost()`
5. **Search** - Tests `searchApi.search()`

---

## Next Steps After Verification

Once everything is running:

1. **Component Integration**
   - Replace mock data in `SocialFeed.tsx` with `feedApi`
   - Update `Crates.tsx` to use `playlistsApi`
   - Refactor `DiscoverView.tsx` to use `discoverApi`

2. **Auth Integration**
   - Update `http.ts` `getAuthToken()` function
   - Store token in localStorage after Supabase login
   - Test protected endpoints

3. **Error Handling**
   - Add global error boundary
   - Implement toast notifications
   - Handle 401 redirects

4. **Real-time Features**
   - Add WebSocket for DJ sessions
   - Implement live feed updates
   - Real-time notifications

---

## Useful Commands

```bash
# Backend
npm run start:dev          # Start in watch mode
npm run build              # Build for production
npm run lint               # Run linter
npx prisma studio          # Open database GUI
npx prisma db push         # Push schema without migration

# Frontend
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Database
supabase status            # Check Supabase services
supabase stop              # Stop all services
supabase db reset          # Reset database
supabase logs              # View logs
```

---

## Production Checklist

Before deploying to production:

- [ ] Update `DATABASE_URL` to production database
- [ ] Set proper `CORS_ORIGINS` (not `*`)
- [ ] Update `JWT_SECRET` to strong secret
- [ ] Set `NODE_ENV=production`
- [ ] Enable API rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CDN for frontend
- [ ] Enable HTTPS
- [ ] Run security audit: `npm audit`
- [ ] Test all critical API endpoints
- [ ] Set up database backups

---

**Last Updated:** 2025-11-10
**Status:** Ready for testing
