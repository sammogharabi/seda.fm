#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get feature name from command line arguments
const featureName = process.argv[2];
const modulePath = process.argv[3] || `modules/${featureName}`;

if (!featureName) {
  console.error('Usage: node scripts/generate-test-template.js <feature-name> [module-path]');
  console.error('Example: node scripts/generate-test-template.js notifications modules/notifications');
  process.exit(1);
}

// Convert kebab-case to PascalCase
const featureNamePascal = featureName
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

// Template for unit test
const unitTestTemplate = `import { Test, TestingModule } from '@nestjs/testing';
import { ${featureNamePascal}Service } from './${featureName}.service';
import { PrismaService } from '../../config/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('${featureNamePascal}Service', () => {
  let service: ${featureNamePascal}Service;
  let prismaService: PrismaService;

  const mockPrismaService = {
    ${featureName}: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${featureNamePascal}Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<${featureNamePascal}Service>(${featureNamePascal}Service);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create${featureNamePascal}', () => {
    it('should create a new ${featureName}', async () => {
      const createData = {
        // Add test data properties
        name: 'Test ${featureNamePascal}',
      };

      const mockResult = {
        id: '${featureName}-123',
        ...createData,
        createdAt: new Date(),
      };

      mockPrismaService.${featureName}.create.mockResolvedValue(mockResult);

      const result = await service.create${featureNamePascal}(createData);

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.${featureName}.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidData = {
        // Add invalid test data
      };

      await expect(service.create${featureNamePascal}(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('find${featureNamePascal}ById', () => {
    it('should return ${featureName} by id', async () => {
      const ${featureName}Id = '${featureName}-123';
      const mockResult = {
        id: ${featureName}Id,
        name: 'Test ${featureNamePascal}',
        createdAt: new Date(),
      };

      mockPrismaService.${featureName}.findUnique.mockResolvedValue(mockResult);

      const result = await service.find${featureNamePascal}ById(${featureName}Id);

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.${featureName}.findUnique).toHaveBeenCalledWith({
        where: { id: ${featureName}Id },
      });
    });

    it('should throw NotFoundException when ${featureName} not found', async () => {
      const ${featureName}Id = 'non-existent-id';

      mockPrismaService.${featureName}.findUnique.mockResolvedValue(null);

      await expect(service.find${featureNamePascal}ById(${featureName}Id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update${featureNamePascal}', () => {
    it('should update ${featureName}', async () => {
      const ${featureName}Id = '${featureName}-123';
      const updateData = {
        name: 'Updated ${featureNamePascal}',
      };

      const mockResult = {
        id: ${featureName}Id,
        ...updateData,
        updatedAt: new Date(),
      };

      mockPrismaService.${featureName}.update.mockResolvedValue(mockResult);

      const result = await service.update${featureNamePascal}(${featureName}Id, updateData);

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.${featureName}.update).toHaveBeenCalledWith({
        where: { id: ${featureName}Id },
        data: updateData,
      });
    });
  });

  describe('delete${featureNamePascal}', () => {
    it('should delete ${featureName}', async () => {
      const ${featureName}Id = '${featureName}-123';

      mockPrismaService.${featureName}.delete.mockResolvedValue({ id: ${featureName}Id });

      await service.delete${featureNamePascal}(${featureName}Id);

      expect(mockPrismaService.${featureName}.delete).toHaveBeenCalledWith({
        where: { id: ${featureName}Id },
      });
    });
  });
});
`;

