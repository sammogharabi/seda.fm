import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Verification Flow', () => {
    it('/api/v1/artist/verification/request (POST) - should require authentication', () => {
      return request(app.getHttpServer()).post('/api/v1/artist/verification/request').expect(401);
    });

    it('/api/v1/admin/verification/pending (GET) - should require admin key', () => {
      return request(app.getHttpServer()).get('/api/v1/admin/verification/pending').expect(401);
    });
  });
});
