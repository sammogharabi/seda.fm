# sedā.fm Edge Functions Setup Guide

## Quick Start (Already Deployed ✅)

The sedā.fm Edge Functions are **already deployed and configured** for all environments:

| Environment | Status | URL |
|-------------|--------|-----|
| **Production** | ✅ Live | https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/ |
| **Sandbox** | ✅ Live | https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/ |
| **Local** | ✅ Ready | http://127.0.0.1:54321/functions/v1/ |

## Environment Details

### Production Environment ✅
- **Project**: seda-prod (`ifrbbfqabeeyxrrliank`)
- **Admin Secret**: `aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86`
- **Features**: Health, Metrics, Flags (Dev endpoints disabled)
- **PostHog**: Configured with environment tagging

### Sandbox Environment ✅
- **Project**: seda-sbx (`ubfgyrgyxqccybqpcgxq`) 
- **Admin Secret**: `ca84d8cf6dde59d8ea5399d148ba90d842eb339f7b53aff79d8ce7acefad1c77`
- **Features**: Health, Metrics, Flags, Dev endpoints
- **PostHog**: Configured with test event capabilities

### Local Development Environment ✅
- **Admin Secret**: `427770a9a22133e3a2da3604f324ff50a50587199b836e66d28e4e64540de26b`
- **Features**: All endpoints available
- **PostHog**: Configured for local testing

## Setting Up New Local Environment

If you need to set up a new local development environment:

### Prerequisites
- Docker Desktop (for local Supabase)
- Supabase CLI (`npm install -g supabase`)
- Node.js 18+ (for the main application)

### 1. Initialize Local Supabase
```bash
# Clone the project (if not already done)
git clone [repository-url]
cd seda

# Start local Supabase instance
supabase start
```

### 2. Configure Environment Variables
```bash
# Copy environment template
cp supabase/.env.example supabase/.env.local

# Edit with your local values
nano supabase/.env.local
```

**Required variables:**
```bash
# Environment Configuration
ENV_TAG=development
NODE_ENV=development

# Supabase Configuration (auto-populated by supabase start)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Admin Secret (generate secure value)
ADMIN_SECRET=$(openssl rand -hex 32)

# PostHog Analytics (optional for local development)
POSTHOG_API_KEY=your_posthog_api_key_here

# Database URL
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 3. Start Edge Functions
```bash
# Start Edge Functions with environment file
supabase functions serve --env-file supabase/.env.local

# Functions will be available at:
# http://127.0.0.1:54321/functions/v1/health
# http://127.0.0.1:54321/functions/v1/flags
# http://127.0.0.1:54321/functions/v1/metrics
# http://127.0.0.1:54321/functions/v1/dev/info
```

### 4. Test Local Setup
```bash
# Test health endpoint
curl http://127.0.0.1:54321/functions/v1/health

# Test admin endpoint (replace with your generated ADMIN_SECRET)
curl -H "x-admin-secret: YOUR_ADMIN_SECRET" \
     http://127.0.0.1:54321/functions/v1/metrics

# Test dev endpoint
curl http://127.0.0.1:54321/functions/v1/dev/info
```

## Deploying to New Environments

### Creating New Production Project
```bash
# Create new Supabase project
supabase projects create seda-fm-prod-new

# Get project reference
supabase projects list

# Deploy functions
supabase functions deploy --project-ref [new-project-ref]

# Set environment variables
./setup-production-env.sh  # Modify script with new project ref
```

### Creating New Sandbox Project  
```bash
# Create new Supabase project
supabase projects create seda-fm-sandbox-new

# Deploy functions
supabase functions deploy --project-ref [new-project-ref]

# Set environment variables
./setup-sandbox-env.sh  # Modify script with new project ref
```

## Function Architecture

### Directory Structure
```
supabase/
└── functions/
    ├── _shared/           # Shared utilities
    │   ├── utils.ts       # Common functions, admin auth, DB client
    │   ├── posthog.ts     # PostHog analytics integration
    │   └── types.ts       # TypeScript interfaces
    ├── health/            # Health monitoring
    │   └── index.ts       # Health check endpoint
    ├── flags/             # Feature flag management  
    │   └── index.ts       # CRUD operations for feature flags
    ├── metrics/           # System metrics
    │   └── index.ts       # DAU/WAU/MAU analytics
    └── dev/               # Development utilities
        └── index.ts       # PostHog testing, environment info
