# Vercel Deployment Guide

This guide walks through deploying the Sedā.fm application to Vercel in phases.

## Prerequisites

1. Vercel account ([vercel.com](https://vercel.com))
2. Vercel CLI installed: `npm i -g vercel`
3. Supabase project set up
4. SendGrid account with API key

## Phase 1: Core Auth & Infrastructure

This phase deploys the streamlined authentication system with:
- Simplified artist onboarding (removed track pinning and fan invites)
- Feed in artist desktop sidebar
- Production-ready logging
- Fixed authentication flow

### Step 1: Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Note down:
   - Project URL
   - Anon key
   - Service role key
   - Database connection string

3. **Run database migrations:**
   ```bash
   cd backend
   npm run prisma:migrate:prod
   ```

### Step 2: Deploy Frontend to Vercel (About Page Only)

The frontend should be deployed first so we can get its URL for CORS configuration.

**IMPORTANT:** Initial deployment shows ONLY the about page with NO login/signup access.

1. **Install Vercel CLI (if not already installed):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from frontend directory:**
   ```bash
   cd frontend-v2
   vercel login
   vercel
   ```

3. **Set up environment variables:**

   During deployment, Vercel will ask about environment variables. You can also set them in the Vercel dashboard under Project Settings → Environment Variables:

   **For About Page Only (Initial Deployment):**
   ```
   VITE_ENABLE_AUTH=false
   ```

   **When Ready to Enable Full App:**
   ```
   VITE_ENABLE_AUTH=true
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_API_TIMEOUT=10000
   VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Get your frontend URL:**
   - After deployment, note the URL (e.g., `https://seda.fm` or `https://your-app.vercel.app`)
   - You can also add a custom domain in Vercel dashboard

5. **Verify About Page:**
   - Visit your deployed URL
   - You should see ONLY the about page
   - Login/Signup buttons should NOT appear

### Step 3: Deploy Backend to Vercel

1. **Make build script executable:**
   ```bash
   cd ../backend
   chmod +x scripts/vercel-build.sh
   ```

2. **Deploy backend:**
   ```bash
   vercel
   ```

3. **Set up environment variables:**

   In Vercel dashboard → Project Settings → Environment Variables, add:

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@seda.fm
   SENDGRID_FROM_NAME=sedā.fm
   FRONTEND_URL=https://your-frontend-url.vercel.app
   THROTTLE_TTL=60
   THROTTLE_LIMIT=10
   ```

   **Important:** Set `FRONTEND_URL` to match your actual frontend URL from Step 2.

4. **Configure build settings:**

   In Vercel dashboard → Project Settings → General:
   - Build Command: `bash scripts/vercel-build.sh`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Get your backend URL:**
   - Note the deployed URL (e.g., `https://backend-xxxx.vercel.app`)

### Step 4: Update Frontend API URL

1. Go to Vercel dashboard → Frontend project → Settings → Environment Variables
2. Update `VITE_API_URL` to match your backend URL
3. Redeploy frontend:
   ```bash
   cd frontend-v2
   vercel --prod
   ```

### Step 5: Configure Custom Domains (Optional)

1. **Frontend domain:**
   - Vercel dashboard → Frontend project → Settings → Domains
   - Add your domain (e.g., `app.seda.fm`)
   - Update DNS as instructed

2. **Backend domain:**
   - Vercel dashboard → Backend project → Settings → Domains
   - Add your domain (e.g., `api.seda.fm`)
   - Update DNS as instructed

3. **Update environment variables:**
   - Update `VITE_API_URL` in frontend to use custom backend domain
   - Update `FRONTEND_URL` in backend to use custom frontend domain
   - Redeploy both projects

### Step 6: Verify Deployment

Test the following flows:

1. **Fan Signup:**
   - Sign up with email/password
   - Set username
   - Select genres
   - Join/create room
   - Verify welcome screen appears

2. **Artist Signup:**
   - Sign up with email/password as artist
   - Set username
   - Claim/create room
   - Verify goes directly to welcome (no track/invite steps)
   - Check Feed appears in desktop sidebar

3. **Authentication:**
   - Sign out
   - Sign back in
   - Verify session persists
   - Check protected routes work

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Backend port (3001) | Yes |
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes |
| `SENDGRID_FROM_EMAIL` | Email sender address | Yes |
| `SENDGRID_FROM_NAME` | Email sender name | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `THROTTLE_TTL` | Rate limit time window (seconds) | No |
| `THROTTLE_LIMIT` | Rate limit max requests | No |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_API_TIMEOUT` | API request timeout (ms) | No |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Deployment Commands Reference

### Initial Deployment
```bash
# Frontend
cd frontend-v2
vercel

# Backend
cd backend
vercel
```

### Production Deployment
```bash
# Frontend
cd frontend-v2
vercel --prod

# Backend
cd backend
vercel --prod
```

### View Logs
```bash
vercel logs [deployment-url]
```

### List Deployments
```bash
vercel ls
```

## Rollback Procedures

### To rollback to previous version:

1. **Using Vercel CLI:**
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Using Vercel Dashboard:**
   - Go to Deployments tab
   - Find the last working deployment
   - Click "Promote to Production"

### If deployment fails:

1. **Check Vercel logs:**
   ```bash
   vercel logs
   ```

2. **Verify environment variables:**
   - Check all required variables are set in Vercel dashboard
   - Verify no typos in URLs/keys
   - Ensure variables are set for "Production" environment

3. **Database issues:**
   ```bash
   # Reset migrations if needed
   cd backend
   npx prisma migrate reset
   npm run prisma:migrate:prod
   ```

4. **Build issues:**
   - Check build logs in Vercel dashboard
   - Verify `vercel.json` configuration is correct
   - Ensure build script is executable

## Monitoring

1. **Vercel Dashboard:**
   - Monitor deployment status
   - Check logs in real-time
   - View analytics and performance metrics

2. **Health Checks:**
   - Backend: `https://your-backend-url.vercel.app/health`
   - Frontend: Check main page loads

3. **Supabase Dashboard:**
   - Monitor auth users
   - Check database queries
   - Review API usage

## Troubleshooting

### Backend won't start:
- Check `DATABASE_URL` is correct
- Verify Prisma client was generated (check build logs)
- Verify all required env vars are set
- Check Node.js version (should be >=18.0.0)

### Frontend can't connect to backend:
- Verify `VITE_API_URL` matches backend URL exactly
- Check CORS configuration (`FRONTEND_URL` in backend)
- Verify backend is deployed and running
- Check browser console for CORS errors

### Authentication issues:
- Check Supabase keys are correct
- Verify `SUPABASE_URL` matches in both frontend and backend
- Check JWT configuration in Supabase dashboard
- Verify Supabase project is not paused

### Database connection errors:
- Verify Supabase connection string format
- Check database is accessible (connection pooling enabled)
- Review Supabase connection limits
- Verify database migrations ran successfully

### Build failures:
- Check Node.js version matches `engines` in package.json
- Verify all dependencies are in `dependencies` (not just `devDependencies`)
- Check Prisma schema is valid
- Review build command output in Vercel logs

## Important Notes

### Vercel Serverless Functions
- Backend will run as serverless functions
- Each request spawns a new instance
- Cold starts may occur (first request slower)
- Connection pooling is important for database

### Environment Variables
- Must be set in Vercel dashboard
- Changes require redeployment
- Different values for Preview vs Production
- Use `.env.production.template` files as reference

### Database Migrations
- Run migrations locally before deploying
- Never run migrations in Vercel build process
- Use Supabase dashboard to verify migration status

## Next Phases

### Phase 2: Artist Features (Future)
- Dashboard analytics
- Fan management
- Store functionality
- Revenue tracking

### Phase 3: Content & Social (Future)
- Content discovery
- Social interactions
- Notification system
- Real-time features

## Support Resources

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- NestJS Docs: [docs.nestjs.com](https://docs.nestjs.com)
- Vite Docs: [vitejs.dev](https://vitejs.dev)

## Quick Start Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy frontend (preview)
cd frontend-v2
vercel

# Deploy backend (preview)
cd backend
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs

# Rollback deployment
vercel rollback [url]
```
