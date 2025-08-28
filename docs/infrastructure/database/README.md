# Database Infrastructure - seda.fm

## 🗄️ Overview

seda.fm uses PostgreSQL as the primary database with Prisma ORM for type-safe database access and migrations. The database is designed for high performance with proper indexing and relationship management.

## 🏗️ Database Architecture

### **Technology Stack**
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Migration Tool**: Prisma Migrate
- **Admin Interface**: Prisma Studio
- **Connection Pooling**: Built-in Prisma connection pooling

### **Schema Overview**
```sql
-- Core User System
Users (id, email, supabaseId, role, createdAt)
ArtistProfiles (id, userId, artistName, verified, bio)
VerificationRequests (id, userId, claimCode, status, targetUrl)

-- Chat System  
Rooms (id, name, isPrivate, createdBy)
Messages (id, roomId, userId, text, trackRef, parentId)
Reactions (id, messageId, userId, emoji)
RoomMemberships (id, roomId, userId, isMod)

-- Content & Metadata
TrackRefs (id, provider, providerId, url, title, artist, artwork)
CrawlerCache (id, url, content, statusCode, expiresAt)

-- Administration & Audit
AdminActions (id, adminId, action, targetId, details)
ModerationLogs (id, roomId, moderatorId, action, reason)
```

## 📊 Database Models

### **User Management**
```typescript
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  supabaseId  String   @unique
  role        UserRole @default(USER)
  mutedUntil  DateTime? // For chat moderation
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  artistProfile        ArtistProfile?
  verificationRequests VerificationRequest[]
  messages            Message[]
  reactions           Reaction[]
  roomMemberships     RoomMembership[]

  @@map("users")
}

model ArtistProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  artistName  String
  bio         String?
  verified    Boolean  @default(false)
  verifiedAt  DateTime?
  websiteUrl  String?
  spotifyUrl  String?
  soundcloudUrl String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([verified])
  @@index([artistName])
  @@map("artist_profiles")
}
```

### **Chat System**
```typescript
model Room {
  id          String   @id @default(uuid())
  name        String
  description String?
  isPrivate   Boolean  @default(false)
  createdBy   String
  createdAt   DateTime @default(now())
  
  messages    Message[]
  memberships RoomMembership[]

  @@index([isPrivate])
  @@map("rooms")
}

model Message {
  id        String      @id @default(uuid())
  roomId    String
  userId    String
  type      MessageType @default(TEXT)
  text      String?
  trackRef  Json?       // Flexible track metadata
  parentId  String?     // For reply threads
  createdAt DateTime    @default(now())
  deletedAt DateTime?   // Soft delete for moderation

  // Relations
  room      Room        @relation(fields: [roomId], references: [id])
  user      User        @relation(fields: [userId], references: [id])
  parent    Message?    @relation("MessageReplies", fields: [parentId], references: [id])
  replies   Message[]   @relation("MessageReplies")
  reactions Reaction[]

  @@index([roomId, createdAt]) // Optimized for message history
  @@index([parentId])          // Optimized for replies
  @@map("messages")
}
```

### **Music Metadata**
```typescript
model TrackRef {
  id         String   @id @default(uuid())
  provider   String   // spotify, youtube, apple, etc.
  providerId String   // External platform ID
  url        String   @unique
  title      String
  artist     String
  artwork    String?
  duration   Int?     // Duration in seconds
  createdAt  DateTime @default(now())

  @@unique([provider, providerId])
  @@index([provider])
  @@index([url])
  @@map("track_refs")
}
```

## 🚀 Database Operations

### **Local Development Setup**

#### **Using Docker (Recommended)**
```bash
# Start PostgreSQL container
docker run --name seda-postgres \
  -e POSTGRES_DB=seda_dev \
  -e POSTGRES_USER=seda_user \
  -e POSTGRES_PASSWORD=seda_pass \
  -p 5432:5432 \
  -d postgres:15

# Set environment variable
export DATABASE_URL="postgresql://seda_user:seda_pass@localhost:5432/seda_dev"
```

#### **Using Local PostgreSQL**
```bash
# Create database and user
createdb seda_dev
createuser seda_user
psql -c "GRANT ALL PRIVILEGES ON DATABASE seda_dev TO seda_user;"

# Set environment variable
export DATABASE_URL="postgresql://seda_user@localhost:5432/seda_dev"
```

### **Prisma Operations**

#### **Initial Setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run initial migration
npm run prisma:migrate:dev --name init

# Seed database with test data
npm run prisma:seed
```

#### **Development Workflow**
```bash
# Create new migration
npm run prisma:migrate:dev --name add_new_feature

# Reset database (destructive!)
npm run prisma:migrate:reset

# Open database browser
npm run prisma:studio

# Format schema file
npm run prisma:format
```

#### **Production Migrations**
```bash
# Deploy migrations to production
npm run prisma:migrate:deploy

# Generate client after schema changes
npm run prisma:generate
```

## 🔧 Configuration

### **Environment Variables**
```env
# Development
DATABASE_URL="postgresql://seda_user:seda_pass@localhost:5432/seda_dev"

# QA Environment  
DATABASE_URL="postgresql://user:pass@qa-db.seda.fm:5432/seda_qa"

# Sandbox Environment
DATABASE_URL="postgresql://user:pass@sandbox-db.seda.fm:5432/seda_sandbox"