// Template for integration test
const integrationTestTemplate = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('${featureNamePascal} Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let userToken: string;
  let userId: string;

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
    userId = 'test-user-${featureName}';
    userToken = jwtService.sign({ 
      sub: userId, 
      email: 'test@${featureName}.com' 
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.${featureName}.deleteMany({
      where: { userId: userId },
    });
    
    await app.close();
  });

  afterEach(async () => {
    // Clean up after each test
    await prismaService.${featureName}.deleteMany({
      where: { userId: userId },
    });
  });

  describe('POST /api/v1/${featureName}s', () => {
    it('should create a new ${featureName}', async () => {
      const create${featureNamePascal}Dto = {
        name: 'Integration Test ${featureNamePascal}',
        // Add other required fields
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/${featureName}s')
        .set('Authorization', \`Bearer \${userToken}\`)
        .send(create${featureNamePascal}Dto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(create${featureNamePascal}Dto.name);
      expect(response.body.userId).toBe(userId);
    });

    it('should require authentication', async () => {
      const create${featureNamePascal}Dto = {
        name: 'Test ${featureNamePascal}',
      };

      await request(app.getHttpServer())
        .post('/api/v1/${featureName}s')
        .send(create${featureNamePascal}Dto)
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/${featureName}s')
        .set('Authorization', \`Bearer \${userToken}\`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/${featureName}s/:id', () => {
    let ${featureName}Id: string;

    beforeEach(async () => {
      // Create test ${featureName}
      const ${featureName} = await prismaService.${featureName}.create({
        data: {
          name: 'Test ${featureNamePascal}',
          userId: userId,
        },
      });
      ${featureName}Id = ${featureName}.id;
    });

    it('should return ${featureName} by id', async () => {
      const response = await request(app.getHttpServer())
        .get(\`/api/v1/${featureName}s/\${${featureName}Id}\`)
        .set('Authorization', \`Bearer \${userToken}\`)
        .expect(200);

      expect(response.body.id).toBe(${featureName}Id);
      expect(response.body.name).toBe('Test ${featureNamePascal}');
    });

    it('should return 404 for non-existent ${featureName}', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/${featureName}s/non-existent-id')
        .set('Authorization', \`Bearer \${userToken}\`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(\`/api/v1/${featureName}s/\${${featureName}Id}\`)
        .expect(401);
    });
  });

  describe('PUT /api/v1/${featureName}s/:id', () => {
    let ${featureName}Id: string;

    beforeEach(async () => {
      const ${featureName} = await prismaService.${featureName}.create({
        data: {
          name: 'Original ${featureNamePascal}',
          userId: userId,
        },
      });
      ${featureName}Id = ${featureName}.id;
    });

    it('should update ${featureName}', async () => {
      const updateData = {
        name: 'Updated ${featureNamePascal}',
      };

      const response = await request(app.getHttpServer())
        .put(\`/api/v1/${featureName}s/\${${featureName}Id}\`)
        .set('Authorization', \`Bearer \${userToken}\`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent ${featureName}', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/${featureName}s/non-existent-id')
        .set('Authorization', \`Bearer \${userToken}\`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/${featureName}s/:id', () => {
    let ${featureName}Id: string;

    beforeEach(async () => {
      const ${featureName} = await prismaService.${featureName}.create({
        data: {
          name: 'To Delete ${featureNamePascal}',
          userId: userId,
        },
      });
      ${featureName}Id = ${featureName}.id;
    });

    it('should delete ${featureName}', async () => {
      await request(app.getHttpServer())
        .delete(\`/api/v1/${featureName}s/\${${featureName}Id}\`)
        .set('Authorization', \`Bearer \${userToken}\`)
        .expect(204);

      // Verify ${featureName} is deleted
      const deleted${featureNamePascal} = await prismaService.${featureName}.findUnique({
        where: { id: ${featureName}Id },
      });
      expect(deleted${featureNamePascal}).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const create${featureNamePascal}Dto = {
        name: 'Rate limit test',
      };

      // Send multiple requests rapidly
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/api/v1/${featureName}s')
          .set('Authorization', \`Bearer \${userToken}\`)
          .send(create${featureNamePascal}Dto)
      );

      const responses = await Promise.all(promises.map(p => p.catch(e => e.response)));
      
      // Should have some rate limited responses
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/${featureName}s')
        .set('Authorization', \`Bearer \${userToken}\`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should handle invalid JWT tokens', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/${featureName}s')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
`;

// Template for E2E WebSocket test (if applicable)
const websocketTestTemplate = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { io, Socket } from 'socket.io-client';

describe('${featureNamePascal} WebSocket E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let client1: Socket;
  let client2: Socket;
  let userToken1: string;
  let userToken2: string;
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await app.listen(0);
    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? 3000 : address?.port || 3000;

    // Create test users
    userId1 = 'test-user-${featureName}-1';
    userId2 = 'test-user-${featureName}-2';
    userToken1 = jwtService.sign({ sub: userId1, email: 'test1@${featureName}.com' });
    userToken2 = jwtService.sign({ sub: userId2, email: 'test2@${featureName}.com' });

    // Initialize WebSocket clients
    client1 = io(\`http://localhost:\${port}\`, {
      auth: { token: userToken1 },
      transports: ['websocket'],
    });

    client2 = io(\`http://localhost:\${port}\`, {
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
    client1?.disconnect();
    client2?.disconnect();

    // Clean up test data
    await prismaService.${featureName}.deleteMany({
      where: { userId: { in: [userId1, userId2] } },
    });

    await app.close();
  });

  describe('${featureNamePascal} Events', () => {
    it('should broadcast ${featureName} creation', (done) => {
      const ${featureName}Data = {
        name: 'WebSocket Test ${featureNamePascal}',
        // Add other required fields
      };

      client2.on('${featureName}_created', (data) => {
        expect(data.name).toBe(${featureName}Data.name);
        expect(data.userId).toBe(userId1);
        done();
      });

      client1.emit('create_${featureName}', ${featureName}Data);
    });

    it('should broadcast ${featureName} updates', (done) => {
      const updateData = {
        ${featureName}Id: '${featureName}-123',
        name: 'Updated ${featureNamePascal}',
      };

      client2.on('${featureName}_updated', (data) => {
        expect(data.name).toBe(updateData.name);
        done();
      });

      client1.emit('update_${featureName}', updateData);
    });

    it('should handle ${featureName} deletion', (done) => {
      const ${featureName}Id = '${featureName}-123';

      client2.on('${featureName}_deleted', (data) => {
        expect(data.${featureName}Id).toBe(${featureName}Id);
        done();
      });

      client1.emit('delete_${featureName}', { ${featureName}Id });
    });
  });

  describe('Real-time Updates', () => {
    it('should maintain sub-200ms latency', (done) => {
      const startTime = Date.now();

      client2.on('${featureName}_event', () => {
        const latency = Date.now() - startTime;
        expect(latency).toBeLessThan(200);
        done();
      });

      client1.emit('${featureName}_action', { data: 'test' });
    });

    it('should handle concurrent events', async () => {
      const eventCount = 5;
      const receivedEvents: any[] = [];

      return new Promise((resolve) => {
        client2.on('${featureName}_batch_event', (event) => {
          receivedEvents.push(event);
          if (receivedEvents.length === eventCount) {
            expect(receivedEvents.length).toBe(eventCount);
            resolve(undefined);
          }
        });

        // Send multiple events concurrently
        for (let i = 0; i < eventCount; i++) {
          client1.emit('${featureName}_batch_action', { index: i });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ${featureName} data', (done) => {
      client1.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });

      client1.emit('create_${featureName}', {
        // Missing required fields
      });
    });

    it('should reject unauthorized actions', (done) => {
      client1.on('unauthorized', (error) => {
        expect(error.message).toContain('permission');
        done();
      });

      client1.emit('admin_${featureName}_action', { data: 'test' });
    });
  });
});
`;

// Create directories
const srcPath = `src/${modulePath}`;
const testPath = 'test';

if (!fs.existsSync(srcPath)) {
  fs.mkdirSync(srcPath, { recursive: true });
}

if (!fs.existsSync(testPath)) {
  fs.mkdirSync(testPath, { recursive: true });
}

// Write test files
const unitTestPath = path.join(srcPath, `${featureName}.service.spec.ts`);
const integrationTestPath = path.join(testPath, `${featureName}.integration.spec.ts`);
const websocketTestPath = path.join(testPath, `${featureName}-websocket.e2e-spec.ts`);

fs.writeFileSync(unitTestPath, unitTestTemplate);
fs.writeFileSync(integrationTestPath, integrationTestTemplate);
fs.writeFileSync(websocketTestPath, websocketTestTemplate);

// Create test checklist file
const checklistTemplate = `# ${featureNamePascal} Testing Checklist

## Unit Tests ✅
- [ ] \`${featureName}.service.spec.ts\` created
- [ ] All service methods tested
- [ ] Error scenarios covered
- [ ] Edge cases included
- [ ] Mocks properly configured
- [ ] 85%+ coverage achieved

## Integration Tests ✅
- [ ] \`${featureName}.integration.spec.ts\` created
- [ ] All API endpoints tested (GET, POST, PUT, DELETE)
- [ ] Authentication/authorization tested
- [ ] Request validation tested
- [ ] Rate limiting tested
- [ ] Error handling tested

## E2E Tests ✅
- [ ] \`${featureName}-websocket.e2e-spec.ts\` created (if applicable)
- [ ] Real-time events tested
- [ ] WebSocket connection handling
- [ ] Performance requirements verified
- [ ] Multi-user scenarios covered

## Security Tests ✅
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks implemented
- [ ] Input sanitization verified
- [ ] Rate limiting functional
- [ ] No data leakage between users

## Documentation ✅
- [ ] Feature documentation updated
- [ ] API documentation updated (Swagger)
- [ ] Test scenarios documented
- [ ] Coverage requirements noted

## Next Steps

1. Implement the actual ${featureNamePascal} service and controller
2. Run tests frequently during development: \`npm run test:watch\`
3. Ensure all tests pass: \`npm run test:all\`
4. Check coverage: \`npm run test:cov\`
5. Update tests as implementation evolves
6. Verify CI/CD pipeline passes

## Test Commands

\`\`\`bash
# Run unit tests for this feature
npm test -- --testPathPattern="${featureName}.service.spec.ts"

# Run integration tests
npm test -- --testPathPattern="${featureName}.integration.spec.ts"

# Run E2E tests
npm test -- --testPathPattern="${featureName}-websocket.e2e-spec.ts"

# Run all tests for this feature
npm test -- --testPathPattern="${featureName}"

# Check coverage
npm run test:cov
\`\`\`

## Notes

- Tests are written first (TDD approach)
- All tests should be independent and isolated
- Use meaningful test descriptions
- Focus on testing behavior, not implementation
- Update tests when requirements change
`;

const checklistPath = path.join(testPath, `${featureName}-test-checklist.md`);
fs.writeFileSync(checklistPath, checklistTemplate);

console.log(`✅ Test templates generated for ${featureNamePascal}:`);
console.log(`   📁 Unit test: ${unitTestPath}`);
console.log(`   📁 Integration test: ${integrationTestPath}`);
console.log(`   📁 E2E test: ${websocketTestPath}`);
console.log(`   📁 Test checklist: ${checklistPath}`);
console.log('');
console.log('Next steps:');
console.log(`1. Implement ${featureNamePascal}Service and ${featureNamePascal}Controller`);
console.log('2. Run tests in watch mode: npm run test:watch');
console.log('3. Follow the test checklist to ensure complete coverage');
console.log('4. Update tests as you develop the feature');
console.log('');
console.log('Happy test-driven development! 🚀');