# seda.fm Infrastructure Documentation

Welcome to the seda.fm infrastructure documentation! This directory contains comprehensive guides for all infrastructure components, deployment, and operational procedures.

## 🏗️ Infrastructure Overview

seda.fm uses a modern, scalable infrastructure stack designed for high-performance music streaming and real-time chat applications.

### **Architecture Stack**
```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React/Next.js)              │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────────────────┐
│               Load Balancer / CDN                       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              NestJS Backend API                         │
│  • REST APIs        • WebSocket Gateway                 │
│  • Authentication   • Real-time Chat                    │
│  • File Processing  • Music Link Unfurling             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Data Layer                             │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│ │ PostgreSQL  │  │  Supabase   │  │   Redis     │      │
│ │  (Prisma)   │  │ Edge Funcs  │  │  (Cache)    │      │
│ └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## 📁 Infrastructure Components

### 🗄️ [Database](./database/)
PostgreSQL database with Prisma ORM for data persistence.

**Status:** ✅ **Configured**
- Prisma schema with comprehensive models
- Multi-environment support (dev, qa, sandbox, production)
- Automated migrations and seeding
- Connection pooling and optimization

### ⚙️ [Backend Services](./backend/)
NestJS application server with modular architecture.

**Status:** ✅ **Implemented**
- Modular NestJS architecture
- JWT authentication with Supabase
- WebSocket support for real-time features
- Rate limiting and security middleware

### 🚀 [Supabase Integration](./supabase/)
Supabase backend-as-a-service for authentication and edge functions.

**Status:** ✅ **Configured**
- Authentication and user management
- Edge functions for serverless operations
- Real-time subscriptions
- File storage and CDN

### 🚢 [Deployment](./deployment/)
Multi-environment deployment strategies and CI/CD pipelines.

**Status:** 🔧 **In Progress**
- Environment configurations (qa, sandbox, production)
- Automated deployment scripts
- Container orchestration
- Zero-downtime deployments

### 📊 [Monitoring](./monitoring/)
Application monitoring, logging, and observability.

**Status:** 🔧 **In Progress**  
- Health checks and uptime monitoring
- Performance metrics and analytics
- Error tracking and alerting
- Infrastructure monitoring

### 🔒 [Security](./security/)
Security configurations, authentication, and compliance.

**Status:** ✅ **Configured**
- JWT token management
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS and security headers

## 🌍 Environment Architecture

### **Development**
- Local PostgreSQL database
- Local Supabase instance
- Hot-reload enabled
- Debug logging

### **QA Environment**
- Staging database with test data
- Supabase QA project
- Feature branch deployments
- Integration testing

### **Sandbox Environment**  
- Pre-production testing
- Production-like data
- Performance testing
- User acceptance testing

### **Production Environment**
- High-availability setup
- Auto-scaling enabled
- Full monitoring and alerting
- Backup and disaster recovery

## 🚀 Quick Start Guides

### **Local Development Setup**
```bash
# Clone and setup
git clone <repository>
cd seda-auth-service

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
# Edit .env.development with your values

# Start database
npm run docker:db

# Run migrations
npm run prisma:migrate:dev

# Start development server
npm run start:dev
```

### **Supabase Local Development**
```bash
# Start Supabase locally
cd supabase
./start-local.sh

# Deploy edge functions
supabase functions deploy --local
```

### **Database Operations**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## 📋 Environment Variables

### **Required Variables**
```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."

# Security
JWT_SECRET="your-secret-key"
ADMIN_API_KEY="your-admin-key"

# Application
PORT=3001
NODE_ENV=development
```

### **Optional Variables**
```env
# CORS
CORS_ORIGINS="http://localhost:3000,https://app.seda.fm"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Crawler
CRAWLER_USER_AGENT="SedaBot/1.0"
CRAWLER_TIMEOUT_MS=30000

# Logging
LOG_LEVEL=info
```

## 🔧 Development Tools

### **Database Tools**
- **Prisma Studio**: Visual database browser
- **Database Migrations**: Version-controlled schema changes
- **Seeding**: Test data population
- **Backup/Restore**: Data protection

### **API Development**
- **Swagger/OpenAPI**: API documentation
- **Postman Collections**: API testing
- **Jest Testing**: Unit and integration tests
- **Hot Reload**: Development efficiency

### **Monitoring Tools**
- **Health Checks**: Application status monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Issue identification
- **Analytics**: Usage patterns

## 🚨 Troubleshooting

### **Common Issues**

#### **Database Connection Failed**
```bash
# Check database status
npm run docker:db:status

# Restart database
npm run docker:db:restart

# Verify connection
npm run prisma:studio
```

#### **Supabase Connection Issues**
```bash
# Check Supabase status
supabase status

# Restart local Supabase
supabase stop
supabase start

# Check edge functions
supabase functions list
```

#### **Build/Runtime Errors**
```bash
# Clean build
npm run build:clean

# Check dependencies
npm audit

# Verify environment
npm run config:validate
```

## 📊 Performance Benchmarks

### **API Response Times**
- Authentication: < 200ms
- Chat messages: < 100ms
- Music unfurling: < 500ms
- User queries: < 150ms

### **Database Performance**
- Connection pool: 20 connections
- Query timeout: 30 seconds
- Index optimization: Enabled
- Connection pooling: PgBouncer

### **Real-time Features**
- WebSocket latency: < 50ms
- Message delivery: < 100ms
- Typing indicators: < 25ms
- Presence updates: < 75ms

## 🔄 Maintenance Procedures

### **Daily Operations**
- Monitor health checks
- Review error logs
- Check performance metrics
- Verify backup completion

### **Weekly Maintenance**
- Database maintenance
- Security updates
- Performance optimization
- Capacity planning review

### **Monthly Reviews**
- Infrastructure cost analysis
- Security audit
- Performance trends
- Capacity scaling decisions

## 📞 Support & Escalation

### **Development Issues**
1. Check local setup in [Backend Guide](./backend/README.md)
2. Review [Database Documentation](./database/README.md)
3. Consult [Troubleshooting Guide](./backend/troubleshooting.md)

### **Production Issues**
1. Check [Monitoring Dashboard](./monitoring/README.md)
2. Follow [Incident Response Procedures](./monitoring/incident-response.md)
3. Contact infrastructure team via established channels

---

*This infrastructure documentation is maintained alongside code changes and deployment updates.*