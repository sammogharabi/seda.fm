# Monitoring Infrastructure - seda.fm

## 📊 Overview

seda.fm implements comprehensive monitoring, observability, and alerting to ensure high availability, performance, and reliability. The monitoring stack provides real-time insights into application health, performance metrics, and user behavior.

## 🏗️ Monitoring Architecture

### **Observability Stack**
```
┌─────────────────────────────────────────────────────┐
│                  Alerting Layer                     │
│  PagerDuty / Slack / Email / SMS Notifications     │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               Visualization                         │
│  Grafana Dashboards / Custom Analytics Dashboard   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              Metrics Storage                        │
│     Prometheus / InfluxDB / Application DB          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│             Data Collection                         │
│  App Metrics / System Metrics / Custom Analytics   │
└─────────────────────────────────────────────────────┘
```

### **Monitoring Components**
- **Application Monitoring**: API performance, errors, user activity
- **Infrastructure Monitoring**: Server health, resource usage, network
- **Database Monitoring**: Query performance, connection pools, locks
- **Real-time Monitoring**: WebSocket connections, chat activity
- **Business Metrics**: User engagement, music sharing, feature usage
- **Security Monitoring**: Authentication failures, suspicious activity

## 🔍 Health Monitoring

### **Health Check Implementation**
```typescript
// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SupabaseService } from '../../config/supabase.service';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckStatus;
    supabase: HealthCheckStatus;
    redis: HealthCheckStatus;
    external_apis: HealthCheckStatus;
  };
}

interface HealthCheckStatus {
  status: 'up' | 'down' | 'degraded';
  response_time?: number;
  error?: string;
  details?: any;
}

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  @Get()
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks = {
      database: await this.checkDatabase(),
      supabase: await this.checkSupabase(),
      redis: await this.checkRedis(),
      external_apis: await this.checkExternalAPIs(),
    };

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'down');
    const hasDegradation = Object.values(checks).some(check => check.status === 'degraded');
    
    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (hasFailures) {
      status = 'unhealthy';
    } else if (hasDegradation) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };
  }

  private async checkDatabase(): Promise<HealthCheckStatus> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        response_time: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        response_time: Date.now() - start,
        error: error.message,
      };
    }
  }

  private async checkSupabase(): Promise<HealthCheckStatus> {
    const start = Date.now();
    try {
      const { error } = await this.supabase.auth.getSession();
      return {
        status: error ? 'degraded' : 'up',
        response_time: Date.now() - start,
        error: error?.message,
      };
    } catch (error) {
      return {
        status: 'down',
        response_time: Date.now() - start,
        error: error.message,
      };
    }
  }

  private async checkRedis(): Promise<HealthCheckStatus> {
    // Implementation depends on Redis client
    return { status: 'up', response_time: 10 };
  }

  private async checkExternalAPIs(): Promise<HealthCheckStatus> {
    // Check critical external services (Spotify API, etc.)
    return { status: 'up', response_time: 150 };
  }
}
```

### **Deep Health Checks**
```typescript
// Extended health checks for specific components
@Get('deep')
async deepHealthCheck(): Promise<any> {
  const checks = {
    database: await this.deepDatabaseCheck(),
    websockets: await this.checkWebSocketHealth(),
    file_system: await this.checkFileSystem(),
    memory: await this.checkMemoryUsage(),
    chat_system: await this.checkChatSystem(),
  };

  return {
    timestamp: new Date().toISOString(),
    deep_checks: checks,
  };
}

private async deepDatabaseCheck() {
  const checks = {
    connection_pool: await this.checkConnectionPool(),
    query_performance: await this.checkQueryPerformance(),
    table_sizes: await this.getTableSizes(),
    active_connections: await this.getActiveConnections(),
  };
  
  return checks;
}

private async checkQueryPerformance() {
  const start = Date.now();
  
  // Test common query patterns
  const tests = [
    { name: 'user_lookup', query: () => this.prisma.user.findFirst() },
    { name: 'message_history', query: () => this.prisma.message.findMany({ take: 10 }) },
    { name: 'room_members', query: () => this.prisma.roomMembership.findMany({ take: 10 }) },
  ];

  const results = await Promise.all(
    tests.map(async (test) => {
      const testStart = Date.now();
      try {
        await test.query();
        return {
          test: test.name,
          duration: Date.now() - testStart,
          status: 'success',
        };
      } catch (error) {
        return {
          test: test.name,
          duration: Date.now() - testStart,
          status: 'failed',
          error: error.message,
        };
      }
    })
  );

  return {
    total_duration: Date.now() - start,
    tests: results,
  };
}
```

