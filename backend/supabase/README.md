# Sedā.fm Edge Functions

Supabase Edge Functions for the Sedā.fm MVP, providing feature flags, metrics, development tools, and health monitoring.

## 🏗️ Architecture

- **Runtime**: Deno with TypeScript
- **Framework**: Supabase Edge Functions
- **Database**: PostgreSQL (Supabase)
- **Analytics**: PostHog integration
- **Authentication**: Admin secret headers

## 📁 Directory Structure

```
supabase/
├── functions/
│   ├── _shared/           # Shared utilities and types
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── utils.ts       # Common utility functions
│   │   └── supabase.ts    # Supabase client helpers
│   ├── flags/             # Feature flags management
│   ├── metrics/           # System metrics and analytics
│   ├── dev/               # Development utilities (QA/Sandbox only)
│   └── health/            # Health monitoring
├── migrations/            # Database migrations
├── config.toml            # Supabase configuration
├── .env.example           # Environment variables template
├── deploy.sh              # Deployment script
├── start-local.sh         # Local development script
└── package.json           # NPM scripts and metadata
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install -g supabase
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start local development:**
   ```bash
   npm start
   # or
   ./start-local.sh
   ```

4. **Deploy to environment:**
   ```bash
   npm run deploy:qa      # Deploy all to QA
   npm run deploy:prod    # Deploy all to Production
   npm run deploy:health  # Deploy only health function
   ```

## 🔗 API Endpoints

### Feature Flags (`/flags`)
Manage feature flags per environment.

- `GET /flags` - Get all feature flags
- `POST /flags` - Create/update flag (admin)
- `DELETE /flags/:key` - Delete flag (admin)

**Example:**
```bash
# Get flags
curl https://your-project.supabase.co/functions/v1/flags

# Create flag (admin)
curl -X POST https://your-project.supabase.co/functions/v1/flags \
  -H "x-admin-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"key": "new_feature", "enabled": true, "description": "Enable new feature"}'
```

### Metrics (`/metrics`)
System metrics and custom event tracking.

- `GET /metrics` - Get system metrics (admin)
- `POST /metrics/track` - Track custom event
- `GET /metrics/health` - Public health check

**Example:**
```bash
# Track event
curl -X POST https://your-project.supabase.co/functions/v1/metrics/track \
  -H "Content-Type: application/json" \
  -d '{"event": "user_action", "properties": {"action": "login"}}'
```

### Development (`/dev`)
Development utilities (QA/Sandbox only, 404 in production).

- `GET /dev/info` - Environment information
- `POST /dev/seed` - Seed test data (admin)
- `DELETE /dev/reset` - Reset test data (admin)
- `GET /dev/logs` - Recent logs (admin)
- `POST /dev/simulate` - Simulate scenarios

### Health (`/health`)
Health monitoring and status checks.

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health (admin)
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## 🔐 Authentication

Admin endpoints require the `x-admin-secret` header:
```bash
curl -H "x-admin-secret: your-admin-secret" \
     https://your-project.supabase.co/functions/v1/metrics
```

## 🌍 Environment Support

- **QA**: All endpoints available, relaxed security
- **Sandbox**: All endpoints available, production-like security
- **Production**: All endpoints except `/dev/*` (returns 404)

## 📊 PostHog Integration

All functions automatically track events to PostHog with environment tags:
- `feature_flags_fetched`
- `metrics_fetched`
- `health_check_basic`
- `dev_info_accessed`
- Custom events via `/metrics/track`

## 🗄️ Database Schema

The functions use a `feature_flags` table:
```sql
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY,
    key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL,
    environment TEXT NOT NULL,
    description TEXT,
    rollout_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(key, environment)
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ENVIRONMENT` | Current environment | Yes | `qa`, `sandbox`, `production` |
| `ADMIN_SECRET` | Admin authentication | Yes | `your-secure-secret` |
| `POSTHOG_API_KEY` | PostHog analytics | Optional | `phc_...` |
| `SUPABASE_URL` | Supabase project URL | Auto | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Auto | `eyJ...` |

### CORS Configuration

All endpoints include CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-admin-secret`

## 🐛 Debugging

1. **Check logs:**
   ```bash
   supabase functions logs --follow
   ```

2. **Test locally:**
   ```bash
   curl http://localhost:54321/functions/v1/health
   ```

3. **Validate deployment:**
   ```bash
   curl https://your-project.supabase.co/functions/v1/health
   ```

## 🚢 Deployment

### Automated Deployment
```bash
# Deploy all functions to QA
./deploy.sh qa

# Deploy specific function to production
./deploy.sh production health
```

### Manual Deployment
```bash
# Link to project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy health

# Set environment variables in dashboard
# Supabase Dashboard > Edge Functions > Environment Variables
```

## 🏥 Monitoring

- **Health checks**: `/health` endpoints for monitoring tools
- **Metrics**: Built-in performance and usage tracking
- **Logging**: Structured JSON logs with context
- **PostHog**: Real-time analytics and event tracking

## 📝 Development Notes

- Functions are stateless and auto-scale
- Use shared utilities in `_shared/` for consistency
- All responses follow the same JSON format
- Error handling includes structured logging
- TypeScript types ensure consistency across functions