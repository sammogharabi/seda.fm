# sedā.fm Edge Functions API Documentation

## Overview

The sedā.fm Edge Functions provide a comprehensive API for system monitoring, feature flag management, analytics tracking, and development utilities across production, sandbox, and local environments.

## Base URLs

| Environment | Base URL | Project ID |
|-------------|----------|------------|
| **Production** | `https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/` | `ifrbbfqabeeyxrrliank` |
| **Sandbox** | `https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/` | `ubfgyrgyxqccybqpcgxq` |
| **Local** | `http://127.0.0.1:54321/functions/v1/` | - |

## Authentication

Admin endpoints require the `x-admin-secret` header:

| Environment | Admin Secret |
|-------------|--------------|
| Production | `aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86` |
| Sandbox | `ca84d8cf6dde59d8ea5399d148ba90d842eb339f7b53aff79d8ce7acefad1c77` |
| Local | `427770a9a22133e3a2da3604f324ff50a50587199b836e66d28e4e64540de26b` |

## Endpoints

### Health Check

#### `GET /health`
Public endpoint for system health monitoring.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-26T13:03:14.403Z",
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-26T13:03:14.403Z", 
    "environment": "production|sandbox|qa",
    "uptime_seconds": 0,
    "version": "1.0.0"
  }
}
```

**Examples:**
```bash
# Production
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health

# Sandbox
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/health

# Local
curl http://127.0.0.1:54321/functions/v1/health
```

---

### Feature Flags

#### `GET /flags`
Get all feature flags for the current environment. **Public access**.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-26T13:03:38.757Z",
  "data": [
    {
      "key": "artist_verification",
      "enabled": true,
      "environment": "production",
      "description": "Enable artist verification flow"
    },
    {
      "key": "admin_dashboard", 
      "enabled": true,
      "environment": "production",
      "description": "Enable admin dashboard features"
    }
  ]
}
```

#### `GET /flags/:key`
Get a specific feature flag. **Public access**.

**Parameters:**
- `key` - Feature flag key

#### `POST /flags`
Create or update a feature flag. **Admin only**.

**Headers:**
- `x-admin-secret: <admin-secret>`
- `Content-Type: application/json`

**Body:**
```json
{
  "key": "new_feature",
  "enabled": true,
  "description": "New feature description",
  "rollout_percentage": 50
}
```

#### `PUT /flags?key=<key>`
Toggle a feature flag. **Admin only**.

**Headers:**
- `x-admin-secret: <admin-secret>`

**Parameters:**
- `key` - Feature flag key to toggle

#### `DELETE /flags?key=<key>`
Delete a feature flag. **Admin only**.

**Headers:**
- `x-admin-secret: <admin-secret>`

**Parameters:**
- `key` - Feature flag key to delete

**Examples:**
```bash
# Get all flags (public)
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags

# Create flag (admin)
curl -X POST \
  -H "x-admin-secret: aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86" \
  -H "Content-Type: application/json" \
  -d '{"key":"beta_features","enabled":true,"description":"Beta features"}' \
  https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags

# Toggle flag (admin)
curl -X PUT \
  -H "x-admin-secret: aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86" \
  https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags?key=beta_features
```

---

### System Metrics

#### `GET /metrics`
Get system metrics including DAU/WAU/MAU, active channels, skip rates, and top tracks. **Admin only**.

**Headers:**
- `x-admin-secret: <admin-secret>`

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-26T13:03:32.001Z",
  "data": {
    "timestamp": "2025-08-26T13:03:31.829Z",
    "environment": "production",
    "dau": 150,
    "wau": 750,
    "mau": 2400,
    "active_channels": 25,
    "skip_rate_24h": 18.5,
    "top_tracks_24h": [
      {
        "track_id": "spotify:track:abc123",
        "title": "Song Title",
        "artist": "Artist Name", 
        "play_count": 45,
        "skip_count": 8,
        "completion_rate": 82
      }
    ]
  }
}
```

**Examples:**
```bash
# Production metrics
curl -H "x-admin-secret: aa4f80999796fe8b5e05c0b5732139c4a4f21d6e3d23e4d24646f98267d33b86" \
     https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/metrics