## 📈 Performance Metrics

### **Custom Metrics Collection**
```typescript
// src/common/interceptors/metrics.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface MetricsData {
  timestamp: number;
  method: string;
  endpoint: string;
  statusCode: number;
  duration: number;
  userId?: string;
  error?: string;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private metrics: MetricsData[] = [];
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    const metricData: Partial<MetricsData> = {
      timestamp: startTime,
      method: request.method,
      endpoint: request.route?.path || request.url,
      userId: request.user?.id,
    };

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;
        
        this.recordMetric({
          ...metricData,
          statusCode: response.statusCode,
          duration,
        } as MetricsData);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        this.recordMetric({
          ...metricData,
          statusCode: error.status || 500,
          duration,
          error: error.message,
        } as MetricsData);
        
        throw error;
      })
    );
  }

  private recordMetric(metric: MetricsData) {
    this.metrics.push(metric);
    
    // Keep only last 10000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
    
    // Send to external monitoring service
    this.sendToMonitoring(metric);
  }

  private async sendToMonitoring(metric: MetricsData) {
    // Send to Prometheus, DataDog, or custom analytics service
    try {
      // Example: Send to custom analytics endpoint
      await fetch('/internal/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      // Don't throw - monitoring shouldn't break the app
      console.warn('Failed to send metric:', error);
    }
  }

  getMetrics(): MetricsData[] {
    return [...this.metrics];
  }

  getMetricsSummary() {
    const now = Date.now();
    const last5Minutes = this.metrics.filter(m => now - m.timestamp < 5 * 60 * 1000);
    
    return {
      total_requests: last5Minutes.length,
      avg_response_time: this.average(last5Minutes.map(m => m.duration)),
      error_rate: last5Minutes.filter(m => m.statusCode >= 400).length / last5Minutes.length,
      endpoints: this.groupBy(last5Minutes, 'endpoint'),
      status_codes: this.groupBy(last5Minutes, 'statusCode'),
    };
  }

  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b) / numbers.length : 0;
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}
```

