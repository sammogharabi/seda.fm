import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MessageType, RoomType } from '@prisma/client';

describe('Chat Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let userToken: string;
  let userId: string;
  let roomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await app.init();

    // Create test user and token
    userId = 'test-user-integration';
    userToken = jwtService.sign({ 
      sub: userId, 
      email: 'test@integration.com' 
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.reaction.deleteMany({
      where: { userId: userId },
    });
    await prismaService.message.deleteMany({
      where: { userId: userId },
    });
    await prismaService.roomMembership.deleteMany({
      where: { userId: userId },
    });
    await prismaService.room.deleteMany({
      where: { createdBy: userId },
    });
    
    await app.close();
  });

  describe('POST /api/v1/chat/rooms', () => {
    it('should create a new room', async () => {
      const createRoomDto = {
        name: 'Integration Test Room',
        description: 'A room for integration testing',
        type: RoomType.PUBLIC,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/chat/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createRoomDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createRoomDto.name);
      expect(response.body.description).toBe(createRoomDto.description);
      expect(response.body.type).toBe(createRoomDto.type);
      expect(response.body.createdBy).toBe(userId);

      roomId = response.body.id;
    });

    it('should require authentication', async () => {
      const createRoomDto = {
        name: 'Test Room',
        type: RoomType.PUBLIC,
      };

      await request(app.getHttpServer())
        .post('/api/v1/chat/rooms')
        .send(createRoomDto)
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/chat/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/v1/chat/rooms/:roomId/join', () => {
    it('should join a public room', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(userId);
      expect(response.body.roomId).toBe(roomId);
    });

    it('should prevent joining the same room twice', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should return 404 for non-existent room', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/chat/rooms/non-existent-room/join')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/chat/rooms/:roomId/messages', () => {
    let messageId: string;

    it('should send a text message', async () => {
      const sendMessageDto = {
        type: MessageType.TEXT,
        text: 'Hello from integration test!',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(sendMessageDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe(sendMessageDto.text);
      expect(response.body.type).toBe(sendMessageDto.type);
      expect(response.body.userId).toBe(userId);
      expect(response.body.roomId).toBe(roomId);

      messageId = response.body.id;
    });

    it('should send a track message', async () => {
      const sendMessageDto = {
        type: MessageType.TRACK,
        trackUrl: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(sendMessageDto)
        .expect(201);

      expect(response.body.type).toBe(MessageType.TRACK);
      expect(response.body).toHaveProperty('trackRef');
    });

    it('should require room membership', async () => {
      // Create another room that user is not a member of
      const anotherRoom = await prismaService.room.create({
        data: {
          name: 'Another Room',
          type: RoomType.PUBLIC,
          createdBy: 'another-user',
        },
      });

      const sendMessageDto = {
        type: MessageType.TEXT,
        text: 'This should fail',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${anotherRoom.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(sendMessageDto)
        .expect(400);

      // Clean up
      await prismaService.room.delete({
        where: { id: anotherRoom.id },
      });
    });

    it('should validate message type and content', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: MessageType.TEXT })
        .expect(400);
    });
  });

  describe('GET /api/v1/chat/rooms/:roomId/messages', () => {
    it('should retrieve messages for a room', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('hasMore');
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBeGreaterThan(0);

      const message = response.body.messages[0];
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('text');
      expect(message).toHaveProperty('user');
      expect(message).toHaveProperty('createdAt');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/rooms/${roomId}/messages`)
        .query({ limit: 1 })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.messages.length).toBe(1);
    });

    it('should require room membership', async () => {
      const anotherRoom = await prismaService.room.create({
        data: {
          name: 'Another Room',
          type: RoomType.PUBLIC,
          createdBy: 'another-user',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/chat/rooms/${anotherRoom.id}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      await prismaService.room.delete({
        where: { id: anotherRoom.id },
      });
    });
  });

  describe('POST /api/v1/chat/messages/:messageId/reactions', () => {
    let messageId: string;

    beforeAll(async () => {
      // Create a test message
      const message = await prismaService.message.create({
        data: {
          roomId: roomId,
          userId: userId,
          type: MessageType.TEXT,
          text: 'Test message for reactions',
        },
      });
      messageId = message.id;
    });

    it('should add a reaction to a message', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/messages/${messageId}/reactions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ emoji: '👍' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.emoji).toBe('👍');
      expect(response.body.messageId).toBe(messageId);
      expect(response.body.userId).toBe(userId);
    });

    it('should prevent duplicate reactions', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/messages/${messageId}/reactions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ emoji: '👍' })
        .expect(400);
    });

    it('should validate emoji format', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/messages/${messageId}/reactions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ emoji: 'invalid' })
        .expect(400);
    });

    it('should return 404 for non-existent message', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/chat/messages/non-existent-message/reactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ emoji: '❤️' })
        .expect(404);
    });
  });

  describe('GET /api/v1/chat/rooms', () => {
    it('should retrieve user rooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/chat/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const room = response.body.find((r: any) => r.id === roomId);
      expect(room).toBeDefined();
      expect(room.name).toBe('Integration Test Room');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chat/rooms')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on message sending', async () => {
      const sendMessageDto = {
        type: MessageType.TEXT,
        text: 'Rate limit test message',
      };

      // Send messages rapidly to trigger rate limit
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post(`/api/v1/chat/rooms/${roomId}/messages`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(sendMessageDto)
      );

      const responses = await Promise.all(promises.map(p => p.catch(e => e.response)));
      
      // Should have some successful responses and some rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${roomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should handle invalid JWT tokens', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chat/rooms')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should handle missing Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chat/rooms')
        .expect(401);
    });
  });
});