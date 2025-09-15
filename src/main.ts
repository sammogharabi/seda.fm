import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '').split(',');
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  app.setGlobalPrefix(apiPrefix);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
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
      preload: true
    }
  }));

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
  app.use('/health', async (req: Request, res: Response) => {
    try {
      // Basic health check
      const healthData: any = {
        status: 'ok',
        service: 'seda-auth-service',
        timestamp: new Date().toISOString()
      };

      // Check database connection (if available)
      try {
        const prisma = app.get('PrismaService');
        if (prisma) {
          await prisma.$queryRaw`SELECT 1 as health`;
          healthData.db = 'ok';
        }
      } catch (dbError) {
        healthData.db = 'error';
        if (environment !== 'production') {
          healthData.dbError = (dbError as Error).message;
        }
      }

      res.status(200).json(healthData);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        service: 'seda-auth-service',
        timestamp: new Date().toISOString()
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