### **Real-time Metrics Dashboard**
```typescript
// src/modules/metrics/metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  constructor(
    private metricsInterceptor: MetricsInterceptor,
    private prisma: PrismaService,
  ) {}

  @Get()
  async getMetrics() {
    const [
      systemMetrics,
      databaseMetrics,
      chatMetrics,
      userMetrics,
    ] = await Promise.all([
      this.getSystemMetrics(),
      this.getDatabaseMetrics(),
      this.getChatMetrics(),
      this.getUserMetrics(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      database: databaseMetrics,
      chat: chatMetrics,
      users: userMetrics,
    };
  }

  private async getSystemMetrics() {
    const usage = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memory: {
        rss: usage.rss,
        heap_used: usage.heapUsed,
        heap_total: usage.heapTotal,
        external: usage.external,
      },
      cpu: process.cpuUsage(),
      requests: this.metricsInterceptor.getMetricsSummary(),
    };
  }

  private async getDatabaseMetrics() {
    const [
      userCount,
      messageCount,
      activeRooms,
      recentMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.message.count(),
      this.prisma.room.count(),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      users: userCount,
      messages: messageCount,
      rooms: activeRooms,
      messages_24h: recentMessages,
    };
  }

  private async getChatMetrics() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      activeRooms,
      messagesLast24h,
      reactionsLast24h,
      tracksShared24h,
    ] = await Promise.all([
      this.prisma.room.count({
        where: {
          messages: {
            some: {
              createdAt: { gte: last24Hours },
            },
          },
        },
      }),
      this.prisma.message.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prisma.reaction.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prisma.message.count({
        where: {
          createdAt: { gte: last24Hours },
          trackRef: { not: null },
        },
      }),
    ]);

    return {
      active_rooms_24h: activeRooms,
      messages_24h: messagesLast24h,
      reactions_24h: reactionsLast24h,
      tracks_shared_24h: tracksShared24h,
    };
  }

  private async getUserMetrics() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers24h,
      activeUsers7d,
      verifiedArtists,
      newUsers24h,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          messages: {
            some: {
              createdAt: { gte: last24Hours },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          messages: {
            some: {
              createdAt: { gte: last7Days },
            },
          },
        },
      }),
      this.prisma.artistProfile.count({
        where: { verified: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: last24Hours } },
      }),
    ]);

    return {
      total: totalUsers,
      active_24h: activeUsers24h,
      active_7d: activeUsers7d,
      verified_artists: verifiedArtists,
      new_24h: newUsers24h,
    };
  }
}
```

## 🚨 Alerting System

### **Alert Configuration**
```typescript
// src/modules/monitoring/alert.service.ts
import { Injectable, Logger } from '@nestjs/common';

export interface AlertCondition {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface Alert {
  id: string;
  condition: AlertCondition;
  value: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private alerts: Map<string, Alert> = new Map();
  
  private readonly conditions: AlertCondition[] = [
    {
      id: 'high_error_rate',
      name: 'High Error Rate',
      metric: 'error_rate',
      operator: 'gt',
      threshold: 0.05, // 5% error rate
      duration: 300, // 5 minutes
      severity: 'high',
      enabled: true,
    },
    {
      id: 'slow_response_time',
      name: 'Slow Response Time',
      metric: 'avg_response_time',
      operator: 'gt',
      threshold: 2000, // 2 seconds
      duration: 300,
      severity: 'medium',
      enabled: true,
    },
    {
      id: 'database_connection_failure',
      name: 'Database Connection Failure',
      metric: 'database_health',
      operator: 'eq',
      threshold: 0, // 0 = down
      duration: 60, // 1 minute
      severity: 'critical',
      enabled: true,
    },
    {
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      metric: 'memory_usage_percent',
      operator: 'gt',
      threshold: 85, // 85% memory usage
      duration: 600, // 10 minutes
      severity: 'medium',
      enabled: true,
    },
    {
      id: 'websocket_connection_drop',
      name: 'WebSocket Connection Drop',
      metric: 'websocket_connections',
      operator: 'lt',
      threshold: 10, // Less than 10 connections (if expected more)
      duration: 180,
      severity: 'low',
      enabled: true,
    },
  ];

  async checkAlertConditions(metrics: any) {
    for (const condition of this.conditions) {
      if (!condition.enabled) continue;

      const metricValue = this.extractMetricValue(metrics, condition.metric);
      const isTriggered = this.evaluateCondition(metricValue, condition);

      if (isTriggered) {
        await this.triggerAlert(condition, metricValue);
      } else {
        await this.resolveAlert(condition.id);
      }
    }
  }

  private extractMetricValue(metrics: any, metricPath: string): number {
    // Navigate nested object path (e.g., "system.memory.heap_used")
    const path = metricPath.split('.');
    let value = metrics;
    
    for (const key of path) {
      value = value?.[key];
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateCondition(value: number, condition: AlertCondition): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      default: return false;
    }
  }

  private async triggerAlert(condition: AlertCondition, value: number) {
    const existingAlert = this.alerts.get(condition.id);
    
    if (!existingAlert || existingAlert.resolved) {
      const alert: Alert = {
        id: condition.id,
        condition,
        value,
        timestamp: new Date(),
        resolved: false,
      };
      
      this.alerts.set(condition.id, alert);
      await this.sendAlertNotification(alert);
      
      this.logger.error(`Alert triggered: ${condition.name} (value: ${value}, threshold: ${condition.threshold})`);
    }
  }

  private async resolveAlert(conditionId: string) {
    const alert = this.alerts.get(conditionId);
    
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      
      await this.sendResolvedNotification(alert);
      
      this.logger.log(`Alert resolved: ${alert.condition.name}`);
    }
  }

  private async sendAlertNotification(alert: Alert) {
    const notifications = [
      this.sendSlackNotification(alert),
      this.sendEmailNotification(alert),
    ];

    if (alert.condition.severity === 'critical') {
      notifications.push(this.sendPagerDutyNotification(alert));
    }

    await Promise.allSettled(notifications);
  }

  private async sendSlackNotification(alert: Alert) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) return;

    const color = {
      low: 'good',
      medium: 'warning',
      high: 'danger',
      critical: 'danger',
    }[alert.condition.severity];

    const payload = {
      text: `🚨 Alert: ${alert.condition.name}`,
      attachments: [{
        color,
        fields: [
          { title: 'Severity', value: alert.condition.severity.toUpperCase(), short: true },
          { title: 'Current Value', value: alert.value.toString(), short: true },
          { title: 'Threshold', value: alert.condition.threshold.toString(), short: true },
          { title: 'Time', value: alert.timestamp.toISOString(), short: true },
        ],
      }],
    };

    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error('Failed to send Slack notification', error);
    }
  }

  private async sendEmailNotification(alert: Alert) {
    // Implementation would depend on your email service
    // Example: SendGrid, AWS SES, etc.
    this.logger.log(`Would send email notification for: ${alert.condition.name}`);
  }

  private async sendPagerDutyNotification(alert: Alert) {
    // PagerDuty integration for critical alerts
    this.logger.log(`Would send PagerDuty notification for: ${alert.condition.name}`);
  }

  private async sendResolvedNotification(alert: Alert) {
    // Send resolution notifications
    this.logger.log(`Alert resolved: ${alert.condition.name}`);
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }
}
```

