# sedā.fm Edge Functions Troubleshooting Guide

## Common Issues and Solutions

### 1. Edge Functions Not Loading

**Error:** `worker boot error: failed to create the graph`

**Symptoms:**
- Functions don't start locally
- Parsing errors in TypeScript files
- Import/export errors

**Solutions:**

#### File Corruption
```bash
# Check for literal \n characters instead of newlines
grep -n '\\n' supabase/functions/**/*.ts

# If found, rewrite the corrupted files
supabase functions serve --debug
```

#### Import Issues
```bash
# Ensure all imports use .ts extensions
import { utils } from './utils.ts';

# Check for missing imports
grep -r "logError" supabase/functions/ --include="*.ts"
```

#### TypeScript Errors
```bash
# Check TypeScript compilation
deno check supabase/functions/**/*.ts

# Common fixes:
# - Add missing type imports: import type { PostHogEvent }
# - Fix interface definitions
# - Ensure proper export/import syntax
```

---

### 2. Admin Authentication Failures

**Error:** `Unauthorized: Invalid admin secret`

**Solutions:**

#### Check Environment Variables
```bash
# Local: Check .env.local file
cat supabase/.env.local | grep ADMIN_SECRET

# Production: Check Supabase secrets
supabase secrets list --project-ref ifrbbfqabeeyxrrliank

# Sandbox: Check Supabase secrets  
supabase secrets list --project-ref ubfgyrgyxqccybqpcgxq
```

#### Verify Admin Secret Format
```bash
# Correct header format
curl -H "x-admin-secret: your-admin-secret-here" [URL]

# NOT: Authorization: Bearer [token]
# NOT: x-admin-key: [secret]
```

#### Update Admin Secrets
```bash
# Generate new secure secret
NEW_SECRET=$(openssl rand -hex 32)

# Update in Supabase
supabase secrets set ADMIN_SECRET="$NEW_SECRET" --project-ref [project-ref]

# Test with new secret
curl -H "x-admin-secret: $NEW_SECRET" [admin-endpoint]
```

---

### 3. PostHog Integration Issues

**Error:** `PostHog API key not configured, skipping event`

**Solutions:**

#### Check PostHog Configuration
```bash
# Test PostHog status
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/posthog-status

# Expected response:
{
  "success": true,
  "data": {
    "configured": true,
    "environment": "sandbox",
    "apiKeyPresent": true
  }
}
```

#### Update PostHog API Key
```bash
# Set/update PostHog key
supabase secrets set POSTHOG_API_KEY="phc_your_api_key_here" --project-ref [project-ref]

# Test event sending
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"eventType":"user_login","distinctId":"test"}' \
  https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/test-event
```

#### Verify PostHog Project Settings
1. Check PostHog project API key is correct
2. Ensure project is not paused
3. Verify API endpoints are accessible

---

### 4. Environment Variable Issues

**Error:** `Environment variable ADMIN_SECRET is required`

**Solutions:**

#### Restart Edge Functions with Environment File
```bash
# Stop current functions
pgrep -f "supabase functions serve" | xargs kill

# Start with explicit env file
supabase functions serve --env-file supabase/.env.local
```

#### Check Environment File Format
```bash
# Correct format (no quotes for values)
ENV_TAG=development
ADMIN_SECRET=your_secret_here

# Incorrect format
ENV_TAG="development"  # Remove quotes
ADMIN_SECRET='your_secret_here'  # Remove quotes
```

#### Validate Environment Variables
```bash
# Test environment detection
curl http://127.0.0.1:54321/functions/v1/health

# Should return environment in response:
{
  "data": {
    "environment": "qa"  // development -> qa fallback
  }
}
```

---

### 5. Database Connection Issues

**Error:** `Failed to connect to database`

**Solutions:**

#### Local Database
```bash
# Start Supabase locally
supabase start

# Check database status
supabase status

# Reset local database if needed
supabase db reset
```

#### Remote Database (Production/Sandbox)
```bash
# Check connection
supabase db ping --project-ref [project-ref]

# Link project if needed
supabase link --project-ref [project-ref]
```

---

### 6. Feature Flag Database Errors

**Error:** `new row for relation "feature_flags" violates check constraint`

**Solutions:**

#### Environment Constraint Issue
```sql
-- The database has a check constraint on environment values
-- Current constraint allows: 'production', 'sandbox', 'qa'
-- But getEnvTag() returns: 'development' -> 'qa' (fallback)

-- Fix: Update environment mapping in getEnvTag() or database constraint
```

#### Create Database Migration
```bash
# Create feature_flags table with proper constraints
supabase migration new create_feature_flags_table

# Add to migration file:
CREATE TABLE feature_flags (
  key text NOT NULL,
  enabled boolean DEFAULT false,
  environment text NOT NULL CHECK (environment IN ('production', 'sandbox', 'qa')),
  description text,
  rollout_percentage integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (key, environment)
);
```

---

### 7. CORS Issues

**Error:** Browser blocks requests due to CORS policy

**Solutions:**

#### Check CORS Headers
```bash
# All endpoints should return CORS headers
curl -I https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health

# Expected headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, x-admin-secret
```

#### Preflight Request Issues
```bash
# Test OPTIONS request
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, x-admin-secret" \
  https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags
```

---

### 8. Deployment Issues

**Error:** `Failed to deploy function`

**Solutions:**

#### Check Project Reference
```bash
# List projects
supabase projects list

# Deploy to correct project
supabase functions deploy --project-ref ifrbbfqabeeyxrrliank  # Production
supabase functions deploy --project-ref ubfgyrgyxqccybqpcgxq  # Sandbox
```

#### Verify Function Structure
```bash
# Ensure proper file structure
supabase/
└── functions/
    ├── health/
    │   └── index.ts
    ├── flags/
    │   └── index.ts
    └── _shared/
        ├── utils.ts
        └── posthog.ts
```

#### Check Bundle Size
```bash
# If bundle is too large, optimize imports
# Use specific imports instead of wildcard
import { createResponse } from '../_shared/utils.ts';
// NOT: import * from '../_shared/utils.ts';
```

---

## Debug Commands

### Enable Debug Logging
```bash
# Local development
supabase functions serve --debug

# Check function logs
supabase functions logs [function-name] --project-ref [project-ref]
```

### Health Check Commands
```bash
# Test all environments
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health     # Production
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/health     # Sandbox
curl http://127.0.0.1:54321/functions/v1/health                       # Local
```

### Environment Variable Debug
```bash
# Check local environment
cat supabase/.env.local

# Check remote secrets (requires auth)
supabase secrets list --project-ref [project-ref]

# Test environment detection
curl http://127.0.0.1:54321/functions/v1/dev/info  # Local only
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/info  # Sandbox only
```

### PostHog Debug
```bash
# Test PostHog connection
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/posthog-status

# Send test event
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"eventType":"user_login","distinctId":"debug-test"}' \
  https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/test-event

# Check PostHog dashboard for events
# Look for events with environment property
```

## Getting Help

1. **Check logs first:** `supabase functions logs [function-name]`
2. **Test locally:** Start with local development before debugging remote
3. **Verify environment:** Ensure correct project refs and environment variables
4. **Check status:** Use health and dev endpoints to verify system state
5. **Incremental testing:** Test one endpoint at a time

## Useful Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [PostHog API Reference](https://posthog.com/docs/api)
- [Project Dashboard - Production](https://supabase.com/dashboard/project/ifrbbfqabeeyxrrliank)
- [Project Dashboard - Sandbox](https://supabase.com/dashboard/project/ubfgyrgyxqccybqpcgxq)