```

### Function Responsibilities

#### `_shared/utils.ts`
- Environment detection (`getEnvTag()`)
- Admin authentication (`requireAdminSecret()`)
- Database client creation (`createAdminClient()`)
- Error handling (`withErrorHandling()`)
- Response formatting (`createResponse()`)

#### `_shared/posthog.ts`
- PostHog event capture
- Environment tagging
- Batch event processing
- Analytics tracking helpers

#### `health/index.ts`
- System health checks
- Uptime monitoring  
- Environment reporting
- Version information

#### `flags/index.ts`
- Feature flag CRUD operations
- Environment-specific flags
- Admin-protected write operations
- Public read access

#### `metrics/index.ts`
- User analytics (DAU/WAU/MAU)
- Channel activity metrics
- Track play/skip statistics
- Admin-only access

#### `dev/index.ts`
- PostHog testing utilities
- Environment information
- Development tools
- **Production-disabled** (returns 404)

## Security Configuration

### Admin Authentication
- All admin endpoints require `x-admin-secret` header
- Secrets are environment-specific
- Generated using `openssl rand -hex 32`

### Environment Protection
- Dev endpoints automatically disabled in production
- Environment detection via `ENV_TAG` with `NODE_ENV` fallback
- Feature flags scoped to environment

### CORS Configuration
- All endpoints include proper CORS headers
- Cross-origin requests supported
- Preflight requests handled

## Analytics Integration

### PostHog Configuration
- Events automatically tagged with environment
- User actions tracked with context
- System events for monitoring
- Error tracking with stack traces

### Event Types
- `api_endpoint_hit` - API usage tracking
- `user_login`, `track_shared` - User actions  
- `system_*` - System events
- `error_occurred` - Error tracking

## Monitoring & Health Checks

### Health Endpoints
```bash
# Basic health check
GET /health

# Detailed system info (local/sandbox only)
GET /dev/info
```

### Uptime Monitoring
Set up external monitoring for:
- `https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health`
- `https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/health`

### Log Monitoring
```bash
# View function logs
supabase functions logs health --project-ref ifrbbfqabeeyxrrliank
supabase functions logs flags --project-ref ubfgyrgyxqccybqpcgxq
```

## Cost Optimization

### Supabase Free Tier Limits
- **Database**: 500MB storage
- **Bandwidth**: 5GB/month  
- **Edge Functions**: 500K invocations/month
- **Auth**: 50K MAUs

### Current Usage Strategy
- Production: Supabase Free Plan ✅
- Sandbox: Supabase Free Plan ✅  
- Local: No cost (self-hosted) ✅
- **Total Cost**: $0/month

## Backup & Recovery

### Configuration Backup
All configuration is stored in:
- `setup-production-env.sh` - Production secrets
- `setup-sandbox-env.sh` - Sandbox secrets  
- `supabase/.env.local` - Local environment
- `DEPLOYMENT_SUMMARY.md` - Complete deployment record

### Function Backup
Functions are version-controlled in git:
- All TypeScript source code
- Shared utilities
- Type definitions
- Environment configurations

### Database Backup
```bash
# Backup database schema
supabase db dump --project-ref [project-ref] > backup.sql

# Restore schema
supabase db reset
psql -f backup.sql [connection-string]
```

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Next Steps

1. **Database Schema**: Set up proper feature_flags and metrics tables
2. **CI/CD Pipeline**: Automate deployments with GitHub Actions
3. **Monitoring Alerts**: Set up error alerting via PostHog or email
4. **Documentation**: API documentation for client integration
5. **Testing**: Automated testing for Edge Functions

## Support

- **Documentation**: See `docs/API.md` for full API reference
- **Issues**: See `docs/TROUBLESHOOTING.md` for common problems
- **Logs**: `supabase functions logs [function-name] --project-ref [project-ref]`
- **Health**: Monitor via health endpoints listed above