## 📊 Analytics and Business Metrics

### **Custom Analytics Service**
```typescript
// src/modules/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(event: AnalyticsEvent) {
    // Store in database for analysis
    await this.storeEvent(event);
    
    // Send to external analytics service (PostHog, Mixpanel, etc.)
    await this.sendToExternalService(event);
  }

  async getDashboardMetrics() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      userGrowth,
      chatActivity,
      musicSharing,
      artistVerification,
    ] = await Promise.all([
      this.getUserGrowthMetrics(last30Days),
      this.getChatActivityMetrics(last30Days),
      this.getMusicSharingMetrics(last30Days),
      this.getArtistVerificationMetrics(last30Days),
    ]);

    return {
      user_growth: userGrowth,
      chat_activity: chatActivity,
      music_sharing: musicSharing,
      artist_verification: artistVerification,
      timestamp: new Date().toISOString(),
    };
  }

  private async getUserGrowthMetrics(since: Date) {
    // Daily user registrations
    const dailySignups = await this.prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as signups
      FROM users 
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Monthly active users
    const mau = await this.prisma.user.count({
      where: {
        messages: {
          some: {
            createdAt: { gte: since },
          },
        },
      },
    });

    // Retention metrics
    const cohortAnalysis = await this.getCohortRetention();

    return {
      daily_signups: dailySignups,
      monthly_active_users: mau,
      cohort_retention: cohortAnalysis,
    };
  }

  private async getChatActivityMetrics(since: Date) {
    const [
      dailyMessages,
      topRooms,
      averageSessionLength,
      responseRates,
    ] = await Promise.all([
      this.getDailyMessageCounts(since),
      this.getTopActiveRooms(since),
      this.getAverageSessionLength(since),
      this.getResponseRates(since),
    ]);

    return {
      daily_messages: dailyMessages,
      top_rooms: topRooms,
      avg_session_length: averageSessionLength,
      response_rates: responseRates,
    };
  }

  private async getMusicSharingMetrics(since: Date) {
    // Track sharing by platform
    const sharingByPlatform = await this.prisma.$queryRaw`
      SELECT 
        JSON_EXTRACT(track_ref, '$.provider') as platform,
        COUNT(*) as shares,
        COUNT(DISTINCT user_id) as unique_sharers
      FROM messages 
      WHERE created_at >= ${since}
        AND track_ref IS NOT NULL
      GROUP BY JSON_EXTRACT(track_ref, '$.provider')
      ORDER BY shares DESC
    `;

    // Popular tracks
    const popularTracks = await this.prisma.$queryRaw`
      SELECT 
        JSON_EXTRACT(track_ref, '$.title') as title,
        JSON_EXTRACT(track_ref, '$.artist') as artist,
        JSON_EXTRACT(track_ref, '$.provider') as platform,
        COUNT(*) as share_count
      FROM messages 
      WHERE created_at >= ${since}
        AND track_ref IS NOT NULL
      GROUP BY 
        JSON_EXTRACT(track_ref, '$.title'),
        JSON_EXTRACT(track_ref, '$.artist'),
        JSON_EXTRACT(track_ref, '$.provider')
      ORDER BY share_count DESC
      LIMIT 20
    `;

    return {
      sharing_by_platform: sharingByPlatform,
      popular_tracks: popularTracks,
    };
  }

  // Additional helper methods...
  private async storeEvent(event: AnalyticsEvent) {
    // Store in your analytics table or external service
  }

  private async sendToExternalService(event: AnalyticsEvent) {
    // Send to PostHog, Mixpanel, Google Analytics, etc.
  }
}
```