# Sandbox metrics
curl -H "x-admin-secret: ca84d8cf6dde59d8ea5399d148ba90d842eb339f7b53aff79d8ce7acefad1c77" \
     https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/metrics
```

---

### Development & Testing

> **Note:** Dev endpoints return `404 Not Found` in production environment for security.

#### `GET /dev/info`
Get environment and system information. **Sandbox/Local only**.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-26T13:04:01.495Z",
  "data": {
    "environment": "sandbox",
    "timestamp": "2025-08-26T13:04:01.495Z",
    "deno_version": "1.45.2",
    "v8_version": "12.4.254.20",
    "typescript_version": "5.4.5",
    "env_vars": {
      "supabase_url": true,
      "supabase_anon_key": true,
      "supabase_service_key": true,
      "posthog_api_key": true,
      "admin_secret": true
    },
    "posthog_status": {
      "configured": true,
      "environment": "sandbox",
      "apiKeyPresent": true
    }
  }
}
```

#### `GET /dev/posthog-status`
Check PostHog integration status. **Sandbox/Local only**.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-26T13:04:01.495Z",
  "data": {
    "configured": true,
    "environment": "sandbox",
    "apiKeyPresent": true
  }
}
```

#### `POST /dev/test-event`
Send a test event to PostHog. **Sandbox/Local only**.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "eventType": "user_login|track_shared|room_created|message_sent",
  "distinctId": "test-user-123",
  "customProperties": {
    "custom_field": "custom_value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-26T13:04:27.261Z",
  "data": {
    "sent": true,
    "event": "user_login",
    "distinctId": "test-user-123",
    "properties": {
      "login_method": "email",
      "user_type": "artist",
      "device_type": "desktop"
    }
  },
  "message": "Test event sent successfully"
}
```

#### `POST /dev/test-batch`
Send multiple test events to PostHog in batch. **Sandbox/Local only**.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "count": 5,
  "eventTypes": ["user_login", "track_shared"],
  "distinctId": "test-user"
}
```

**Examples:**
```bash
# Environment info (sandbox only)
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/info

# PostHog status
curl https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/posthog-status

# Test single event
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"eventType":"user_login","distinctId":"test-user"}' \
  https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/test-event

# Test batch events
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"count":3,"eventTypes":["user_login","track_shared"]}' \
  https://ubfgyrgyxqccybqpcgxq.supabase.co/functions/v1/dev/test-batch

# Production returns 404 (security feature)
curl https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/dev/info
# Response: Not Found
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "timestamp": "2025-08-26T13:04:27.261Z",
  "data": null,
  "message": "Human readable error message",
  "error": "Detailed error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/missing admin secret)
- `404` - Not Found (endpoint not found or disabled in production)
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Environment Behavior

| Feature | Production | Sandbox | Local |
|---------|------------|---------|-------|
| Health endpoint | ✅ Public | ✅ Public | ✅ Public |
| Feature flags read | ✅ Public | ✅ Public | ✅ Public |
| Feature flags write | 🔒 Admin only | 🔒 Admin only | 🔒 Admin only |
| System metrics | 🔒 Admin only | 🔒 Admin only | 🔒 Admin only |
| Dev endpoints | ❌ 404 (disabled) | ✅ Available | ✅ Available |
| PostHog events | ✅ Environment tagged | ✅ Environment tagged | ✅ Environment tagged |

## Rate Limiting

Currently no rate limiting is enforced, but it's available as a feature flag that can be enabled per environment.

## Analytics Integration

All API calls automatically send analytics events to PostHog with the following properties:
- `environment` - Current environment (production/sandbox/qa)
- `endpoint` - API endpoint called
- `method` - HTTP method
- `user_id` - User ID if available
- `timestamp` - Event timestamp

## CORS

All endpoints include proper CORS headers for cross-origin requests.

## Monitoring

- Health endpoints should be monitored for uptime
- Admin endpoints generate audit logs via PostHog
- All errors are logged with context for debugging