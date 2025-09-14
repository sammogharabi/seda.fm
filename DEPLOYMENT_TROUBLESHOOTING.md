# Railway Deployment Troubleshooting Guide

## Quick Reference: Common Deployment Issues

### 🔥 Critical: Prisma SSL Library Error

**Symptom:**
```
❌ Failed to start server: PrismaClientInitializationError: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`)
Error loading shared library libssl.so.1.1: No such file or directory
```

**Root Cause:** Using Alpine Linux base image (`node:18-alpine`) which lacks OpenSSL 1.1 libraries required by Prisma.

**Solution:**
- ✅ Use `FROM node:18` (Debian-based) in Dockerfile
- ❌ Never use `FROM node:18-alpine` with Prisma

**Files to Check:**
- `Dockerfile`: Ensure it uses `FROM node:18`

### 🔧 Environment Configuration Mismatch

**Symptom:**
- App tries to load `.env.production` but Railway is set to production
- Missing environment variables
- Database connection failures

**Root Cause:** Railway environment doesn't match application configuration.

**Solution:**
1. **Railway Dashboard:** Set environment to `sandbox`
2. **railway.toml:** Set `NODE_ENV = "sandbox"`
3. **Start Command:** Use `NODE_ENV=sandbox node dist/main.js`

**Files to Check:**
- `railway.toml`: Environment settings
- `.env.sandbox`: Sandbox configuration exists and is complete
- Railway Dashboard: Environment matches code expectations

### ⚕️ Healthcheck Interference

**Symptom:**
```
Attempt #1 failed with service unavailable. Continuing to retry...
1/1 replicas never became healthy!
Healthcheck failed!
```

**Root Cause:** Railway's healthcheck system kills container before app fully starts.

**Solution:**
```toml
# In railway.toml
[deploy]
healthcheckPath = ""
healthcheckTimeout = 0
```

**Files to Check:**
- `railway.toml`: Healthcheck disabled
- `railway.json`: Remove if exists (can conflict)

### 🏗️ Build Configuration Issues

**Symptom:**
- Build uses wrong builder
- TypeScript compilation errors
- Missing dependencies

**Solution:**
```toml
# In railway.toml
[build]
builder = "dockerfile"  # Use Dockerfile, not nixpacks

[deploy]
startCommand = "./start.sh"  # Or direct node command
```

**Files to Check:**
- `railway.toml`: Uses dockerfile builder
- `Dockerfile`: Properly structured with all dependencies
- `start.sh`: Executable and properly configured

## Deployment Checklist

Before deploying to Railway:

- [ ] **Dockerfile**: Uses `FROM node:18` (not Alpine)
- [ ] **Environment**: Railway environment matches NODE_ENV
- [ ] **Configuration**: `.env.sandbox` exists and is complete
- [ ] **Railway Config**: `railway.toml` has correct settings
- [ ] **Healthcheck**: Disabled in railway.toml
- [ ] **Build**: Uses dockerfile builder
- [ ] **Dependencies**: All packages in package.json
- [ ] **Start Script**: Executable and properly configured

## Successful Deployment Indicators

✅ **Correct startup logs should show:**
```
Starting Seda Auth Service in sandbox mode...
NODE_ENV: sandbox
PORT: 3001
Using NODE_ENV: sandbox
Starting application...
[Nest] Starting Nest application...
[Nest] AppModule dependencies initialized
[Nest] PrismaModule dependencies initialized
[Nest] All routes mapped
prisma:info Starting a postgresql pool with X connections
[Nest] Nest application successfully started
🎵 Sedā Auth Service running on port 3001 in sandbox mode
📋 Health endpoint available at: http://0.0.0.0:3001/health
```

## Emergency Recovery

If deployment is completely broken:

1. **Revert Dockerfile:** Ensure it uses `FROM node:18`
2. **Check railway.toml:** Use the working configuration from this guide
3. **Verify Environment:** Set Railway environment to `sandbox`
4. **Disable Healthchecks:** Set healthcheckPath = "" and healthcheckTimeout = 0
5. **Use Start Script:** Deploy with `./start.sh` for debugging output

## Contact Points

- **Railway Logs:** Check deployment logs in Railway dashboard
- **Local Testing:** Test with `NODE_ENV=sandbox node dist/main.js`
- **Health Check:** Test locally with `curl http://localhost:3001/health`

---
Last Updated: September 2024
Issue Resolution: Prisma SSL + Railway Deployment Compatibility