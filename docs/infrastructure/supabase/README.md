# Supabase Infrastructure - seda.fm

## 🚀 Overview

seda.fm uses Supabase as a Backend-as-a-Service (BaaS) platform, providing authentication, real-time subscriptions, edge functions, and file storage. Supabase serves as the primary authentication provider and hosts serverless functions for various platform operations.

## 🏗️ Supabase Architecture

### **Services Used**
- **Authentication**: User registration, login, JWT tokens
- **Edge Functions**: Serverless TypeScript functions
- **Real-time**: Database change subscriptions
- **Storage**: File uploads and CDN
- **Database**: PostgreSQL with REST API (supplementary to main Prisma DB)

### **Edge Functions Structure**
```
supabase/
├── config.toml              # Supabase configuration
├── deploy.sh               # Deployment script
├── start-local.sh          # Local development script
├── functions/              # Edge functions
│   ├── _shared/           # Shared utilities
│   │   ├── supabase.ts    # Supabase client
│   │   ├── types.ts       # TypeScript types
│   │   └── utils.ts       # Helper functions
│   ├── flags/             # Feature flags management
│   │   └── index.ts
│   ├── metrics/           # Analytics and metrics
│   │   └── index.ts
│   ├── health/            # Health monitoring
│   │   └── index.ts
│   └── dev/               # Development utilities
│       └── index.ts
├── migrations/            # Database migrations
└── package.json          # Edge functions dependencies
```

## 🔧 Configuration

### **Supabase Configuration**
```toml
# supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323
api_url = "http://127.0.0.1:54321"

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

# Edge Functions configuration
[functions."flags"]
verify_jwt = false

[functions."metrics"]
verify_jwt = false

[functions."health"]
verify_jwt = false
```

### **Environment Variables**
```bash
# Development
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="your-local-anon-key"
SUPABASE_SERVICE_KEY="your-local-service-key"

# Production
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-prod-anon-key"
SUPABASE_SERVICE_KEY="your-prod-service-key"
```

## 🔑 Authentication Integration

### **Supabase Service Implementation**
```typescript
// src/config/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url'),
      this.configService.get<string>('supabase.serviceKey'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  get auth() {
    return this.supabase.auth;
  }

  get from() {
    return this.supabase.from.bind(this.supabase);
  }

  get storage() {
    return this.supabase.storage;
  }

  get functions() {
    return this.supabase.functions;
  }

  // Get user from JWT token
  async getUser(jwt: string): Promise<{ data: { user: User } | null; error: any }> {
    return await this.supabase.auth.getUser(jwt);
  }

  // Verify and refresh session
  async verifySession(accessToken: string, refreshToken: string) {
    return await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}
```

### **Authentication Guard Integration**
```typescript
// Enhanced auth guard with Supabase
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // Verify token with Supabase
      const { data, error } = await this.supabaseService.getUser(token);
      
      if (error || !data?.user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Add user to request context
      request.user = data.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## ⚡ Edge Functions

### **Shared Utilities**
```typescript
// supabase/functions/_shared/utils.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function getEnvironment(): string {
  return Deno.env.get('ENVIRONMENT') || 'qa';
}

