# SEDA

Full service platform for sedā.fm, handling artist verification, user management, chat, and more.

## Features

- Artist verification via claim code system
- Multi-environment support (QA, Sandbox, Production)
- Automated web crawling for verification
- Admin manual override capabilities
- Rate limiting and security measures

## Prerequisites

- Node.js 18+
- PostgreSQL (via Supabase)
- npm or yarn

## Environment Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment files:**
   - Copy `.env.example` to `.env.qa`, `.env.sandbox`, and `.env.production`
   - Update each file with appropriate Supabase credentials

3. **Generate Prisma client:**
```bash
npm run prisma:generate
```

4. **Run database migrations:**
```bash
# For QA environment
npm run prisma:migrate:qa

# For Sandbox environment
npm run prisma:migrate:sandbox

# For Production environment
npm run prisma:migrate:prod
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### QA Environment
```bash
npm run build
npm run start:qa
```

### Sandbox Environment
```bash
npm run build
npm run start:sandbox
```

### Production Environment
```bash
npm run build
npm run start:prod
```

## API Documentation

When running in non-production environments, Swagger documentation is available at:
```
http://localhost:3001/api/v1/docs
```

## API Endpoints

### Verification Endpoints

- `POST /api/v1/artist/verification/request` - Request verification (returns claim code)
- `POST /api/v1/artist/verification/submit` - Submit verification with URL
- `GET /api/v1/artist/verification/status/:id` - Check verification status
- `GET /api/v1/artist/verification/my-requests` - Get user's verification requests

### Admin Endpoints

- `GET /api/v1/admin/verification/pending` - Get pending verifications
- `GET /api/v1/admin/verification/:id` - Get verification details
- `PATCH /api/v1/admin/verification/:id/approve` - Approve verification
- `PATCH /api/v1/admin/verification/:id/deny` - Deny verification
- `GET /api/v1/admin/verification/stats/overview` - Get verification statistics

## Testing

### Unit Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

## Verification Flow

1. Artist requests verification → receives unique claim code
2. Artist places code on public channel (Bandcamp, website, etc.)
3. Artist submits URL where code is placed
4. System crawls URL to verify code presence
5. If found → automatic approval
6. If not found → admin manual review
7. Artist receives verified badge

## Security Features

- Rate limiting (3 verification requests per day)
- Claim code expiration (7 days)
- Admin API key authentication
- Supabase JWT token validation
- URL validation and sanitization

## Environment Variables

Key environment variables:
- `NODE_ENV` - Environment (qa/sandbox/production)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_API_KEY` - Admin authentication key

## Architecture

- **Framework**: NestJS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Web Crawling**: Puppeteer
- **Validation**: class-validator

## Supabase Edge Functions

The project includes Supabase Edge Functions for additional API endpoints:

### Available Functions

- **`/flags`** - Feature flag management
  - `GET /flags` - Get all feature flags
  - `POST /flags` - Create/update feature flag (admin only)
  - `DELETE /flags/:key` - Delete feature flag (admin only)

- **`/metrics`** - System metrics and analytics
  - `GET /metrics` - Get system metrics (admin only)
  - `POST /metrics/track` - Track custom event
  - `GET /metrics/health` - Public health check

- **`/dev`** - Development utilities (QA/Sandbox only, returns 404 in production)
  - `GET /dev/info` - Environment information
  - `POST /dev/seed` - Seed test data (admin only)
  - `DELETE /dev/reset` - Reset test data (admin only)
  - `GET /dev/logs` - Recent logs (admin only)
  - `POST /dev/simulate` - Simulate scenarios

- **`/health`** - Health monitoring
  - `GET /health` - Basic health check
  - `GET /health/detailed` - Detailed health check (admin only)
  - `GET /health/ready` - Readiness probe
  - `GET /health/live` - Liveness probe

### Edge Functions Setup

1. **Install Supabase CLI:**
```bash
npm install -g supabase
```

2. **Set up environment variables:**
```bash
# Copy environment template
cp supabase/.env.example supabase/.env.local

# Edit with your values
ENVIRONMENT=qa
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
ADMIN_SECRET=your-admin-secret
POSTHOG_API_KEY=your-posthog-key
```

3. **Deploy Edge Functions:**
```bash
# Deploy all functions to QA
cd supabase && ./deploy.sh qa

# Deploy specific function to production
cd supabase && ./deploy.sh production health

# Deploy to sandbox environment
cd supabase && ./deploy.sh sandbox
```

4. **Run database migration:**
```bash
supabase db push
```

### Environment Configuration

