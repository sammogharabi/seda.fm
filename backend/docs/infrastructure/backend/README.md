# Backend Infrastructure - seda.fm

## ⚙️ Overview

The seda.fm backend is built with NestJS, a progressive Node.js framework that provides a robust foundation for building scalable server-side applications. The architecture follows modular design principles with clear separation of concerns.

## 🏗️ Backend Architecture

### **Technology Stack**
- **Framework**: NestJS 10.x
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **API Documentation**: Swagger/OpenAPI
- **WebSocket**: Socket.io
- **Validation**: class-validator & class-transformer
- **Testing**: Jest
- **Process Manager**: PM2 (production)

### **Application Structure**
```
src/
├── main.ts                    # Application bootstrap
├── app.module.ts             # Root module
├── config/                   # Configuration management
│   ├── configuration.ts      # Environment configuration
│   ├── prisma.module.ts     # Database module
│   ├── prisma.service.ts    # Database service
│   ├── supabase.module.ts   # Supabase integration
│   └── supabase.service.ts  # Supabase service
├── common/                   # Shared utilities
│   ├── decorators/          # Custom decorators
│   ├── dto/                 # Common DTOs
│   ├── filters/             # Exception filters
│   ├── guards/              # Authentication guards
│   └── interceptors/        # Request/response interceptors
└── modules/                 # Feature modules
    ├── chat/                # Real-time chat system
    ├── user/                # User management
    ├── verification/        # Artist verification
    ├── admin/               # Admin operations
    └── crawler/             # Web crawling service
```

## 🚀 Application Bootstrap

### **Main Application File**
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './config/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // API versioning
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('seda.fm API')
      .setDescription('Music-first social platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Graceful shutdown
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 seda.fm API running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch(console.error);
```

### **Root Module Configuration**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './config/prisma.module';
import { SupabaseModule } from './config/supabase.module';
import { configuration } from './config/configuration';

// Feature modules
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AdminModule } from './modules/admin/admin.module';
import { CrawlerModule } from './modules/crawler/crawler.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,        // 1 minute window
        limit: 100,        // 100 requests per minute
      },
    ]),

    // Infrastructure modules
    PrismaModule,
    SupabaseModule,

    // Feature modules
    UserModule,
    ChatModule,
    VerificationModule,
    AdminModule,
    CrawlerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## 🔧 Configuration Management

### **Environment Configuration**
```typescript
// src/config/configuration.ts
export const configuration = () => ({
  // Application settings
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Supabase integration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  
  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    adminApiKey: process.env.ADMIN_API_KEY,
  },
  
  // Feature-specific configuration
  crawler: {
    userAgent: process.env.CRAWLER_USER_AGENT || 'Mozilla/5.0 (compatible; SedaBot/1.0)',
    timeoutMs: parseInt(process.env.CRAWLER_TIMEOUT_MS || '30000', 10),
    maxRetries: parseInt(process.env.CRAWLER_MAX_RETRIES || '3', 10),
  },
  
  // Rate limiting
  rateLimit: {
    verificationPerDay: parseInt(process.env.RATE_LIMIT_VERIFICATION_PER_DAY || '3', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000', 10),
  },
  
  // Verification system
  verification: {
    codeLength: parseInt(process.env.VERIFICATION_CODE_LENGTH || '8', 10),
    codeExpiryDays: parseInt(process.env.VERIFICATION_CODE_EXPIRY_DAYS || '7', 10),
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
```

### **Environment Files**
```bash
# .env.development
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://seda_user:seda_pass@localhost:5432/seda_dev"
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"
JWT_SECRET="your-dev-secret"
CORS_ORIGINS="http://localhost:3000"
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:pass@prod-db:5432/seda_prod"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-prod-anon-key"
SUPABASE_SERVICE_KEY="your-prod-service-key"
JWT_SECRET="your-production-secret"
CORS_ORIGINS="https://app.seda.fm,https://seda.fm"
LOG_LEVEL=error
```

## 🛡️ Security Implementation

### **Authentication Guards**
```typescript
// src/common/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

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
      const { data: user, error } = await this.supabaseService.auth.getUser(token);
      
      if (error || !user) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      request.user = user.user;
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

### **Role-Based Authorization**
```typescript
// src/common/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userData = await this.userService.findBySupabaseId(user.id);
    
    if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      throw new ForbiddenException('Admin privileges required');
    }

    request.userData = userData;
    return true;
  }
}
```

### **Request Validation**
```typescript
// Example DTO with validation
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  artistName?: string;
}
```

## 🔄 Middleware and Interceptors

### **Logging Interceptor**
```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = Date.now() - start;

        this.logger.log(
          `${method} ${url} ${statusCode} - ${duration}ms - ${userAgent} - ${ip}`
        );
      })
    );
  }
}
```

### **Error Handling**
```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`
    );

    response.status(status).json(errorResponse);
  }
}
```

## 📊 Performance Optimization

### **Caching Strategy**
```typescript
// src/common/decorators/cache.decorator.ts
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors, applyDecorators } from '@nestjs/common';

export function Cache(key: string, ttl: number) {
  return applyDecorators(
    CacheKey(key),
    CacheTTL(ttl),
    UseInterceptors(CacheInterceptor),
  );
}

