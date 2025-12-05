# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build & Development
- `npm run build` - Build the application (runs Prisma generation and Nest build)
- `npm run start:dev` - Start development server with hot reload
- `npm run start:qa` - Start QA environment
- `npm run start:sandbox` - Start sandbox environment  
- `npm run start:prod` - Start production with network connectivity checks

### Code Quality
- `npm run lint` - Run ESLint and fix issues automatically
- `npm run lint:check` - Check linting without fixing
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run all unit tests
- `npm run test:unit` - Unit tests only (excludes integration and e2e)
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - End-to-end tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Generate test coverage report
- `npm run test:all` - Run all test suites sequentially
- `npm run test:ci` - CI-specific test run with coverage

### Database Management
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate:dev` - Run migrations in development
- `npm run prisma:migrate:qa` - Deploy migrations to QA
- `npm run prisma:migrate:sandbox` - Deploy migrations to sandbox
- `npm run prisma:migrate:prod` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio for database visualization

## Architecture Overview

### Tech Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: Supabase Auth (JWT-based)
- **Web Scraping**: Puppeteer for verification crawling
- **Real-time**: Socket.IO for WebSocket support
- **API Documentation**: Swagger (available in non-production at `/api/v1/docs`)
- **Deployment**: Railway with multi-environment support

### Module Structure
The application follows NestJS modular architecture:

- **src/app.module.ts** - Root module that imports all feature modules
- **src/config/** - Configuration modules (Prisma, Supabase, environment)
- **src/common/** - Shared utilities, decorators, guards, and interceptors
- **src/modules/** - Feature modules:
  - `verification/` - Artist verification system with claim codes
  - `admin/` - Admin panel and management endpoints
  - `user/` - User management and profiles
  - `chat/` - Real-time chat functionality
  - `crawler/` - Web crawling service for verification
  - `health/` - Health check endpoints

### Key Design Patterns

1. **Multi-Environment Configuration**: Separate `.env` files for qa, sandbox, and production environments. Configuration loaded via `@nestjs/config` based on `NODE_ENV`.

2. **Authentication Strategy**: 
   - User auth via Supabase JWT tokens (Bearer auth)
   - Admin endpoints protected with `X-Admin-Key` header
   - Role-based access control (USER, ARTIST, ADMIN, SUPER_ADMIN)

3. **Artist Verification Flow**:
   - Artists request verification and receive a unique claim code
   - Code must be placed on public platform (Bandcamp, website, etc.)
   - System crawls submitted URL to verify code presence
   - Automatic approval if found, otherwise admin review

4. **Database Schema**: 
   - User-centric model with Supabase integration
   - Verification requests with status workflow
   - Chat system with channels, messages, and moderation

5. **Error Handling**: Centralized error handling with structured responses

## Supabase Edge Functions

The project includes Supabase Edge Functions in the `supabase/` directory:
- `/health` - Health monitoring endpoints
- `/flags` - Feature flag management
- `/metrics` - System analytics (admin-protected)
- `/dev/*` - Development utilities (disabled in production)

Deploy edge functions using: `cd supabase && ./deploy.sh [environment]`

## Environment-Specific Endpoints

- **Production**: ifrbbfqabeeyxrrliank.supabase.co
- **Sandbox**: ubfgyrgyxqccybqpcgxq.supabase.co  
- **QA/Local**: localhost:54321 (Supabase CLI)

## Security Implementation (PRODUCTION READY ✅)

**🔒 COMPREHENSIVE SECURITY AUDIT COMPLETED - September 15, 2025**

The platform underwent a complete security audit and hardening process, transforming from **CRITICAL RISK** to **PRODUCTION READY** status. See `SECURITY_AUDIT_REPORT.md` for full details.

### Critical Security Features Implemented

- **✅ REMOVED**: All authentication bypass mechanisms (development mode vulnerabilities eliminated)
- **✅ IMPLEMENTED**: Timing-safe admin authentication with cryptographically secure keys
- **✅ REPLACED**: Mock authentication with real Supabase JWT validation
- **✅ SECURED**: Web scraping with domain whitelist, HTTPS-only, and internal network blocking
- **✅ ADDED**: Comprehensive input validation, sanitization, and XSS protection
- **✅ DEPLOYED**: Security headers (Helmet), CORS hardening, and global exception handling

### Current Security Status

- **Authentication**: Real Supabase JWT with email verification requirement
- **Admin Access**: 64-character cryptographic API keys with timing-safe comparison
- **Input Validation**: Comprehensive DTO validation with length limits and format validation
- **Web Scraping**: Domain-restricted, HTTPS-only with enhanced Puppeteer sandboxing
- **Error Handling**: Production-ready error responses that don't leak sensitive information
- **Rate Limiting**: 100 requests/minute with throttling protection
- **Security Headers**: Full CSP, HSTS, X-Frame-Options, and other protective headers
- **Dependency Security**: High-severity vulnerabilities resolved

### Security Testing Results ✅

All penetration tests passed:
- SQL Injection attempts: BLOCKED
- XSS attacks: BLOCKED
- Path traversal: BLOCKED
- Authentication bypass: BLOCKED
- SSRF attacks: BLOCKED
- Admin key timing attacks: BLOCKED

### Security Maintenance

- **Configuration**: Environment-specific `.env` files with secure secrets
- **Monitoring**: Comprehensive logging for admin access and security events
- **Updates**: Regular dependency updates and vulnerability scanning
- **Documentation**: Complete security implementation documentation available

**⚠️ IMPORTANT**: Never revert security changes. See `SECURITY_AUDIT_REPORT.md` for detailed vulnerability descriptions and fixes.

## Development Workflow

1. Always generate Prisma client after schema changes
2. Run type checking and linting before committing
3. Test in QA environment before sandbox deployment
4. Use the start:prod script for production (includes network checks)
5. Monitor Railway deployment logs for connectivity issues

## Railway Deployment Guide

### Docker Configuration

**CRITICAL**: Use Debian-based Node.js image (`node:18`) NOT Alpine (`node:18-alpine`) for Prisma compatibility.

Alpine Linux causes Prisma deployment failures due to missing `libssl.so.1.1` library. The error manifests as:
```
PrismaClientInitializationError: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`)
Error loading shared library libssl.so.1.1: No such file or directory
```

**Solution**: Use `FROM node:18` (Debian-based) which includes proper OpenSSL libraries.

### Environment Configuration

Ensure Railway environment settings match your configuration:

1. **Railway Environment**: Set to `sandbox` (not production)
2. **Environment Files**: Application will load `.env.sandbox` when `NODE_ENV=sandbox`
3. **Start Command**: Use `NODE_ENV=sandbox node dist/main.js` or let Railway auto-detect via railway.toml

### Railway Configuration Files

The project uses `railway.toml` for deployment configuration:
- **Builder**: Uses `dockerfile` (not nixpacks) for consistent builds
- **Environment**: Set `NODE_ENV = "sandbox"` for sandbox deployments
- **Healthcheck**: Disabled (`healthcheckPath = ""`, `healthcheckTimeout = 0`) to prevent premature container termination

### Deployment Troubleshooting

**Common Issues & Solutions:**

1. **Prisma SSL Error** → Use Debian-based Node.js image (not Alpine)
2. **Environment Mismatch** → Ensure Railway environment matches NODE_ENV setting
3. **Healthcheck Failures** → Disable Railway healthchecks if app takes time to start
4. **TypeScript Errors** → Ensure Express types are imported for health endpoints
5. **Port Binding** → Railway sets PORT dynamically; use `process.env.PORT` with fallback
6. **Git Push Large File Errors** → See `../GIT_DEPLOYMENT_ISSUES.md` for comprehensive resolution guide

**Successful Deployment Logs Should Show:**
```
Starting Seda Auth Service in sandbox mode...
NODE_ENV: sandbox
PORT: 3001
[Nest] NestApplication Nest application successfully started
prisma:info Starting a postgresql pool with X connections
🎵 Sedā Auth Service running on port 3001 in sandbox mode
📋 Health endpoint available at: http://0.0.0.0:3001/health
```

## Code Style Guidelines

When writing code, ALWAYS add tagged comments for ANY assumption:

```typescript
// #COMPLETION_DRIVE: [what you're assuming]
// #SUGGEST_VERIFY: [how to fix/validate it]
```

Example:
```typescript
// #COMPLETION_DRIVE: Assuming user has artist role based on verification status
// #SUGGEST_VERIFY: Check user.role === UserRole.ARTIST or user.artistProfile exists
if (verificationStatus === 'APPROVED') {
  await updateUserRole(userId, UserRole.ARTIST);
}
```