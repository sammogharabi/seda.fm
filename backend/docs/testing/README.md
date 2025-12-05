# Testing Strategy - seda.fm

## 🧪 Overview

seda.fm implements a comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, performance tests, and security tests. Our goal is 80%+ code coverage with fast, reliable, and maintainable tests.

## 🏗️ Testing Architecture

### **Testing Pyramid**
```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← Few, slow, high-confidence
                    │   (5-10%)       │
                ┌───┴─────────────────┴───┐
                │  Integration Tests      │ ← Some, medium speed
                │     (20-30%)            │
            ┌───┴─────────────────────────┴───┐
            │      Unit Tests                 │ ← Many, fast, focused  
            │       (60-70%)                  │
            └─────────────────────────────────┘
```

### **Test Types**
- **Unit Tests**: Individual functions, services, components
- **Integration Tests**: Database operations, API endpoints
- **E2E Tests**: Full user workflows, critical paths
- **Performance Tests**: Load testing, stress testing
- **Security Tests**: Vulnerability scanning, penetration testing
- **Contract Tests**: API contract validation

## 🎯 Testing Standards

### **Coverage Targets**
- **Unit Tests**: 80% minimum coverage
- **Critical Paths**: 95% coverage (auth, payments, chat)
- **New Features**: 100% coverage requirement
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All user journeys covered

### **Test Quality Standards**
- **Fast**: Unit tests < 50ms, Integration tests < 500ms
- **Reliable**: < 1% flaky test rate
- **Maintainable**: Clear test names, DRY principles
- **Isolated**: No test dependencies, proper cleanup
- **Comprehensive**: Happy path + edge cases + error scenarios

## 🔧 Testing Tools & Framework

### **Core Testing Stack**
```json
{
  "jest": "^29.5.0",           // Test runner and assertion library
  "supertest": "^6.3.3",       // HTTP testing
  "@nestjs/testing": "^10.0.0", // NestJS testing utilities  
  "testcontainers": "^9.0.0",  // Database testing with real DB
  "socket.io-client": "^4.7.0", // WebSocket testing
  "faker": "^8.0.0",           // Test data generation
  "nock": "^13.3.0"            // HTTP mocking
}
```

### **Additional Tools**
- **Artillery**: Performance testing
- **OWASP ZAP**: Security testing
- **Pact**: Contract testing
- **Cypress**: E2E testing (alternative to Playwright)
- **k6**: Load testing

## 📁 Test Organization

### **Directory Structure**
```
src/
├── modules/
│   ├── chat/
│   │   ├── __tests__/           # Unit tests
│   │   │   ├── chat.service.spec.ts
│   │   │   ├── chat.gateway.spec.ts
│   │   │   └── music-unfurling.service.spec.ts
│   │   ├── __integration__/     # Integration tests
│   │   │   ├── chat.controller.integration.spec.ts
│   │   │   └── websocket.integration.spec.ts
│   │   └── chat.service.ts
│   └── verification/
│       ├── __tests__/
│       └── verification.service.spec.ts
test/
├── e2e/                        # End-to-end tests
│   ├── auth.e2e-spec.ts
│   ├── chat.e2e-spec.ts
│   └── verification.e2e-spec.ts
├── performance/                # Performance tests
│   ├── load-test.js
│   └── stress-test.js
├── fixtures/                   # Test data
│   ├── users.json
│   └── messages.json
└── helpers/                    # Test utilities
    ├── test-database.ts
    ├── mock-factories.ts
    └── test-server.ts
```

## 🧪 Testing Implementation