// Usage in controllers
@Get('popular-tracks')
@Cache('popular-tracks', 300) // Cache for 5 minutes
async getPopularTracks() {
  return this.trackService.getPopularTracks();
}
```

### **Database Query Optimization**
```typescript
// Efficient pagination helper
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}

// Service method with optimized queries
async getPaginatedMessages(roomId: string, paginationDto: PaginationDto) {
  const { limit, cursor } = paginationDto;

  return this.prisma.message.findMany({
    where: { 
      roomId,
      deletedAt: null, // Exclude soft-deleted messages
    },
    include: {
      user: {
        select: { // Select only needed fields
          id: true,
          email: true,
          artistProfile: {
            select: {
              artistName: true,
              verified: true,
            }
          }
        }
      },
      reactions: {
        select: {
          id: true,
          emoji: true,
          userId: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });
}
```

## 🔌 WebSocket Implementation

### **WebSocket Gateway Configuration**
```typescript
// WebSocket setup with authentication
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      // Authenticate WebSocket connection
      const token = client.handshake.auth?.token;
      const user = await this.authService.validateToken(token);
      
      client.data.userId = user.id;
      client.data.rooms = new Set();

      this.logger.log(`User ${user.id} connected via WebSocket`);
    } catch (error) {
      this.logger.error('WebSocket authentication failed', error);
      client.disconnect();
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    // Validate room access
    await this.chatService.validateRoomAccess(client.data.userId, roomId);
    
    // Join room
    await client.join(roomId);
    client.data.rooms.add(roomId);
    
    // Notify others
    client.to(roomId).emit('user_joined', roomId, client.data.userId);
  }
}
```

## 🧪 Testing Strategy

### **Unit Testing**
```typescript
// Example service test
describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            message: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a message', async () => {
    const messageData = {
      roomId: 'room-123',
      userId: 'user-123',
      text: 'Hello world',
    };

    const expectedMessage = { id: 'msg-123', ...messageData };
    jest.spyOn(prisma.message, 'create').mockResolvedValue(expectedMessage);

    const result = await service.sendMessage('user-123', 'room-123', messageData);

    expect(result).toEqual(expectedMessage);
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: messageData,
      include: expect.any(Object),
    });
  });
});
```

### **Integration Testing**
```typescript
// Example controller integration test
describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  it('/chat/rooms/:roomId/messages (POST)', () => {
    return request(app.getHttpServer())
      .post('/chat/rooms/room-123/messages')
      .set('Authorization', 'Bearer valid-token')
      .send({
        text: 'Test message',
        type: 'TEXT',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.text).toBe('Test message');
        expect(res.body.userId).toBe('user-123');
      });
  });
});
```

## 🚀 Production Deployment

### **PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'seda-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
```

### **Health Checks**
```typescript
// Health check endpoint
@Get('health')
async healthCheck() {
  const checks = {
    database: false,
    supabase: false,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database connection
    await this.prisma.$queryRaw`SELECT 1`;
    checks.database = true;

    // Check Supabase connection
    const { error } = await this.supabase.auth.getSession();
    checks.supabase = !error;

    return {
      status: checks.database && checks.supabase ? 'healthy' : 'degraded',
      checks,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      checks,
      error: error.message,
    };
  }
}
```

## 🚨 Troubleshooting

### **Common Issues and Solutions**

#### **Memory Leaks**
```bash
# Monitor memory usage
npm install -g clinic
clinic doctor -- node dist/main.js

# Check for memory leaks in WebSocket connections
# Ensure proper cleanup in disconnect handlers
```

#### **Database Connection Issues**
```typescript
// Enhanced connection retry logic
async onModuleInit() {
  let retries = 5;
  while (retries > 0) {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
      break;
    } catch (error) {
      this.logger.error(`Database connection failed. Retries left: ${retries - 1}`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

#### **WebSocket Connection Problems**
```typescript
// Enhanced WebSocket error handling
@Catch()
export class WsExceptionFilter implements BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    
    this.logger.error('WebSocket error:', exception);
    
    client.emit('error', {
      message: 'An error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 📈 Performance Monitoring

### **Application Metrics**
```typescript
// Custom metrics collection
export class MetricsService {
  private readonly metrics = new Map<string, number>();

  incrementCounter(metric: string) {
    this.metrics.set(metric, (this.metrics.get(metric) || 0) + 1);
  }

  recordTiming(metric: string, duration: number) {
    this.metrics.set(`${metric}_duration`, duration);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

// Usage in controllers
@Post('messages')
async sendMessage(@Body() data: SendMessageDto) {
  const start = Date.now();
  
  try {
    const result = await this.chatService.sendMessage(data);
    this.metricsService.incrementCounter('messages_sent_success');
    return result;
  } catch (error) {
    this.metricsService.incrementCounter('messages_sent_error');
    throw error;
  } finally {
    this.metricsService.recordTiming('messages_sent', Date.now() - start);
  }
}
```

This comprehensive backend documentation provides everything needed to understand, deploy, and maintain the seda.fm backend infrastructure. The modular architecture ensures scalability while maintaining code quality and performance.