Set these environment variables in your Supabase project dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `ENVIRONMENT` | Current environment (qa/sandbox/production) | Yes |
| `ADMIN_SECRET` | Secret for admin endpoints | Yes |
| `POSTHOG_API_KEY` | PostHog analytics key | Optional |
| `SUPABASE_URL` | Auto-provided by Supabase | Auto |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | Auto |

### Function Endpoints

#### Production Environment (seda-prod: ifrbbfqabeeyxrrliank)
```
https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health
https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags
https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/metrics (admin only)
https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/dev/* (returns 404)
```

#### Sandbox Environment (seda-sbx: ubfgyrgyxqccybqpcgxq)
```
https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/health
https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/flags
https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/metrics (admin only)
https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/info
https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/posthog-status
https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/test-event
```

#### Local QA Environment (development)
```
http://127.0.0.1:54321/functions/v1/health
http://127.0.0.1:54321/functions/v1/flags
http://127.0.0.1:54321/functions/v1/metrics (admin only)
http://127.0.0.1:54321/functions/v1/dev/info
```

### Admin Authentication

Admin endpoints require the `x-admin-secret` header:

**Production Admin Secret:**
```bash
curl -H "x-admin-secret: aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86" \
     https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/metrics
```

**Sandbox Admin Secret:**
```bash
curl -H "x-admin-secret: ca84d8cf6dde59d8ea5399d148ba90d842eb339f7b53aff79d8ce7acefad1c77" \
     https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/metrics
```

**Local Admin Secret:**
```bash
curl -H "x-admin-secret: 427770a9a22133e3a2da3604f324ff50a50587199b836e66d28e4e64540de26b" \
     http://127.0.0.1:54321/functions/v1/metrics
```

## Option A: Prod + Sandbox on Free; QA local (CLI)

This deployment strategy minimizes costs while providing comprehensive testing capabilities.

### Architecture Overview
- **Production**: Supabase Free Plan + Edge Functions
- **Sandbox**: Supabase Free Plan + Edge Functions  
- **QA**: Local development + Supabase CLI

### Environment Setup

#### 1. Production Environment
```bash
# Create production Supabase project
supabase projects create seda-fm-prod

# Set environment variables in Supabase dashboard
ENV_TAG=production
ADMIN_SECRET=your-secure-admin-secret
POSTHOG_API_KEY=your-posthog-api-key

# Deploy Edge Functions
supabase functions deploy flags --project-ref your-prod-ref
supabase functions deploy metrics --project-ref your-prod-ref  
supabase functions deploy health --project-ref your-prod-ref
# Note: dev function returns 404 in production
```

#### 2. Sandbox Environment
```bash
# Create sandbox Supabase project
supabase projects create seda-fm-sandbox

# Set environment variables
ENV_TAG=sandbox
ADMIN_SECRET=your-sandbox-admin-secret
POSTHOG_API_KEY=your-posthog-api-key

# Deploy all functions including dev
supabase functions deploy flags --project-ref your-sandbox-ref
supabase functions deploy metrics --project-ref your-sandbox-ref
supabase functions deploy health --project-ref your-sandbox-ref
supabase functions deploy dev --project-ref your-sandbox-ref
```

#### 3. QA Local Setup
```bash
# Initialize Supabase locally
supabase init
supabase start

# Set up local environment
export ENV_TAG=development
export ADMIN_SECRET=local-admin-secret
export POSTHOG_API_KEY=your-posthog-api-key

# Serve functions locally
supabase functions serve

# Run Node.js server locally
npm run start:dev
```

### Secrets Management

#### Production Secrets (Supabase Dashboard)
```bash
# In Supabase Dashboard > Project Settings > Environment Variables
ENV_TAG=production
ADMIN_SECRET=prod_secret_$(openssl rand -hex 32)
POSTHOG_API_KEY=phc_prod_key_here
```

#### Sandbox Secrets (Supabase Dashboard)
```bash
ENV_TAG=sandbox
ADMIN_SECRET=sandbox_secret_$(openssl rand -hex 32)
POSTHOG_API_KEY=phc_sandbox_key_here
```

#### Local QA Secrets (.env.local)
```bash
ENV_TAG=development
ADMIN_SECRET=local_development_secret
POSTHOG_API_KEY=phc_dev_key_here
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_key
```

### Deploy Commands

#### Deploy to Production (COMPLETED ✅)
```bash
# Deploy all functions
supabase functions deploy --project-ref ifrbbfqabeeyxrrliank

# Set environment variables (completed via setup-production-env.sh)
supabase secrets set ENV_TAG=production --project-ref ifrbbfqabeeyxrrliank
supabase secrets set ADMIN_SECRET=aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86 --project-ref ifrbbfqabeeyxrrliank
supabase secrets set POSTHOG_API_KEY=phc_7RiYNu4koj0vuqSkBr4LF7ZFelzvToKyJ0KmVqjUBfo --project-ref ifrbbfqabeeyxrrliank

# Verify deployment
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health
```

