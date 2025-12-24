import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true }) // Disable rate limiting for tests
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Verification Flow', () => {
    it('/artist/verification/request (POST) - should require authentication', () => {
      return request(app.getHttpServer()).post('/artist/verification/request').expect(401);
    });

    it('/admin/verification/pending (GET) - should require admin key', () => {
      return request(app.getHttpServer()).get('/admin/verification/pending').expect(401);
    });
  });
});