## 🔍 Log Management

### **Structured Logging**
```typescript
// src/common/logger/winston.logger.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.colorize({ all: true })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    // In production, add external log aggregation
    if (process.env.NODE_ENV === 'production') {
      // Add DataDog, ELK Stack, or other log aggregation services
    }
  }

  error(message: string, error?: Error, context?: any) {
    this.logger.error(message, { error, context, timestamp: new Date().toISOString() });
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, { context, timestamp: new Date().toISOString() });
  }

  info(message: string, context?: any) {
    this.logger.info(message, { context, timestamp: new Date().toISOString() });
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, { context, timestamp: new Date().toISOString() });
  }
}
```

## 🔄 Monitoring Automation

### **Automated Monitoring Tasks**
```bash
#!/bin/bash
# scripts/monitoring-checks.sh

# Run comprehensive monitoring checks
echo "🔍 Running automated monitoring checks..."

# Health check
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.seda.fm/api/v1/health)
if [ "$HEALTH_STATUS" != "200" ]; then
  echo "❌ Health check failed: $HEALTH_STATUS"
  exit 1
fi

# Database performance check
echo "📊 Checking database performance..."
DB_SLOW_QUERIES=$(psql $DATABASE_URL -t -c "
  SELECT COUNT(*) 
  FROM pg_stat_statements 
  WHERE mean_exec_time > 1000;
")

if [ "$DB_SLOW_QUERIES" -gt 10 ]; then
  echo "⚠️  Warning: $DB_SLOW_QUERIES slow queries detected"
fi

# Memory usage check
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -gt 85 ]; then
  echo "⚠️  High memory usage: ${MEMORY_USAGE}%"
fi

# Disk space check
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
  echo "⚠️  High disk usage: ${DISK_USAGE}%"
fi

echo "✅ Monitoring checks completed"
```

This comprehensive monitoring infrastructure ensures the seda.fm platform maintains high availability, performance, and user experience through proactive monitoring, alerting, and analytics.