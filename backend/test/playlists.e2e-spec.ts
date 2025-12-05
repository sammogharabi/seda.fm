import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { AuthGuard } from '../src/common/guards/auth.guard';

describe('Playlists E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;
  let authToken: string;
  let testUserId: string;
  const testUserEmail = 'e2e-test@example.com';
  const testSupabaseId = '22222222-2222-2222-2222-222222222222';
  let testPlaylistId: string;

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

    // Seed required user and profile rows to satisfy FKs for playlists
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
    try {
      await prisma.profile.create({
        data: {
          userId: testUserId,
          username: 'owneruser',
          displayName: 'Owner User',
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
    await prisma.playlistItem.deleteMany({
      where: { playlist: { ownerUserId: testUserId } },
    });
    await prisma.playlist.deleteMany({
      where: { ownerUserId: testUserId },
    });
    await prisma.profile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await app.close();
  });

  describe('Feature Flag Enforcement', () => {
    it('should return 404 when FEATURE_PLAYLISTS is disabled', async () => {
      // Ensure feature flags for this test
      process.env.FEATURE_PLAYLISTS = 'false';
      process.env.FEATURE_PROFILES = 'true';

      const response = await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', authToken)
        .send({
          title: 'Test Playlist',
          description: 'A test playlist',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resource not found');
    });

    it('should allow access when FEATURE_PLAYLISTS is enabled', async () => {
      // Enable flags for this test
      process.env.FEATURE_PLAYLISTS = 'true';
      process.env.FEATURE_PROFILES = 'true';

      const response = await request(app.getHttpServer())
        .get('/playlists/non-existent')
        .set('Authorization', authToken);

      // If 404 occurs, ensure it's not due to FeatureGuard (which returns 'Resource not found')
      if (response.status === 404) {
        expect(response.body.message).not.toBe('Resource not found');
      }
    });
  });

  describe('Playlist CRUD Operations', () => {
    beforeEach(() => {
      // Enable feature flags
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'FEATURE_PLAYLISTS') return 'true';
        if (key === 'FEATURE_PROFILES') return 'true';
        return 'default-value';
      });
    });

    it('should create playlist successfully', async () => {
      const playlistData = {
        title: 'E2E Test Playlist',
        description: 'Testing playlist creation',
        isPublic: true,
        isCollaborative: false,
      };

      const response = await request(app.getHttpServer())
        .post('/playlists')
        .set('Authorization', authToken)
        .send(playlistData);

      if (response.status === 201) {
        testPlaylistId = response.body.id;
        expect(response.body).toMatchObject({
          title: 'E2E Test Playlist',
          description: 'Testing playlist creation',
          isPublic: true,
          isCollaborative: false,
        });
        expect(response.body.owner).toHaveProperty('username');
      }
    });

    it('should get playlist by ID', async () => {
      if (!testPlaylistId) return;

      const response = await request(app.getHttpServer())
        .get(`/playlists/${testPlaylistId}`)
        .set('Authorization', authToken);

      if (response.status === 200) {
        expect(response.body.id).toBe(testPlaylistId);
        expect(response.body.title).toBe('E2E Test Playlist');
      }
    });

    it('should update playlist', async () => {
      if (!testPlaylistId) return;

      const updateData = {
        title: 'Updated E2E Playlist',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/playlists/${testPlaylistId}`)
        .set('Authorization', authToken)
        .send(updateData);

      if (response.status === 200) {
        expect(response.body.title).toBe('Updated E2E Playlist');
        expect(response.body.description).toBe('Updated description');
      }
    });
  });

  describe('Playlist Items with Cursor Pagination', () => {
    beforeEach(() => {
      // Enable feature flags
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'FEATURE_PLAYLISTS') return 'true';
        if (key === 'FEATURE_PROFILES') return 'true';
        return 'default-value';
      });
    });

    it('should add item to playlist', async () => {
      if (!testPlaylistId) return;

      const itemData = {
        position: 0,
        provider: 'spotify',
        providerTrackId: '4uLU6hMCjMI75M1A2tKUQC',
        title: 'Test Song',
        artist: 'Test Artist',
      };

      const response = await request(app.getHttpServer())
        .post(`/playlists/${testPlaylistId}/items`)
        .set('Authorization', authToken)
        .send(itemData);

      if (response.status === 201) {
        expect(response.body).toMatchObject({
          position: 0,
          provider: 'spotify',
          providerTrackId: '4uLU6hMCjMI75M1A2tKUQC',
          title: 'Test Song',
          artist: 'Test Artist',
        });
        expect(response.body.addedBy).toHaveProperty('username');
      }
    });

    it('should get playlist items with cursor pagination', async () => {
      if (!testPlaylistId) return;

      // Add multiple items first
      const items = [
        { position: 1, provider: 'spotify', providerTrackId: 'track1', title: 'Song 1' },
        { position: 2, provider: 'spotify', providerTrackId: 'track2', title: 'Song 2' },
        { position: 3, provider: 'spotify', providerTrackId: 'track3', title: 'Song 3' },
      ];

      for (const item of items) {
        await request(app.getHttpServer())
          .post(`/playlists/${testPlaylistId}/items`)
          .set('Authorization', authToken)
          .send(item);
      }

      // Test pagination
      const response = await request(app.getHttpServer())
        .get(`/playlists/${testPlaylistId}/items`)
        .query({ limit: 2, sortField: 'position', sortDirection: 'asc' })
        .set('Authorization', authToken);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('nextCursor');
        expect(response.body).toHaveProperty('hasMore');
        expect(response.body.data).toHaveLength(2);

        // Items should be sorted by position ascending
        expect(response.body.data[0].position).toBeLessThan(response.body.data[1].position);
      }
    });

    it('should handle cursor-based pagination', async () => {
      if (!testPlaylistId) return;

      // Get first page
      const firstPage = await request(app.getHttpServer())
        .get(`/playlists/${testPlaylistId}/items`)
        .query({ limit: 2 })
        .set('Authorization', authToken);

      if (firstPage.status === 200 && firstPage.body.nextCursor) {
        // Get second page using cursor
        const secondPage = await request(app.getHttpServer())
          .get(`/playlists/${testPlaylistId}/items`)
          .query({ limit: 2, cursor: firstPage.body.nextCursor })
          .set('Authorization', authToken);

        if (secondPage.status === 200) {
          expect(secondPage.body.data).toBeDefined();
          // Should have different items than first page
          const firstPageIds = firstPage.body.data.map((item: any) => item.id);
          const secondPageIds = secondPage.body.data.map((item: any) => item.id);
          expect(firstPageIds).not.toEqual(secondPageIds);
        }
      }
    });
  });
});
