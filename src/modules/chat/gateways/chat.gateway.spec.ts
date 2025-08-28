import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from '../services/chat.service';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { MessageType } from '@prisma/client';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let jwtService: JwtService;

  const mockChatService = {
    sendMessage: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
    deleteMessage: jest.fn(),
    editMessage: jest.fn(),
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    getUserRooms: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-123',
    handshake: {
      auth: {
        token: 'valid-jwt-token',
      },
    },
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    except: jest.fn().mockReturnThis(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    except: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    jwtService = module.get<JwtService>(JwtService);

    gateway.server = mockServer as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate and join user rooms on connection', async () => {
      const mockPayload = { sub: 'user-123', email: 'test@example.com' };
      const mockRooms = [
        { id: 'room-1', name: 'Room 1' },
        { id: 'room-2', name: 'Room 2' },
      ];

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockChatService.getUserRooms.mockResolvedValue(mockRooms);

      await gateway.handleConnection(mockSocket as any);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockChatService.getUserRooms).toHaveBeenCalledWith('user-123');
      expect(mockSocket.join).toHaveBeenCalledWith('room-1');
      expect(mockSocket.join).toHaveBeenCalledWith('room-2');
    });

    it('should disconnect invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket as any);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle missing token', async () => {
      const socketWithoutToken = {
        ...mockSocket,
        handshake: { auth: {} },
      };

      await gateway.handleConnection(socketWithoutToken as any);

      expect(socketWithoutToken.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleSendMessage', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-123']),
      });
    });

    it('should send a message and emit to room', async () => {
      const messageData = {
        roomId: 'room-123',
        type: MessageType.TEXT,
        text: 'Hello world!',
      };

      const mockMessage = {
        id: 'msg-123',
        ...messageData,
        userId: 'user-123',
        createdAt: new Date(),
        user: { id: 'user-123', name: 'Test User' },
      };

      mockChatService.sendMessage.mockResolvedValue(mockMessage);

      await gateway.handleSendMessage(mockSocket as any, messageData);

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'user-123',
        'room-123',
        messageData,
      );
      expect(mockServer.to).toHaveBeenCalledWith('room-123');
      expect(mockServer.emit).toHaveBeenCalledWith('message', mockMessage);
    });

    it('should throw WsException for unauthenticated user', async () => {
      const unauthenticatedSocket = { id: 'socket-456' };
      const messageData = {
        roomId: 'room-123',
        type: MessageType.TEXT,
        text: 'Hello world!',
      };

      await expect(
        gateway.handleSendMessage(unauthenticatedSocket as any, messageData),
      ).rejects.toThrow(WsException);
    });

    it('should handle service errors gracefully', async () => {
      const messageData = {
        roomId: 'room-123',
        type: MessageType.TEXT,
        text: 'Hello world!',
      };

      mockChatService.sendMessage.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        gateway.handleSendMessage(mockSocket as any, messageData),
      ).rejects.toThrow(WsException);
    });
  });

  describe('handleAddReaction', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-123']),
      });
    });

    it('should add a reaction and emit to room', async () => {
      const reactionData = {
        messageId: 'msg-123',
        emoji: '👍',
      };

      const mockReaction = {
        id: 'reaction-123',
        messageId: 'msg-123',
        userId: 'user-123',
        emoji: '👍',
        user: { id: 'user-123', name: 'Test User' },
      };

      mockChatService.addReaction.mockResolvedValue(mockReaction);

      await gateway.handleAddReaction(mockSocket as any, reactionData);

      expect(mockChatService.addReaction).toHaveBeenCalledWith(
        'user-123',
        'msg-123',
        '👍',
      );
      expect(mockServer.emit).toHaveBeenCalledWith('reaction_added', mockReaction);
    });
  });

  describe('handleJoinRoom', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(),
      });
    });

    it('should join a room and add to socket rooms', async () => {
      const joinData = { roomId: 'room-456' };
      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        roomId: 'room-456',
        room: { id: 'room-456', name: 'New Room' },
      };

      mockChatService.joinRoom.mockResolvedValue(mockMembership);

      await gateway.handleJoinRoom(mockSocket as any, joinData);

      expect(mockChatService.joinRoom).toHaveBeenCalledWith('user-123', 'room-456');
      expect(mockSocket.join).toHaveBeenCalledWith('room-456');
      expect(mockServer.to).toHaveBeenCalledWith('room-456');
      expect(mockServer.emit).toHaveBeenCalledWith('user_joined', {
        roomId: 'room-456',
        user: { id: 'user-123' },
      });
    });
  });

  describe('handleLeaveRoom', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-123']),
      });
    });

    it('should leave a room and remove from socket rooms', async () => {
      const leaveData = { roomId: 'room-123' };

      mockChatService.leaveRoom.mockResolvedValue(undefined);

      await gateway.handleLeaveRoom(mockSocket as any, leaveData);

      expect(mockChatService.leaveRoom).toHaveBeenCalledWith('user-123', 'room-123');
      expect(mockSocket.leave).toHaveBeenCalledWith('room-123');
      expect(mockServer.to).toHaveBeenCalledWith('room-123');
      expect(mockServer.emit).toHaveBeenCalledWith('user_left', {
        roomId: 'room-123',
        user: { id: 'user-123' },
      });
    });
  });

  describe('handleTyping', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-123']),
      });
    });

    it('should emit typing indicator to room excluding sender', async () => {
      const typingData = { roomId: 'room-123', isTyping: true };

      await gateway.handleTyping(mockSocket as any, typingData);

      expect(mockServer.to).toHaveBeenCalledWith('room-123');
      expect(mockServer.except).toHaveBeenCalledWith('socket-123');
      expect(mockServer.emit).toHaveBeenCalledWith('typing', {
        roomId: 'room-123',
        userId: 'user-123',
        isTyping: true,
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user data on disconnect', async () => {
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-123']),
      });

      await gateway.handleDisconnect(mockSocket as any);

      expect(gateway['connectedUsers'].has('socket-123')).toBe(false);
    });
  });

  describe('validateUserInRoom', () => {
    it('should return true for user in room', () => {
      const userConnection = {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-123', 'room-456']),
      };

      const result = gateway['validateUserInRoom'](userConnection, 'room-123');
      expect(result).toBe(true);
    });

    it('should return false for user not in room', () => {
      const userConnection = {
        userId: 'user-123',
        socketId: 'socket-123',
        userRooms: new Set(['room-456']),
      };

      const result = gateway['validateUserInRoom'](userConnection, 'room-123');
      expect(result).toBe(false);
    });
  });
});