### **Unit Testing Example**
```typescript
// src/modules/chat/__tests__/chat.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../services/chat.service';
import { PrismaService } from '../../../config/prisma.service';
import { MusicUnfurlingService } from '../services/music-unfurling.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;
  let musicService: MusicUnfurlingService;

  const mockPrisma = {
    room: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    roomMembership: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockMusicService = {
    detectMusicLinks: jest.fn(),
    unfurlMusicLink: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MusicUnfurlingService, useValue: mockMusicService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
    musicService = module.get<MusicUnfurlingService>(MusicUnfurlingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should create a text message successfully', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const messageDto = { text: 'Hello world', type: 'TEXT' };

      mockPrisma.roomMembership.findUnique.mockResolvedValue({ userId, roomId });
      mockPrisma.message.create.mockResolvedValue({
        id: 'msg-123',
        ...messageDto,
        userId,
        roomId,
        createdAt: new Date(),
      });

      const result = await service.sendMessage(userId, roomId, messageDto);

      expect(result).toHaveProperty('id', 'msg-123');
      expect(result.text).toBe('Hello world');
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          text: 'Hello world',
          userId,
          roomId,
        }),
        include: expect.any(Object),
      });
    });

    it('should auto-unfurl music links', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const messageDto = { 
        text: 'Check this out: https://open.spotify.com/track/123' 
      };

      mockPrisma.roomMembership.findUnique.mockResolvedValue({ userId, roomId });
      mockMusicService.detectMusicLinks.mockReturnValue(['https://open.spotify.com/track/123']);
      mockMusicService.unfurlMusicLink.mockResolvedValue({
        provider: 'spotify',
        title: 'Test Song',
        artist: 'Test Artist',
      });
      mockPrisma.message.create.mockResolvedValue({
        id: 'msg-123',
        type: 'TRACK_CARD',
        trackRef: { provider: 'spotify', title: 'Test Song' },
      });

      await service.sendMessage(userId, roomId, messageDto);

      expect(mockMusicService.detectMusicLinks).toHaveBeenCalledWith(messageDto.text);
      expect(mockMusicService.unfurlMusicLink).toHaveBeenCalledWith('https://open.spotify.com/track/123');
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'TRACK_CARD',
          trackRef: expect.any(String),
        }),
        include: expect.any(Object),
      });
    });

    it('should throw ForbiddenException if user not in room', async () => {
      const userId = 'user-123';
      const roomId = 'room-123';
      const messageDto = { text: 'Hello' };

      mockPrisma.roomMembership.findUnique.mockResolvedValue(null);

      await expect(service.sendMessage(userId, roomId, messageDto))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('createRoom', () => {
    it('should create room and add creator as moderator', async () => {
      const userId = 'user-123';
      const createRoomDto = { name: 'Test Room', description: 'A test room' };

      mockPrisma.room.create.mockResolvedValue({
        id: 'room-123',
        ...createRoomDto,
        createdBy: userId,
        memberships: [{ userId, isMod: true }],
      });

      const result = await service.createRoom(userId, createRoomDto);

      expect(result.name).toBe('Test Room');
      expect(result.createdBy).toBe(userId);
      expect(mockPrisma.room.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createRoomDto,
          createdBy: userId,
          memberships: {
            create: { userId, isMod: true },
          },
        }),
        include: expect.any(Object),
      });
    });
  });
});
```

### **Integration Testing Example**
```typescript
// src/modules/chat/__integration__/chat.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../config/prisma.service';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

describe('ChatController Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let container: StartedTestContainer;

  beforeAll(async () => {
    // Start test database container
    container = await new GenericContainer('postgres:15')
      .withEnvironment({
        POSTGRES_DB: 'test_db',
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_pass',
      })
      .withExposedPorts(5432)
      .start();

    const databaseUrl = `postgresql://test_user:test_pass@localhost:${container.getMappedPort(5432)}/test_db`;
    process.env.DATABASE_URL = databaseUrl;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    // Run migrations
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    // Run your actual migrations here
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
    await container.stop();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.message.deleteMany();
    await prisma.roomMembership.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /chat/rooms', () => {
    it('should create a room with authentication', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          supabaseId: 'test-supabase-id',
        },
      });

      const createRoomDto = {
        name: 'Integration Test Room',
        description: 'A room created in integration test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/chat/rooms')
        .set('Authorization', `Bearer mock-jwt-token-${user.id}`)
        .send(createRoomDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Integration Test Room');
      expect(response.body.createdBy).toBe(user.id);

      // Verify in database
      const roomInDb = await prisma.room.findUnique({
        where: { id: response.body.id },
        include: { memberships: true },
      });

      expect(roomInDb).toBeTruthy();
      expect(roomInDb.memberships).toHaveLength(1);
      expect(roomInDb.memberships[0].isMod).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/chat/rooms')
        .send({ name: 'Test Room' })
        .expect(401);
    });
  });

  describe('POST /chat/rooms/:roomId/messages', () => {
    it('should send a message to a room', async () => {
      // Setup: Create user and room
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          supabaseId: 'test-supabase-id',
        },
      });

      const room = await prisma.room.create({
        data: {
          name: 'Test Room',
          createdBy: user.id,
          memberships: {
            create: { userId: user.id, isMod: true },
          },
        },
      });

      const messageDto = {
        text: 'Hello from integration test',
        type: 'TEXT',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/rooms/${room.id}/messages`)
        .set('Authorization', `Bearer mock-jwt-token-${user.id}`)
        .send(messageDto)
        .expect(201);

      expect(response.body.text).toBe('Hello from integration test');
      expect(response.body.userId).toBe(user.id);
      expect(response.body.roomId).toBe(room.id);

      // Verify message was saved to database
      const messageInDb = await prisma.message.findUnique({
        where: { id: response.body.id },
      });

      expect(messageInDb).toBeTruthy();
      expect(messageInDb.text).toBe('Hello from integration test');
    });
  });
});
```

### **WebSocket Testing Example**
```typescript
// src/modules/chat/__integration__/websocket.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';
import { io, Socket } from 'socket.io-client';
import { PrismaService } from '../../../config/prisma.service';

describe('Chat WebSocket Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let client1: Socket;
  let client2: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.listen(0); // Random available port
    const address = app.getHttpServer().address();
    const baseUrl = `http://localhost:${address.port}`;

    // Create WebSocket clients
    client1 = io(`${baseUrl}/chat`, {
      auth: { token: 'mock-token-user1' },
      autoConnect: false,
    });

    client2 = io(`${baseUrl}/chat`, {
      auth: { token: 'mock-token-user2' },
      autoConnect: false,
    });
  });

  afterAll(async () => {
    client1.close();
    client2.close();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.message.deleteMany();
    await prisma.roomMembership.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should handle real-time message broadcasting', async () => {
    // Setup users and room
    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: { email: 'user1@test.com', supabaseId: 'user1' },
      }),
      prisma.user.create({
        data: { email: 'user2@test.com', supabaseId: 'user2' },
      }),
    ]);

    const room = await prisma.room.create({
      data: {
        name: 'WebSocket Test Room',
        createdBy: user1.id,
        memberships: {
          create: [
            { userId: user1.id, isMod: true },
            { userId: user2.id, isMod: false },
          ],
        },
      },
    });

    // Connect clients
    await Promise.all([
      new Promise(resolve => {
        client1.on('connect', resolve);
        client1.connect();
      }),
      new Promise(resolve => {
        client2.on('connect', resolve);
        client2.connect();
      }),
    ]);

    // Join room
    client1.emit('join_room', room.id);
    client2.emit('join_room', room.id);

    // Set up message listener on client2
    const messagePromise = new Promise(resolve => {
      client2.on('message_created', resolve);
    });

    // Send message from client1
    client1.emit('send_message', {
      roomId: room.id,
      text: 'Hello WebSocket!',
    });

    // Wait for message to be received by client2
    const receivedMessage = await messagePromise;

    expect(receivedMessage).toHaveProperty('text', 'Hello WebSocket!');
    expect(receivedMessage).toHaveProperty('userId', user1.id);
    expect(receivedMessage).toHaveProperty('roomId', room.id);

    // Verify message was saved to database
    const messagesInDb = await prisma.message.findMany({
      where: { roomId: room.id },
    });

    expect(messagesInDb).toHaveLength(1);
    expect(messagesInDb[0].text).toBe('Hello WebSocket!');
  });

  it('should handle typing indicators', async () => {
    const room = await setupRoomWithUsers();

    await connectClients();

    // Set up typing listener
    const typingPromise = new Promise(resolve => {
      client2.on('user_typing', resolve);
    });

    // Start typing
    client1.emit('typing_start', room.id);

    const typingEvent = await typingPromise;
    expect(typingEvent).toEqual([room.id, 'user1', true]);
  });
});
```

## 🚀 Running Tests

### **Test Commands**
```bash
# Unit tests
npm test                        # Run all unit tests
npm run test:watch             # Watch mode for development
npm run test:cov               # Run with coverage report

