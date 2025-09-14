# 🧪 Sandbox UAT Testing Guide

## Overview

Your Seda Auth Service is now successfully deployed in Railway's sandbox environment. This guide will help you perform comprehensive User Acceptance Testing (UAT).

## 🚀 Getting Started

### 1. Get Your Sandbox URL

From your Railway dashboard:
1. Go to your **sandbox environment** project
2. Find your service deployment
3. Copy the public URL (usually looks like: `https://your-service-production-abc123.up.railway.app`)

### 2. Verify Deployment Health

First, confirm the service is running:

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL
curl -X GET "YOUR_RAILWAY_URL/health"
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "seda-auth-service"
}
```

### 3. Test API Documentation

Your Swagger docs should be available at:
```
YOUR_RAILWAY_URL/api/v1/docs
```

## 🔧 API Testing Setup

### Base Configuration

```bash
# Set your base URL for all tests
export SEDA_API_BASE="YOUR_RAILWAY_URL"
export API_PREFIX="api/v1"

# Admin API key (from your .env.sandbox)
export ADMIN_API_KEY="sandbox_admin_key_change_in_production"
```

## 🧪 Core API Testing

### 1. Health & System Endpoints

```bash
# Health check
curl -X GET "$SEDA_API_BASE/health"

# API health (if available)
curl -X GET "$SEDA_API_BASE/$API_PREFIX/health"
```

### 2. Artist Verification System

```bash
# Request verification (requires auth token)
curl -X POST "$SEDA_API_BASE/$API_PREFIX/artist/verification/request" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "artistName": "Test Artist",
    "website": "https://example.com",
    "socialMedia": {
      "bandcamp": "https://testartist.bandcamp.com"
    }
  }'

# Check verification status
curl -X GET "$SEDA_API_BASE/$API_PREFIX/artist/verification/my-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Admin Endpoints

```bash
# Get pending verifications (admin only)
curl -X GET "$SEDA_API_BASE/$API_PREFIX/admin/verification/pending" \
  -H "X-Admin-Key: $ADMIN_API_KEY"

# Get verification stats
curl -X GET "$SEDA_API_BASE/$API_PREFIX/admin/verification/stats/overview" \
  -H "X-Admin-Key: $ADMIN_API_KEY"
```

### 4. User Profile Management

```bash
# Create user profile
curl -X POST "$SEDA_API_BASE/$API_PREFIX/profiles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "testuser123",
    "displayName": "Test User",
    "bio": "Testing the Seda platform"
  }'

# Get user profile
curl -X GET "$SEDA_API_BASE/$API_PREFIX/profiles/testuser123"
```

### 5. Playlist Management

```bash
# Create playlist
curl -X POST "$SEDA_API_BASE/$API_PREFIX/playlists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Test Playlist",
    "description": "Testing playlist functionality",
    "isPublic": true
  }'

# Get playlists
curl -X GET "$SEDA_API_BASE/$API_PREFIX/playlists" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Authentication Testing

### Using Supabase Auth

Since the service uses Supabase authentication, you'll need to:

1. **Get a JWT token** from your Supabase sandbox instance:
   ```
   https://mqmbjtmibiaukiyiumhl.supabase.co
   ```

2. **Create test users** in Supabase dashboard or via API

3. **Use the JWT token** in your API requests as shown above

### Test User Setup

Create these test accounts in Supabase:
- `test.user@seda.fm` - Regular user
- `test.artist@seda.fm` - Artist account
- `test.admin@seda.fm` - Admin user

## 📊 Database Testing

### Verify Database Connection

Check that Prisma is connecting properly by monitoring logs:

```bash
# Check Railway logs for database connection
railway logs --tail 50
```

Look for:
```
prisma:info Starting a postgresql pool with X connections
```

### Test Data Operations

1. **Create test data** via API endpoints
2. **Verify data persistence** by fetching after creation
3. **Test relationships** between users, profiles, playlists, etc.

## 🚨 Error Handling Testing

### Test Invalid Requests

```bash
# Test invalid authentication
curl -X GET "$SEDA_API_BASE/$API_PREFIX/profiles/me/profile" \
  -H "Authorization: Bearer invalid_token"

# Test validation errors
curl -X POST "$SEDA_API_BASE/$API_PREFIX/profiles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"username": "a"}'  # Too short username

# Test rate limiting
for i in {1..10}; do
  curl -X POST "$SEDA_API_BASE/$API_PREFIX/artist/verification/request" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"artistName": "Test", "website": "https://example.com"}'
done
```

## 🔍 Monitoring & Debugging

### Check Application Logs

```bash
# View real-time logs
railway logs --follow

# Check for errors
railway logs | grep ERROR
railway logs | grep "❌"
```

### Performance Testing

```bash
# Test response times
curl -w "@curl-format.txt" -X GET "$SEDA_API_BASE/health"
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
```

## ✅ UAT Completion Checklist

Use the existing `UAT_CHECKLIST.md` file and mark off items as you test:

- [ ] **Health endpoints** responding correctly
- [ ] **Authentication** working with Supabase JWT
- [ ] **Artist verification** request flow working
- [ ] **Admin endpoints** accessible with admin key
- [ ] **User profiles** CRUD operations working
- [ ] **Playlists** creation and management working
- [ ] **Error handling** returning appropriate responses
- [ ] **Rate limiting** functioning correctly
- [ ] **Database operations** persisting data
- [ ] **Logs** showing healthy application state

## 🐛 Common Issues & Solutions

### Authentication Issues
- Verify JWT token is valid and not expired
- Check Supabase configuration in Railway environment
- Ensure bearer token format: `Bearer <token>`

### Database Connection Issues
- Check DATABASE_URL in Railway environment variables
- Verify Supabase database is accessible
- Look for Prisma connection errors in logs

### API Errors
- Check request headers (Content-Type, Authorization)
- Verify request body format matches API expectations
- Check for validation errors in response

## 📞 Support

If you encounter issues:
1. Check Railway logs first
2. Verify environment configuration
3. Test with Swagger docs at `/api/v1/docs`
4. Reference the `DEPLOYMENT_TROUBLESHOOTING.md` file

---

**Ready to test!** Your Seda Auth Service is deployed and ready for comprehensive UAT. Start with health checks and work through each API endpoint systematically.