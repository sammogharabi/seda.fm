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

## Security Considerations

- Rate limiting configured (100 requests per minute)
- Claim codes expire after 7 days
- Admin endpoints require authentication key
- Puppeteer runs in sandboxed mode for crawling
- Environment variables stored in separate `.env` files
- CORS configured per environment

## Development Workflow

1. Always generate Prisma client after schema changes
2. Run type checking and linting before committing
3. Test in QA environment before sandbox deployment
4. Use the start:prod script for production (includes network checks)
5. Monitor Railway deployment logs for connectivity issues

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