export function createResponse<T>(
  data: T,
  status: number = 200,
): Response {
  const response: ApiResponse<T> = {
    success: status < 400,
    data,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

export function createErrorResponse(
  error: string,
  status: number = 500,
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  }
  return null;
}

export async function validateAdminAccess(req: Request): Promise<boolean> {
  const adminSecret = req.headers.get('x-admin-secret');
  const expectedSecret = Deno.env.get('ADMIN_SECRET');
  
  return adminSecret === expectedSecret && !!expectedSecret;
}
```

### **Health Check Function**
```typescript
// supabase/functions/health/index.ts
import { createResponse, createErrorResponse, handleCors } from '../_shared/utils.ts';
import { createSupabaseServiceClient } from '../_shared/supabase.ts';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  checks: {
    database: boolean;
    supabase_config: boolean;
    posthog_config: boolean;
    admin_config: boolean;
  };
  ready: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const environment = Deno.env.get('ENVIRONMENT') || 'qa';
    const startTime = Date.now();

    // Initialize checks
    const checks = {
      database: false,
      supabase_config: false,
      posthog_config: false,
      admin_config: false,
    };

    // Check Supabase configuration
    checks.supabase_config = !!(Deno.env.get('SUPABASE_URL') && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    // Check PostHog configuration (for analytics)
    checks.posthog_config = !!Deno.env.get('POSTHOG_API_KEY');

    // Check admin configuration
    checks.admin_config = !!Deno.env.get('ADMIN_SECRET');

    // Test database connectivity
    try {
      const supabase = createSupabaseServiceClient();
      const { error } = await supabase.from('users').select('count').limit(1);
      checks.database = !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      checks.database = false;
    }

    // Determine overall status
    const allChecksPass = Object.values(checks).every(check => check);
    const criticalChecksPass = checks.database && checks.supabase_config;
    
    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (allChecksPass) {
      status = 'healthy';
    } else if (criticalChecksPass) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const healthData: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      environment,
      version: '1.0.0',
      uptime: Date.now() - startTime,
      checks,
      ready: criticalChecksPass,
    };

    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    return createResponse(healthData, httpStatus);

  } catch (error) {
    console.error('Health check error:', error);
    return createErrorResponse('Health check failed', 503);
  }
});
```

### **Feature Flags Function**
```typescript
// supabase/functions/flags/index.ts
import { createResponse, createErrorResponse, handleCors } from '../_shared/utils.ts';
import { createSupabaseServiceClient } from '../_shared/supabase.ts';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, any>;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const flagKey = url.searchParams.get('key');
    const userId = url.searchParams.get('userId');

    const supabase = createSupabaseServiceClient();

    if (flagKey) {
      // Get specific flag
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('key', flagKey)
        .eq('enabled', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        return createErrorResponse(`Failed to fetch flag: ${error.message}`, 500);
      }

      const flag: FeatureFlag = {
        key: flagKey,
        enabled: !!data,
        description: data?.description,
        conditions: data?.conditions,
      };

      // Apply user-specific conditions if userId provided
      if (userId && data?.conditions) {
        flag.enabled = evaluateConditions(data.conditions, { userId });
      }

      return createResponse(flag);
    } else {
      // Get all flags
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('enabled', true);

      if (error) {
        return createErrorResponse(`Failed to fetch flags: ${error.message}`, 500);
      }

      const flags = data.reduce((acc: Record<string, boolean>, flag: any) => {
        acc[flag.key] = true;
        
        // Apply conditions if userId provided
        if (userId && flag.conditions) {
          acc[flag.key] = evaluateConditions(flag.conditions, { userId });
        }
        
        return acc;
      }, {});

      return createResponse(flags);
    }
  } catch (error) {
    console.error('Feature flags error:', error);
    return createErrorResponse('Failed to process request', 500);
  }
});

