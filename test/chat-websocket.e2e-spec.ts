import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MessageType, RoomType } from '@prisma/client';
import { io, Socket } from 'socket.io-client';

describe('Chat WebSocket E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let client1: Socket;
  let client2: Socket;
  let userToken1: string;
  let userToken2: string;
  let userId1: string;
  let userId2: string;
  let roomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await app.listen(0); // Use random available port
    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? 3000 : address?.port || 3000;

    // Create test users and tokens
    userId1 = 'test-user-ws-1';
    userId2 = 'test-user-ws-2';
    userToken1 = jwtService.sign({ 
      sub: userId1, 
      email: 'test1@websocket.com' 
    });
    userToken2 = jwtService.sign({ 
      sub: userId2, 
      email: 'test2@websocket.com' 
    });

    // Create test room
    const room = await prismaService.room.create({
      data: {
        name: 'WebSocket Test Room',
        type: RoomType.PUBLIC,
        createdBy: userId1,
      },
    });
    roomId = room.id;

    // Add both users to the room
    await prismaService.roomMembership.createMany({
      data: [
        { userId: userId1, roomId: roomId },
        { userId: userId2, roomId: roomId },
      ],
    });

    // Initialize WebSocket clients
    client1 = io(`http://localhost:${port}`, {
      auth: { token: userToken1 },
      transports: ['websocket'],
    });

    client2 = io(`http://localhost:${port}`, {
      auth: { token: userToken2 },
      transports: ['websocket'],
    });

    // Wait for connections
    await Promise.all([
      new Promise(resolve => client1.on('connect', resolve)),
      new Promise(resolve => client2.on('connect', resolve)),
    ]);
  });

  afterAll(async () => {
    // Clean up
    client1?.disconnect();
    client2?.disconnect();

    await prismaService.reaction.deleteMany({
      where: { userId: { in: [userId1, userId2] } },
    });
    await prismaService.message.deleteMany({
      where: { userId: { in: [userId1, userId2] } },
    });
    await prismaService.roomMembership.deleteMany({
      where: { userId: { in: [userId1, userId2] } },
    });
    await prismaService.room.deleteMany({
      where: { id: roomId },
    });

    await app.close();
  });

  describe('Real-time Messaging', () => {
    it('should broadcast messages to all users in room', (done) => {
      const testMessage = {
        roomId: roomId,
        type: MessageType.TEXT,
        text: 'Hello from WebSocket test!',
      };

      // Client2 listens for the message
      client2.on('message', (message) => {
        expect(message.text).toBe(testMessage.text);
        expect(message.userId).toBe(userId1);
        expect(message.roomId).toBe(roomId);
        expect(message.user).toBeDefined();
        expect(message.createdAt).toBeDefined();
        done();
      });

      // Client1 sends the message
      client1.emit('send_message', testMessage);
    });

    it('should handle track messages with unfurling', (done) => {
      const trackMessage = {
        roomId: roomId,
        type: MessageType.TRACK,
        trackUrl: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
      };

      client2.on('message', (message) => {
        if (message.type === MessageType.TRACK) {
          expect(message.trackRef).toBeDefined();
          expect(message.trackRef.platform).toBeDefined();
          expect(message.trackRef.title).toBeDefined();
          done();
        }
      });

      client1.emit('send_message', trackMessage);
    });

    it('should handle message threading', (done) => {
      let parentMessageId: string;

      // First, create a parent message
      client2.once('message', (parentMessage) => {
        parentMessageId = parentMessage.id;

        // Then send a reply
        const replyMessage = {
          roomId: roomId,
          type: MessageType.TEXT,
          text: 'This is a reply',
          parentId: parentMessageId,
        };

        client2.once('message', (replyMsg) => {
          if (replyMsg.parentId === parentMessageId) {
            expect(replyMsg.text).toBe('This is a reply');
            expect(replyMsg.parentId).toBe(parentMessageId);
            done();
          }
        });

        client1.emit('send_message', replyMessage);
      });

      // Send parent message
      client1.emit('send_message', {
        roomId: roomId,
        type: MessageType.TEXT,
        text: 'Parent message',
      });
    });
  });

  describe('Reactions', () => {
    let testMessageId: string;

    beforeAll(async () => {
      // Create a test message
      const message = await prismaService.message.create({
        data: {
          roomId: roomId,
          userId: userId1,
          type: MessageType.TEXT,
          text: 'Message for reaction test',
        },
      });
      testMessageId = message.id;
    });

    it('should broadcast reaction additions', (done) => {
      const reactionData = {
        messageId: testMessageId,
        emoji: '👍',
      };

      client2.on('reaction_added', (reaction) => {
        expect(reaction.emoji).toBe('👍');
        expect(reaction.messageId).toBe(testMessageId);
        expect(reaction.userId).toBe(userId1);
        done();
      });

      client1.emit('add_reaction', reactionData);
    });

    it('should broadcast reaction removals', (done) => {
      const reactionData = {
        messageId: testMessageId,
        emoji: '❤️',
      };

      // First add a reaction
      client1.emit('add_reaction', reactionData);

      // Wait a bit then remove it
      setTimeout(() => {
        client2.on('reaction_removed', (reaction) => {
          expect(reaction.emoji).toBe('❤️');
          expect(reaction.messageId).toBe(testMessageId);
          done();
        });

        client1.emit('remove_reaction', reactionData);
      }, 100);
    });
  });

  describe('Room Management', () => {
    let newRoomId: string;

    it('should handle room joining', (done) => {
      // Create a new room first
      prismaService.room.create({
        data: {
          name: 'New WebSocket Room',
          type: RoomType.PUBLIC,
          createdBy: userId1,
        },
      }).then((room) => {
        newRoomId = room.id;

        client1.on('user_joined', (data) => {
          expect(data.roomId).toBe(newRoomId);
          expect(data.user.id).toBe(userId2);
          done();
        });

        client2.emit('join_room', { roomId: newRoomId });
      });
    });

    it('should handle room leaving', (done) => {
      client1.on('user_left', (data) => {
        expect(data.roomId).toBe(newRoomId);
        expect(data.user.id).toBe(userId2);
        done();
      });

      client2.emit('leave_room', { roomId: newRoomId });
    });
  });

  describe('Typing Indicators', () => {
    it('should broadcast typing indicators', (done) => {
      client2.on('typing', (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(userId1);
        expect(data.isTyping).toBe(true);
        done();
      });

      client1.emit('typing', {
        roomId: roomId,
        isTyping: true,
      });
    });

    it('should not receive own typing indicators', (done) => {
      let receivedOwnTyping = false;

      client1.on('typing', () => {
        receivedOwnTyping = true;
      });

      client1.emit('typing', {
        roomId: roomId,
        isTyping: true,
      });

      // Wait a bit to ensure no typing event is received
      setTimeout(() => {
        expect(receivedOwnTyping).toBe(false);
        done();
      }, 200);
    });
  });

  describe('Authentication and Security', () => {
    it('should reject connections with invalid tokens', (done) => {
      const invalidClient = io(`http://localhost:3000`, {
        auth: { token: 'invalid-token' },
        transports: ['websocket'],
      });

      invalidClient.on('connect_error', (error) => {
        expect(error).toBeDefined();
        invalidClient.disconnect();
        done();
      });

      invalidClient.on('connect', () => {
        fail('Should not connect with invalid token');
      });
    });

    it('should reject operations from non-room members', (done) => {
      // Create a room that user2 is not a member of
      prismaService.room.create({
        data: {
          name: 'Private Room',
          type: RoomType.PRIVATE,
          createdBy: userId1,
        },
      }).then((privateRoom) => {
        client2.on('error', (error) => {
          expect(error.message).toContain('not a member');
          done();
        });

        // Try to send message to private room
        client2.emit('send_message', {
          roomId: privateRoom.id,
          type: MessageType.TEXT,
          text: 'This should fail',
        });
      });
    });
  });

  describe('Performance and Latency', () => {
    it('should maintain sub-200ms message delivery', (done) => {
      const startTime = Date.now();

      client2.on('message', () => {
        const latency = Date.now() - startTime;
        expect(latency).toBeLessThan(200);
        done();
      });

      client1.emit('send_message', {
        roomId: roomId,
        type: MessageType.TEXT,
        text: 'Latency test message',
      });
    });

    it('should handle concurrent messages without data loss', async () => {
      const messageCount = 10;
      const receivedMessages: any[] = [];

      return new Promise((resolve) => {
        client2.on('message', (message) => {
          if (message.text?.includes('Concurrent test')) {
            receivedMessages.push(message);
            if (receivedMessages.length === messageCount) {
              expect(receivedMessages.length).toBe(messageCount);
              resolve(undefined);
            }
          }
        });

        // Send multiple messages concurrently
        for (let i = 0; i < messageCount; i++) {
          client1.emit('send_message', {
            roomId: roomId,
            type: MessageType.TEXT,
            text: `Concurrent test message ${i}`,
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed message data', (done) => {
      client1.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });

      // Send malformed data
      client1.emit('send_message', {
        roomId: roomId,
        // Missing required type field
        text: 'Malformed message',
      });
    });

    it('should handle connection drops gracefully', async () => {
      // Simulate connection drop and reconnection
      client1.disconnect();

      await new Promise(resolve => setTimeout(resolve, 100));

      client1.connect();

      return new Promise(resolve => {
        client1.on('connect', () => {
          expect(client1.connected).toBe(true);
          resolve(undefined);
        });
      });
    });
  });
});