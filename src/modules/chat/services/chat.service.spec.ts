import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../../config/prisma.service';
import { MusicUnfurlService } from './music-unfurl.service';
import { MentionsService } from './mentions.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MessageType, RoomType } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: PrismaService;
  let musicUnfurlService: MusicUnfurlService;
  let mentionsService: MentionsService;

  const mockPrismaService = {
    room: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    roomMembership: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    reaction: {
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockMusicUnfurlService = {
    unfurlTrack: jest.fn(),
  };

  const mockMentionsService = {
    processMentions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MusicUnfurlService, useValue: mockMusicUnfurlService },
        { provide: MentionsService, useValue: mockMentionsService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
    musicUnfurlService = module.get<MusicUnfurlService>(MusicUnfurlService);
    mentionsService = module.get<MentionsService>(MentionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a new room with valid data', async () => {
      const userId = 'user-123';
      const createRoomDto = {
        name: 'Test Room',
        description: 'A test room',
        type: RoomType.PUBLIC,
      };

      const mockRoom = {
        id: 'room-123',
        name: 'Test Room',
        description: 'A test room',
        type: RoomType.PUBLIC,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.room.create.mockResolvedValue(mockRoom);

      const result = await service.createRoom(userId, createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(mockPrismaService.room.create).toHaveBeenCalledWith({
        data: {
          ...createRoomDto,
          createdBy: userId,
        },
        include: {
          creator: true,
          _count: {
            select: { members: true, messages: true },
          },
        },
      });
    });
  });

  describe('sendMessage', () => {
    it('should send a text message successfully', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const messageDto = {
        type: MessageType.TEXT,
        text: 'Hello world!',
      };

      const mockMembership = { userId, roomId };
      const mockMessage = {
        id: 'msg-123',
        roomId,
        userId,
        type: MessageType.TEXT,
        text: 'Hello world!',
        createdAt: new Date(),
      };

      mockPrismaService.roomMembership.findFirst.mockResolvedValue(mockMembership);
      mockPrismaService.message.create.mockResolvedValue(mockMessage);
      mockMentionsService.processMentions.mockResolvedValue([]);

      const result = await service.sendMessage(userId, roomId, messageDto);

      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.message.create).toHaveBeenCalledWith({
        data: {
          roomId,
          userId,
          type: MessageType.TEXT,
          text: 'Hello world!',
        },
        include: {
          user: true,
          parent: true,
          reactions: {
            include: { user: true },
          },
        },
      });
    });

    it('should throw BadRequestException if user is not a member', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const messageDto = {
        type: MessageType.TEXT,
        text: 'Hello world!',
      };

      mockPrismaService.roomMembership.findFirst.mockResolvedValue(null);

      await expect(service.sendMessage(userId, roomId, messageDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should unfurl music links for TRACK messages', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const messageDto = {
        type: MessageType.TRACK,
        trackUrl: 'https://open.spotify.com/track/123',
      };

      const mockMembership = { userId, roomId };
      const mockTrackRef = {
        platform: 'spotify',
        title: 'Test Song',
        artist: 'Test Artist',
        url: 'https://open.spotify.com/track/123',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      };
      const mockMessage = {
        id: 'msg-123',
        roomId,
        userId,
        type: MessageType.TRACK,
        trackRef: mockTrackRef,
        createdAt: new Date(),
      };

      mockPrismaService.roomMembership.findFirst.mockResolvedValue(mockMembership);
      mockMusicUnfurlService.unfurlTrack.mockResolvedValue(mockTrackRef);
      mockPrismaService.message.create.mockResolvedValue(mockMessage);
      mockMentionsService.processMentions.mockResolvedValue([]);

      const result = await service.sendMessage(userId, roomId, messageDto);

      expect(mockMusicUnfurlService.unfurlTrack).toHaveBeenCalledWith(
        'https://open.spotify.com/track/123',
      );
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages for a room', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const paginationDto = { limit: 20, cursor: undefined };

      const mockMembership = { userId, roomId };
      const mockMessages = [
        {
          id: 'msg-1',
          text: 'Message 1',
          createdAt: new Date(),
        },
        {
          id: 'msg-2',
          text: 'Message 2',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.roomMembership.findFirst.mockResolvedValue(mockMembership);
      mockPrismaService.message.findMany.mockResolvedValue(mockMessages);

      const result = await service.getMessages(userId, roomId, paginationDto);

      expect(result.messages).toEqual(mockMessages);
      expect(result.hasMore).toBe(false);
    });

    it('should throw BadRequestException if user is not a member', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const paginationDto = { limit: 20 };

      mockPrismaService.roomMembership.findFirst.mockResolvedValue(null);

      await expect(
        service.getMessages(userId, roomId, paginationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addReaction', () => {
    it('should add a reaction to a message', async () => {
      const userId = 'user-123';
      const messageId = 'msg-123';
      const emoji = '👍';

      const mockMessage = {
        id: messageId,
        roomId: 'room-123',
      };
      const mockMembership = { userId, roomId: 'room-123' };
      const mockReaction = {
        id: 'reaction-123',
        messageId,
        userId,
        emoji,
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
      mockPrismaService.roomMembership.findFirst.mockResolvedValue(mockMembership);
      mockPrismaService.reaction.findFirst.mockResolvedValue(null);
      mockPrismaService.reaction.create.mockResolvedValue(mockReaction);

      const result = await service.addReaction(userId, messageId, emoji);

      expect(result).toEqual(mockReaction);
      expect(mockPrismaService.reaction.create).toHaveBeenCalledWith({
        data: {
          messageId,
          userId,
          emoji,
        },
        include: {
          user: true,
        },
      });
    });

    it('should throw NotFoundException if message does not exist', async () => {
      const userId = 'user-123';
      const messageId = 'msg-123';
      const emoji = '👍';

      mockPrismaService.message.findUnique.mockResolvedValue(null);

      await expect(service.addReaction(userId, messageId, emoji)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if reaction already exists', async () => {
      const userId = 'user-123';
      const messageId = 'msg-123';
      const emoji = '👍';

      const mockMessage = {
        id: messageId,
        roomId: 'room-123',
      };
      const mockMembership = { userId, roomId: 'room-123' };
      const existingReaction = {
        id: 'reaction-123',
        messageId,
        userId,
        emoji,
      };

      mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
      mockPrismaService.roomMembership.findFirst.mockResolvedValue(mockMembership);
      mockPrismaService.reaction.findFirst.mockResolvedValue(existingReaction);

      await expect(service.addReaction(userId, messageId, emoji)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('joinRoom', () => {
    it('should allow user to join a public room', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';

      const mockRoom = {
        id: roomId,
        type: RoomType.PUBLIC,
      };
      const mockMembership = {
        id: 'membership-123',
        userId,
        roomId,
        joinedAt: new Date(),
      };

      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.roomMembership.findFirst.mockResolvedValue(null);
      mockPrismaService.roomMembership.create.mockResolvedValue(mockMembership);

      const result = await service.joinRoom(userId, roomId);

      expect(result).toEqual(mockMembership);
      expect(mockPrismaService.roomMembership.create).toHaveBeenCalledWith({
        data: {
          userId,
          roomId,
        },
        include: {
          user: true,
          room: true,
        },
      });
    });

    it('should throw NotFoundException if room does not exist', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';

      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.joinRoom(userId, roomId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is already a member', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';

      const mockRoom = {
        id: roomId,
        type: RoomType.PUBLIC,
      };
      const existingMembership = {
        userId,
        roomId,
      };

      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.roomMembership.findFirst.mockResolvedValue(
        existingMembership,
      );

      await expect(service.joinRoom(userId, roomId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});