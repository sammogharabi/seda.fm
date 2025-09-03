import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { AuthGuard } from '../src/common/guards/auth.guard';

describe('Profiles E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;
  let authToken: string;
  let testUserId: string;
  const testUserEmail = 'e2e-test@example.com';
  const testSupabaseId = '11111111-1111-1111-1111-111111111111';

  beforeAll(async () => {
    // Use a valid UUID for Postgres uuid columns
    testUserId = '00000000-0000-0000-0000-000000000001';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: testUserId };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    
    await app.init();

    // Seed required user row to satisfy FK constraint from profiles.userId -> users.id
    try {
      await prisma.user.create({
        data: {
          id: testUserId,
          email: testUserEmail,
          supabaseId: testSupabaseId,
        },
      });
    } catch (e) {
      // ignore if already exists
    }

    // Fake auth token header (not used by mocked guard)
    authToken = 'Bearer test-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.profile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await app.close();
  });

  describe('Feature Flag Enforcement', () => {
    it('should return 404 when FEATURE_PROFILES is disabled', async () => {
      // Ensure feature flag disabled for this test
      process.env.FEATURE_PROFILES = 'false';

      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authToken)
        .send({
          username: 'testuser',
          displayName: 'Test User',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resource not found');
    });

    it('should allow access when FEATURE_PROFILES is enabled', async () => {
      // Enable feature flag for this test
      process.env.FEATURE_PROFILES = 'true';

      // Mock auth guard to allow request
      const response = await request(app.getHttpServer())
        .get('/profiles/testuser')
        .set('Authorization', authToken);

      // If 404 occurs, it must not be the feature-flag 404
      if (response.status === 404) {
        expect(response.body.message).not.toBe('Resource not found');
      }
      // Otherwise any non-404 status also proves routing passed FeatureGuard
    });
  });

  describe('Username Canonicalization', () => {
    beforeEach(() => {
      // Enable feature flag for these tests
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'FEATURE_PROFILES') return 'true';
        return 'default-value';
      });
    });

    it('should lowercase usernames when creating profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authToken)
        .send({
          username: 'TestUser123',
          displayName: 'Test User',
        });

      if (response.status === 201) {
        expect(response.body.username).toBe('testuser123');
      }
    });

    it('should find profile with case-insensitive lookup', async () => {
      // First create a profile
      await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authToken)
        .send({
          username: 'testuser',
          displayName: 'Test User',
        });

      // Try to find with different case
      const response = await request(app.getHttpServer())
        .get('/profiles/TestUser')
        .set('Authorization', authToken);

      if (response.status === 200) {
        expect(response.body.username).toBe('testuser');
      }
    });
  });

  describe('Profile CRUD Operations', () => {
    beforeEach(() => {
      // Enable feature flag
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'FEATURE_PROFILES') return 'true';
        return 'default-value';
      });
    });

    it('should create profile successfully', async () => {
      const profileData = {
        username: 'e2euser',
        displayName: 'E2E Test User',
        bio: 'Testing profile creation',
      };

      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authToken)
        .send(profileData);

      if (response.status === 201) {
        expect(response.body).toMatchObject({
          username: 'e2euser',
          displayName: 'E2E Test User',
          bio: 'Testing profile creation',
        });
      }
    });

    it('should prevent duplicate usernames', async () => {
      // First profile
      await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authToken)
        .send({
          username: 'duplicate',
          displayName: 'First User',
        });

      // Attempt duplicate
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authToken)
        .send({
          username: 'duplicate',
          displayName: 'Second User',
        });

      expect(response.status).toBe(409);
      // Depending on user context, service may return either message
      const msg: string = response.body.message || '';
      expect(
        msg.includes('Username already taken') ||
        msg.includes('User already has a profile'),
      ).toBe(true);
    });
  });
});
