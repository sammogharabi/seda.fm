import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import helmet from 'helmet';
import * as compression from 'compression';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaService } from './config/prisma.service';

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [],
  });
}

// Validate required environment variables at startup
function validateEnvironment(): void {
  const logger = new Logger('Bootstrap');
  const required: string[] = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'JWT_SECRET',
  ];

  // Check for either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
    logger.error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
    throw new Error('Missing required environment variables: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
  }

  const recommended: string[] = [
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CORS_ORIGINS',
    'APP_URL',
  ];

  const missing: string[] = [];
  const missingRecommended: string[] = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  for (const envVar of recommended) {
    if (!process.env[envVar]) {
      missingRecommended.push(envVar);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (missingRecommended.length > 0) {
    logger.warn(`Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }

  logger.log('Environment validation passed');
}

async function bootstrap() {
  // Validate environment before starting
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Railway injects PORT via environment - use process.env directly as backup
  const port = process.env.PORT || configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '').split(',');
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  app.setGlobalPrefix(apiPrefix);

  // Gzip compression for responses (60-70% size reduction)
  app.use(compression());

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disabled for API compatibility
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: environment === 'production', // Hide validation details in production
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 86400, // 24 hours
  });

  // Enhanced health endpoint with database check
  // Uses $executeRawUnsafe instead of $queryRaw to avoid PgBouncer prepared statement conflicts
  app.use('/health', async (req: Request, res: Response) => {
    try {
      // Basic health check
      const healthData: any = {
        status: 'ok',
        service: 'seda-auth-service',
        timestamp: new Date().toISOString(),
      };

      // Check database connection (if available)
      // Use $executeRawUnsafe with a simple query to avoid prepared statement issues with PgBouncer
      try {
        const prisma = app.get(PrismaService);
        if (prisma) {
          await prisma.$executeRawUnsafe('SELECT 1');
          healthData.db = 'ok';
        }
      } catch (dbError) {
        healthData.db = 'error';
        // Always show dbError for debugging in production
        healthData.dbError = (dbError as Error).message;
      }

      res.status(200).json(healthData);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        service: 'seda-auth-service',
        timestamp: new Date().toISOString(),
      });
    }
  });

  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Sedā Auth Service')
      .setDescription('Authentication and User Service API')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Admin-Key', in: 'header' }, 'admin-key')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`🎵 Sedā Auth Service running on port ${port} in ${environment} mode`);
    console.log(`📋 Health endpoint available at: http://0.0.0.0:${port}/health`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
