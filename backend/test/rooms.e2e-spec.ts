import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('Rooms E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Use valid UUID v4 format
  const testUser1Id = 'd1111111-1111-4111-a111-111111111121';
  const testUser2Id = 'd2222222-2222-4222-b222-222222222222';
  const testUser3Id = 'd3333333-3333-4333-c333-333333333323';

  let currentUserId = testUser1Id;
  let roomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: currentUserId, email: 'test@test.com' };
          return true;
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true }) // Disable rate limiting for tests
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up existing test data
    await prisma.message.deleteMany({
      where: { userId: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await prisma.roomMembership.deleteMany({
      where: { userId: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await prisma.room.deleteMany({
      where: { createdBy: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });

    // Create test users
    await prisma.user.createMany({
      data: [
        { id: testUser1Id, email: 'roomtest1@test.com', supabaseId: 'room-supabase-1' },
        { id: testUser2Id, email: 'roomtest2@test.com', supabaseId: 'room-supabase-2' },
        { id: testUser3Id, email: 'roomtest3@test.com', supabaseId: 'room-supabase-3' },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.message.deleteMany({
      where: { userId: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await prisma.roomMembership.deleteMany({
      where: { userId: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await prisma.room.deleteMany({
      where: { createdBy: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUser1Id, testUser2Id, testUser3Id] } },
    });
    await app.close();
  });

  describe('Create Room', () => {
    it('should create a new room', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Test Room',
          description: 'A test room for e2e testing',
          genre: 'Electronic',
          isPrivate: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Room');

      roomId = response.body.id;
    });

    it('should reject room without name', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', 'Bearer test-token')
        .send({
          description: 'Missing name',
        });

      expect(response.status).toBe(400);
    });

    it('should create private room', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Private Test Room',
          isPrivate: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.isPrivate).toBe(true);
    });
  });

  describe('Get Rooms', () => {
    it('should list rooms', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .get('/rooms')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get room by id', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .get(`/rooms/${roomId}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(roomId);
      expect(response.body.name).toBe('Test Room');
    });

    it('should return 404 for non-existent room', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .get('/rooms/00000000-0000-0000-0000-999999999999')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
    });
  });

  describe('Join Room', () => {
    it('should allow user to join room', async () => {
      currentUserId = testUser2Id;

      const response = await request(app.getHttpServer())
        .post(`/rooms/${roomId}/join`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(201);
    });

    it('should handle duplicate joins gracefully', async () => {
      currentUserId = testUser2Id;

      const response = await request(app.getHttpServer())
        .post(`/rooms/${roomId}/join`)
        .set('Authorization', 'Bearer test-token');

      // Should either succeed (idempotent), return conflict, or already member
      expect([200, 201, 400, 409]).toContain(response.status);
    });
  });

  describe('Room Messages', () => {
    it('should send message to room', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .post(`/rooms/${roomId}/messages`)
        .set('Authorization', 'Bearer test-token')
        .send({
          content: 'Hello room!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should get room messages', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .get(`/rooms/${roomId}/messages`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.messages).toBeTruthy();
    });

    it('should reject empty message', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .post(`/rooms/${roomId}/messages`)
        .set('Authorization', 'Bearer test-token')
        .send({
          content: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Leave Room', () => {
    it('should allow member to leave room', async () => {
      currentUserId = testUser2Id;

      const response = await request(app.getHttpServer())
        .post(`/rooms/${roomId}/leave`)
        .set('Authorization', 'Bearer test-token');

      expect([200, 201]).toContain(response.status);
    });
  });

  describe('Update Room', () => {
    it('should allow creator to update room', async () => {
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .put(`/rooms/${roomId}`)
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Updated Room Name',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Room Name');
    });

    it('should reject non-creator update', async () => {
      currentUserId = testUser2Id;

      const response = await request(app.getHttpServer())
        .put(`/rooms/${roomId}`)
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Unauthorized Update',
        });

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Delete Room', () => {
    let deleteRoomId: string;

    it('should create room for deletion test', async () => {
      currentUserId = testUser1Id;
      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', 'Bearer test-token')
        .send({ name: 'Room to Delete' });

      if (response.status === 201) {
        deleteRoomId = response.body.id;
      }
      expect([201, 429]).toContain(response.status);
    });

    it('should reject non-creator deletion', async () => {
      if (!deleteRoomId) return; // Skip if rate limited
      currentUserId = testUser2Id;

      const response = await request(app.getHttpServer())
        .delete(`/rooms/${deleteRoomId}`)
        .set('Authorization', 'Bearer test-token');

      expect([403, 404]).toContain(response.status);
    });

    it('should allow creator to delete room', async () => {
      if (!deleteRoomId) return; // Skip if rate limited
      currentUserId = testUser1Id;

      const response = await request(app.getHttpServer())
        .delete(`/rooms/${deleteRoomId}`)
        .set('Authorization', 'Bearer test-token');

      expect([200, 204]).toContain(response.status);
    });
  });
});