#### Deploy to Sandbox (COMPLETED ✅)
```bash
# Deploy all functions (including dev)
supabase functions deploy --project-ref ubfgyrgyxqccybqpcgxq

# Set environment variables (completed via setup-sandbox-env.sh)
supabase secrets set ENV_TAG=sandbox --project-ref ubfgyrgyxqccybqpcgxq
supabase secrets set ADMIN_SECRET=ca84d8cf6dde59d8ea5399d148ba90d842eb339f7b53aff79d8ce7acefad1c77 --project-ref ubfgyrgyxqccybqpcgxq
supabase secrets set POSTHOG_API_KEY=phc_7RiYNu4koj0vuqSkBr4LF7ZFelzvToKyJ0KmVqjUBfo --project-ref ubfgyrgyxqccybqpcgxq

# Test dev endpoints work
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/info
```

#### Local QA Development
```bash
# Start local Supabase
supabase start

# Serve functions locally  
supabase functions serve

# Functions available at:
# http://localhost:54321/functions/v1/health
# http://localhost:54321/functions/v1/flags
# http://localhost:54321/functions/v1/metrics  
# http://localhost:54321/functions/v1/dev/info
```

### Testing Endpoints (ALL TESTED ✅)

#### Health Check
```bash
# Production - Returns environment: "production"
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health

# Sandbox - Returns environment: "sandbox" 
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/health

# Local QA - Returns environment: "qa" (development fallback)
curl http://127.0.0.1:54321/functions/v1/health
```

#### Feature Flags Management 
```bash
# Get all flags (Public read access)
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags

# Create/update flag
curl -X POST \
     -H "x-admin-secret: your-admin-secret" \
     -H "Content-Type: application/json" \
     -d '{"name":"New Feature","key":"new_feature","enabled":true}' \
     https://your-prod-ref.supabase.co/functions/v1/flags

# Toggle flag
curl -X PUT \
     -H "x-admin-secret: your-admin-secret" \
     https://your-prod-ref.supabase.co/functions/v1/flags?key=new_feature
```

#### Metrics (Admin Protected)
```bash
# Get system metrics (DAU/WAU, active_channels, skip_rate_24h, top_tracks_24h)
curl -H "x-admin-secret: your-admin-secret" \
     https://your-prod-ref.supabase.co/functions/v1/metrics
```

#### Dev Endpoints (Sandbox/QA Only)
```bash
# PostHog test event (works in sandbox, 404 in production)
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"eventType":"user_login","distinctId":"test-user"}' \
     https://your-sandbox-ref.supabase.co/functions/v1/dev/test-event

# PostHog status check
curl https://your-sandbox-ref.supabase.co/functions/v1/dev/posthog-status

# Environment info
curl https://your-sandbox-ref.supabase.co/functions/v1/dev/info
```

### Cost Breakdown

#### Supabase Free Plan Limits (per project)
- **Database**: 500MB storage
- **Bandwidth**: 5GB/month
- **Edge Functions**: 500K invocations/month
- **Auth**: 50K MAUs

#### Total Monthly Cost: $0
- Production: Free Plan
- Sandbox: Free Plan  
- QA: Local (no cost)

### Database Schema Migration

```bash
# 1. Test locally first
supabase db reset
supabase db push

# 2. Deploy to sandbox
supabase db push --project-ref your-sandbox-ref

# 3. Deploy to production
supabase db push --project-ref your-prod-ref
```

### Monitoring & Observability

#### Built-in Monitoring
```bash
# Function logs (Supabase Dashboard)
supabase functions logs flags --project-ref your-prod-ref

# Database metrics (Supabase Dashboard)
# Navigate to Project > Settings > Database

# PostHog Analytics (if configured)
# Events automatically include environment tag
```

#### Custom Health Monitoring
```bash
# Set up health check monitoring
# Use services like UptimeRobot or Pingdom to monitor:
# https://your-prod-ref.supabase.co/functions/v1/health
# https://your-sandbox-ref.supabase.co/functions/v1/health
```

### Deployment Notes

- **Security**: Dev endpoints automatically return 404 in production (ENV_TAG=production)
- **Analytics**: PostHog events include `environment` property from `ENV_TAG|NODE_ENV`
- **Admin Protection**: All admin endpoints require `x-admin-secret` header
- **CORS**: All endpoints include proper CORS headers
- **Error Handling**: Comprehensive error handling with structured JSON responses
- **Environment Isolation**: Each environment has separate Supabase projects and secrets