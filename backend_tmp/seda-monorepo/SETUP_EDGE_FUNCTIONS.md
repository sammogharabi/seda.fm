# 🚀 SEDA Edge Functions Setup Guide

This guide will help you set up all the edge functions for your new Supabase sandbox project.

## 📁 **Files Created**

I've prepared all the edge functions in: `/Users/sammogharabi/Documents/Projects/Seda/supabase-sandbox/`

### **Edge Functions Available:**

1. **`/flags`** - Feature flag management
2. **`/health`** - Health monitoring 
3. **`/metrics`** - Analytics (admin-protected)
4. **`/dev`** - Development utilities

## 🛠️ **Setup Instructions**

### **Step 1: Set Up Supabase CLI (if not done)**

1. Make sure you're logged into Supabase CLI:
   ```bash
   supabase login
   ```

### **Step 2: Link to Your Project**

1. Navigate to the sandbox directory:
   ```bash
   cd /Users/sammogharabi/Documents/Projects/Seda/supabase-sandbox
   ```

2. Link to your new project:
   ```bash
   supabase link --project-ref mqmbjtmibiaukiyiumhl
   ```
   - When prompted for database password, use: `Sunnybunny27@`

### **Step 3: Deploy Edge Functions**

Deploy all functions at once:
```bash
supabase functions deploy
```

Or deploy individually:
```bash
supabase functions deploy flags
supabase functions deploy health  
supabase functions deploy metrics
supabase functions deploy dev
```

### **Step 4: Set Environment Variables**

Your edge functions need these environment variables in Supabase:

1. Go to: https://supabase.com/dashboard/project/mqmbjtmibiaukiyiumhl/settings/edge-functions
2. Add these secrets:

```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ADMIN_SECRET=<choose-a-secure-admin-secret>
POSTHOG_API_KEY=<optional-for-analytics>
```

**To get your service role key:**
1. Go to: https://supabase.com/dashboard/project/mqmbjtmibiaukiyiumhl/settings/api
2. Copy the `service_role` key (starts with `eyJ...`)

## 🧪 **Testing Edge Functions**

After deployment, test each function:

### **Health Check**
```bash
curl https://mqmbjtmibiaukiyiumhl.supabase.co/functions/v1/health
```

### **Feature Flags**
```bash
curl https://mqmbjtmibiaukiyiumhl.supabase.co/functions/v1/flags
```

### **Metrics (Admin)**
```bash
curl -H "X-Admin-Key: YOUR_ADMIN_SECRET" \
     https://mqmbjtmibiaukiyiumhl.supabase.co/functions/v1/metrics
```

## 📋 **Available Endpoints**

### **Feature Flags (`/flags`)**
- `GET /flags` - List all feature flags
- `GET /flags?key=flag_name` - Get specific flag
- `POST /flags` - Create/update flag (admin)
- `PUT /flags?key=flag_name` - Toggle flag (admin)
- `DELETE /flags?key=flag_name` - Delete flag (admin)

### **Health (`/health`)**
- `GET /health` - System health status

### **Metrics (`/metrics`)**
- `GET /metrics` - System analytics (admin only)

### **Dev (`/dev`)**
- `GET /dev/*` - Development utilities (disabled in production)

## 🔧 **Configuration**

The edge functions are pre-configured for your sandbox environment:

- **Environment**: `sandbox` 
- **Feature Flags**: Pre-populated with 12 flags
- **Security**: Admin endpoints protected
- **Analytics**: PostHog integration ready

## 🎯 **Next Steps**

After setting up edge functions:

1. ✅ **Database Schema**: Run the SQL script in Supabase SQL Editor
2. ✅ **Edge Functions**: Deploy using this guide  
3. ✅ **Test Integration**: Test Railway backend with new database
4. ✅ **Frontend Testing**: Full-stack application testing

## 🆘 **Troubleshooting**

**If deployment fails:**
1. Ensure you're logged into Supabase CLI
2. Check project linking: `supabase status`
3. Verify environment variables are set
4. Check function logs in Supabase dashboard

**If functions return errors:**
1. Check environment variables are set correctly
2. Verify database schema is created
3. Check function logs for detailed errors

---

**Your edge functions are ready to deploy! 🚀**