# Integration tests  
npm run test:integration       # Run integration tests
npm run test:int:watch         # Watch mode for integration

# End-to-end tests
npm run test:e2e              # Run E2E tests
npm run test:e2e:dev          # E2E tests against dev environment

# All tests
npm run test:all              # Run all test suites
npm run test:ci               # Run in CI mode (no watch, coverage)

# Performance tests
npm run test:load             # Load testing
npm run test:stress           # Stress testing

# Security tests
npm run test:security         # Security vulnerability scan
```

### **Test Configuration**
```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/modules/chat/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

## 📊 Continuous Testing

### **CI/CD Pipeline Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

## 🚀 Quick Start

### For New Features
```bash
# Generate test templates automatically
npm run generate:tests notification-service

# Start test-driven development
npm run test:watch

# Run all tests
npm run test:all

# Check coverage
npm run test:cov
```

### Daily Development Workflow
1. **Generate tests first**: `npm run generate:tests <feature-name>`
2. **Write failing tests**: Describe expected behavior
3. **Implement feature**: Make tests pass
4. **Refactor**: Keep tests green
5. **Verify coverage**: `npm run test:cov`
6. **Run CI checks**: `npm run lint && npm run typecheck`

### Test Commands Reference
- **Generate test templates**: `npm run generate:tests <feature-name>`
- **Run all tests**: `npm run test:all`
- **Run unit tests only**: `npm run test:unit`  
- **Run integration tests**: `npm run test:integration`
- **Run E2E tests**: `npm run test:e2e`
- **Get coverage report**: `npm run test:cov`
- **Run tests in watch mode**: `npm run test:watch`
- **Run CI test suite**: `npm run test:ci`

### Testing Requirements for All Features
- ✅ **Tests written first** (TDD approach)
- ✅ **80%+ code coverage** (enforced by CI/CD)
- ✅ **All error scenarios tested**
- ✅ **Security requirements validated**
- ✅ **Performance benchmarks met**

See [Development Workflow](./development-workflow.md) for complete testing process.

This comprehensive testing strategy ensures seda.fm is reliable, performant, and maintainable! 🧪✨