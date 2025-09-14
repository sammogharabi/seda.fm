import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '').split(',');

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Add simple health endpoint for Railway health checks
  app.use('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'seda-auth-service' });
  });

  const environment = configService.get<string>('NODE_ENV', 'development');
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

  await app.listen(port, '0.0.0.0');
  console.log(`🎵 Sedā Auth Service running on port ${port} in ${environment} mode`);
}

bootstrap();