function evaluateConditions(conditions: any, context: { userId: string }): boolean {
  // Simple condition evaluation logic
  if (conditions.userIds) {
    return conditions.userIds.includes(context.userId);
  }
  
  if (conditions.percentage) {
    // Hash-based percentage rollout
    const hash = hashString(context.userId);
    const percentage = hash % 100;
    return percentage < conditions.percentage;
  }
  
  return true;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

### **Analytics/Metrics Function**
```typescript
// supabase/functions/metrics/index.ts
import { createResponse, createErrorResponse, handleCors, validateAdminAccess } from '../_shared/utils.ts';
import { createSupabaseServiceClient } from '../_shared/supabase.ts';

interface MetricsData {
  timestamp: string;
  environment: string;
  metrics: {
    users: {
      total: number;
      active_24h: number;
      new_24h: number;
      artists: number;
      verified_artists: number;
    };
    chat: {
      messages_24h: number;
      rooms_active: number;
      tracks_shared_24h: number;
    };
    system: {
      api_calls_24h: number;
      error_rate: number;
      avg_response_time: number;
    };
  };
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Validate admin access for metrics
  if (!(await validateAdminAccess(req))) {
    return createErrorResponse('Unauthorized', 401);
  }

  try {
    const supabase = createSupabaseServiceClient();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get user metrics
    const [totalUsers, activeUsers, newUsers, totalArtists, verifiedArtists] = await Promise.all([
      supabase.from('users').select('count').then(({ count }) => count || 0),
      supabase.from('users').select('count').gte('updated_at', yesterday.toISOString()).then(({ count }) => count || 0),
      supabase.from('users').select('count').gte('created_at', yesterday.toISOString()).then(({ count }) => count || 0),
      supabase.from('artist_profiles').select('count').then(({ count }) => count || 0),
      supabase.from('artist_profiles').select('count').eq('verified', true).then(({ count }) => count || 0),
    ]);

    // Get chat metrics
    const [messagesLast24h, activeRooms, tracksShared] = await Promise.all([
      supabase.from('messages').select('count').gte('created_at', yesterday.toISOString()).then(({ count }) => count || 0),
      supabase.from('rooms').select('count').then(({ count }) => count || 0),
      supabase.from('messages').select('count').not('track_ref', 'is', null).gte('created_at', yesterday.toISOString()).then(({ count }) => count || 0),
    ]);

    const metricsData: MetricsData = {
      timestamp: now.toISOString(),
      environment: Deno.env.get('ENVIRONMENT') || 'qa',
      metrics: {
        users: {
          total: totalUsers,
          active_24h: activeUsers,
          new_24h: newUsers,
          artists: totalArtists,
          verified_artists: verifiedArtists,
        },
        chat: {
          messages_24h: messagesLast24h,
          rooms_active: activeRooms,
          tracks_shared_24h: tracksShared,
        },
        system: {
          api_calls_24h: 0, // Would need to implement API call tracking
          error_rate: 0,    // Would need error tracking
          avg_response_time: 0, // Would need response time tracking
        },
      },
    };

    return createResponse(metricsData);

  } catch (error) {
    console.error('Metrics collection error:', error);
    return createErrorResponse('Failed to collect metrics', 500);
  }
});
```

## 🚀 Deployment

### **Deployment Script**
```bash
#!/bin/bash
# supabase/deploy.sh

set -e

ENVIRONMENT=${1:-qa}
FUNCTION_NAME=${2:-all}

echo "🚀 Deploying Sedā.fm Edge Functions"
echo "Environment: $ENVIRONMENT"
echo "Function: $FUNCTION_NAME"

# Validate environment
case $ENVIRONMENT in
  qa|sandbox|production)
    echo "✅ Valid environment: $ENVIRONMENT"
    ;;
  *)
    echo "❌ Invalid environment. Use: qa, sandbox, or production"
    exit 1
    ;;
esac

# Set project reference based on environment
case $ENVIRONMENT in
  qa)
    PROJECT_REF=${SUPABASE_QA_PROJECT_REF:-"your-qa-project-ref"}
    ;;
  sandbox)
    PROJECT_REF=${SUPABASE_SANDBOX_PROJECT_REF:-"your-sandbox-project-ref"}
    ;;
  production)
    PROJECT_REF=${SUPABASE_PROD_PROJECT_REF:-"your-prod-project-ref"}
    ;;
esac

# Link to the appropriate Supabase project
supabase link --project-ref $PROJECT_REF

# Deploy functions
if [ "$FUNCTION_NAME" = "all" ]; then
    echo "🔧 Deploying all functions..."
    
    for func in flags metrics health; do
        echo "📤 Deploying function: $func"
        supabase functions deploy $func --project-ref $PROJECT_REF
    done
else
    echo "📤 Deploying function: $FUNCTION_NAME"
    supabase functions deploy $FUNCTION_NAME --project-ref $PROJECT_REF
fi

echo "🎉 Deployment completed successfully!"
```

### **Local Development Setup**
```bash
#!/bin/bash
# supabase/start-local.sh

echo "🚀 Starting Supabase local development environment"

# Start Supabase services
supabase start

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Deploy edge functions locally
echo "📦 Deploying edge functions locally..."
supabase functions deploy --local

echo "✅ Supabase local environment ready!"
echo ""
echo "🔗 Local URLs:"
echo "   Studio: http://localhost:54323"
echo "   API: http://localhost:54321"
echo "   Inbucket: http://localhost:54324"
echo ""
echo "📋 Edge Functions:"
echo "   Health: http://localhost:54321/functions/v1/health"
echo "   Flags: http://localhost:54321/functions/v1/flags"
echo "   Metrics: http://localhost:54321/functions/v1/metrics"
```

## 📊 Monitoring and Analytics

### **Function Monitoring**
```typescript
// Built-in monitoring for edge functions
export async function logFunctionCall(
  functionName: string,
  duration: number,
  success: boolean,
  error?: string,
) {
  const logData = {
    function_name: functionName,
    duration_ms: duration,
    success,
    error: error || null,
    timestamp: new Date().toISOString(),
    environment: Deno.env.get('ENVIRONMENT'),
  };

  // In production, you might send this to an external monitoring service
  console.log('Function call log:', JSON.stringify(logData));
  
  // Could also store in Supabase for analysis
  const supabase = createSupabaseServiceClient();
  await supabase.from('function_logs').insert(logData);
}

// Usage in functions
Deno.serve(async (req) => {
  const startTime = Date.now();
  const functionName = 'health-check';
  
  try {
    // Your function logic here
    const result = await processHealthCheck();
    
    await logFunctionCall(functionName, Date.now() - startTime, true);
    return createResponse(result);
  } catch (error) {
    await logFunctionCall(functionName, Date.now() - startTime, false, error.message);
    return createErrorResponse(error.message);
  }
});
```

### **Performance Tracking**
```typescript
// Performance monitoring utilities
export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
  }

  getP95(name: string): number {
    const values = this.metrics.get(name)?.sort((a, b) => a - b) || [];
    if (values.length === 0) return 0;
    const index = Math.floor(values.length * 0.95);
    return values[index];
  }

  reset() {
    this.metrics.clear();
  }
}
```

## 🔒 Security Considerations

### **Function Security**
```typescript
// Security middleware for edge functions
export async function validateRequest(req: Request): Promise<{
  isValid: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Check rate limiting
    const clientId = req.headers.get('x-forwarded-for') || 'unknown';
    if (await isRateLimited(clientId)) {
      return { isValid: false, error: 'Rate limit exceeded' };
    }

    // Validate JWT token if required
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return { isValid: false, error: 'Invalid authentication' };
      }
      
      return { isValid: true, user: data.user };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Validation failed' };
  }
}

// Rate limiting implementation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function isRateLimited(clientId: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 60; // 60 requests per minute

  const record = rateLimitStore.get(clientId);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Function Deployment Failures**
```bash
# Check function logs
supabase functions logs health --project-ref your-project-ref

# Test function locally
supabase functions serve health --local

# Validate function code
deno check supabase/functions/health/index.ts
```

#### **Authentication Issues**
```bash
# Verify Supabase configuration
supabase status

# Check JWT token validity
curl -H "Authorization: Bearer your-token" \
  https://your-project.supabase.co/auth/v1/user
```

#### **Database Connection Problems**
```typescript
// Enhanced error handling for database operations
try {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Database error:', error);
    return createErrorResponse(`Database error: ${error.message}`, 500);
  }
} catch (error) {
  console.error('Unexpected database error:', error);
  return createErrorResponse('Database connection failed', 503);
}
```

This comprehensive Supabase documentation covers all aspects of the BaaS integration, from authentication to edge functions deployment and monitoring. The serverless architecture provides scalability while maintaining performance and security.