# Production Environment
DATABASE_URL="postgresql://user:pass@prod-db.seda.fm:5432/seda_prod"
```

### **Prisma Configuration**
```typescript
// src/config/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

### **Connection Pool Settings**
```typescript
// Enhanced connection configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  errorFormat: 'minimal',
});
```

## 📈 Performance Optimization

### **Indexing Strategy**
```sql
-- User lookup optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_supabase_id ON users(supabase_id);

-- Message retrieval optimization
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_parent ON messages(parent_id) WHERE parent_id IS NOT NULL;

-- Artist search optimization
CREATE INDEX idx_artist_profiles_name ON artist_profiles(artist_name);
CREATE INDEX idx_artist_profiles_verified ON artist_profiles(verified) WHERE verified = true;

-- Chat performance
CREATE INDEX idx_reactions_message ON reactions(message_id);
CREATE INDEX idx_room_memberships_room ON room_memberships(room_id);
CREATE INDEX idx_room_memberships_user ON room_memberships(user_id);

-- Music metadata
CREATE INDEX idx_track_refs_provider ON track_refs(provider);
CREATE INDEX idx_track_refs_url ON track_refs(url);
```

### **Query Optimization Examples**
```typescript
// Efficient message loading with pagination
async getMessages(roomId: string, cursor?: string, limit = 50) {
  return await this.prisma.message.findMany({
    where: { 
      roomId,
      deletedAt: null,
    },
    include: {
      user: {
        select: { id: true, email: true, artistProfile: true }
      },
      reactions: {
        include: { user: { select: { id: true, email: true } } }
      },
      replies: {
        take: 3, // Limit nested replies
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });
}

// Efficient user search with fuzzy matching
async searchArtists(query: string) {
  return await this.prisma.artistProfile.findMany({
    where: {
      artistName: {
        contains: query,
        mode: 'insensitive'
      },
      verified: true
    },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { artistName: 'asc' },
    take: 20
  });
}
```

## 🔄 Backup and Recovery

### **Automated Backups**
```bash
#!/bin/bash
# backup-database.sh
DB_NAME="seda_prod"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/seda_backup_$TIMESTAMP.sql"

# Compress backup
gzip "$BACKUP_DIR/seda_backup_$TIMESTAMP.sql"

# Upload to cloud storage (example: AWS S3)
aws s3 cp "$BACKUP_DIR/seda_backup_$TIMESTAMP.sql.gz" \
  s3://seda-backups/database/

# Cleanup old local backups (keep last 7 days)
find $BACKUP_DIR -name "seda_backup_*.sql.gz" -mtime +7 -delete
```

### **Database Restoration**
```bash
# Restore from backup
gunzip seda_backup_20240824_120000.sql.gz
psql $DATABASE_URL < seda_backup_20240824_120000.sql

# Restore specific tables only
pg_restore --table=messages --table=users seda_backup.dump
```

## 🔍 Monitoring and Maintenance

### **Health Checks**
```typescript
// Database health check endpoint
@Get('/health/database')
async checkDatabaseHealth() {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

### **Performance Monitoring**
```typescript
// Query performance middleware
export class DatabaseMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        // Log slow queries (>1000ms)
        if (duration > 1000) {
          console.warn(`Slow database query: ${duration}ms`);
        }
      })
    );
  }
}
```

### **Database Maintenance Tasks**
```sql
-- Weekly maintenance queries
-- Update table statistics
ANALYZE;

-- Reindex for performance
REINDEX DATABASE seda_prod;

-- Clean up old data
DELETE FROM crawler_cache WHERE expires_at < NOW() - INTERVAL '7 days';
DELETE FROM admin_actions WHERE created_at < NOW() - INTERVAL '90 days';

-- Check database size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Connection Pool Exhaustion**
```bash
# Symptoms
Error: Can't reach database server at `localhost:5432`

# Solutions
1. Check connection pool configuration
2. Monitor active connections
3. Implement connection pooling with PgBouncer
4. Review slow queries blocking connections
```

#### **Migration Failures**
```bash
# Reset migration state (development only)
npm run prisma:migrate:reset

# Manually fix migration conflicts
npm run prisma:migrate:resolve --applied 20240824120000_migration_name

# Deploy specific migration
npm run prisma:migrate:deploy --schema=./prisma/schema.prisma
```

#### **Performance Issues**
```sql
-- Identify slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT 
  t.tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_tables t
LEFT JOIN pg_stat_user_indexes i ON t.tablename = i.relname
WHERE t.schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 📋 Best Practices

### **Schema Design**
1. **Use UUIDs** for primary keys to avoid conflicts
2. **Add indexes** for frequently queried columns
3. **Implement soft deletes** for important data
4. **Use enums** for fixed value sets
5. **Add timestamps** for audit trails

### **Query Optimization**
1. **Select only needed fields** to reduce bandwidth
2. **Use pagination** for large result sets
3. **Implement proper joins** instead of N+1 queries
4. **Cache frequently accessed data**
5. **Monitor query performance** regularly

### **Migration Management**
1. **Test migrations** in staging before production
2. **Make additive changes** to avoid downtime
3. **Backup database** before major migrations
4. **Use descriptive migration names**
5. **Document schema changes**