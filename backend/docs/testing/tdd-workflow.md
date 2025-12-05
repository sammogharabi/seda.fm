# Feature Testing Template

Copy this template for every new feature to ensure complete test coverage.

## Feature: [FEATURE_NAME]

### Testing Checklist

#### Unit Tests ✅
- [ ] Service layer methods
- [ ] Business logic functions  
- [ ] Data validation
- [ ] Error handling
- [ ] Edge cases (null, empty, invalid input)
- [ ] Mocked external dependencies

#### Integration Tests ✅
- [ ] API endpoints (all HTTP methods)
- [ ] Database interactions
- [ ] Authentication/authorization
- [ ] Request validation
- [ ] Response format
- [ ] Error responses (400, 401, 403, 404, 500)

#### E2E Tests ✅ (if applicable)
- [ ] WebSocket events
- [ ] Real-time updates
- [ ] Multi-user scenarios
- [ ] Performance requirements
- [ ] Connection handling

#### Security Tests ✅
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] CORS handling

## Test Implementation

### 1. Unit Test Structure
```typescript
// src/modules/[feature]/[feature].service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { [Feature]Service } from './[feature].service';

describe('[Feature]Service', () => {
  let service: [Feature]Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [Feature]Service,
        // Mock dependencies
      ],
    }).compile();

    service = module.get<[Feature]Service>([Feature]Service);
  });

  describe('method1', () => {
    it('should handle valid input', async () => {
      // Test implementation
    });

    it('should throw error for invalid input', async () => {
      // Error handling test
    });
  });
});
```

### 2. Integration Test Structure
```typescript
// test/[feature].integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('[Feature] Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/[feature]', () => {
    it('should create new [feature]', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/[feature]')
        .send(validData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/[feature]')
        .send(invalidData)
        .expect(400);
    });
  });
});
```

### 3. E2E Test Structure (WebSocket)
```typescript
// test/[feature]-websocket.e2e-spec.ts
import { io, Socket } from 'socket.io-client';

describe('[Feature] WebSocket E2E', () => {
  let client: Socket;

  beforeAll(async () => {
    client = io('http://localhost:3000', {
      auth: { token: validToken }
    });
    await new Promise(resolve => client.on('connect', resolve));
  });

  afterAll(() => {
    client?.disconnect();
  });

  it('should emit [feature] events', (done) => {
    client.on('[feature]_created', (data) => {
      expect(data).toBeDefined();
      done();
    });

    client.emit('create_[feature]', testData);
  });
});
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

### Critical Code Coverage
- **100% Required**: Authentication, authorization, payment processing
- **90% Required**: Core business logic, data validation  
- **80% Required**: API endpoints, service methods
- **70% Required**: Utility functions, helpers

## Test Data Management

### Test Factories
```typescript
// test/factories/[feature].factory.ts
export const create[Feature]Factory = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test Feature',
  createdAt: new Date(),
  ...overrides,
});
```

### Database Seeding
```typescript
// test/seeds/[feature].seed.ts  
export async function seed[Feature]Data(prisma: PrismaService) {
  return await prisma.[feature].create({
    data: create[Feature]Factory(),
  });
}
```

## Error Testing Scenarios

Test these error cases for every feature:

### Input Validation Errors
- [ ] Missing required fields
- [ ] Invalid data types
- [ ] Out-of-range values
- [ ] Malicious input (XSS, SQL injection attempts)

### Authentication/Authorization Errors  
- [ ] No auth token
- [ ] Invalid auth token
- [ ] Expired token
- [ ] Insufficient permissions

### Business Logic Errors
- [ ] Resource not found
- [ ] Duplicate creation attempts
- [ ] State conflicts
- [ ] Rate limit exceeded

### External Dependency Errors
- [ ] Database connection failure
- [ ] Third-party API failures
- [ ] Network timeouts
- [ ] Service unavailable

## Performance Testing

For features with performance requirements:

### Load Testing
```typescript
it('should handle concurrent requests', async () => {
  const requests = Array(50).fill(null).map(() =>
    request(app).post('/api/v1/[feature]').send(testData)
  );

  const responses = await Promise.all(requests);
  const successfulResponses = responses.filter(r => r.status === 201);
  
  expect(successfulResponses.length).toBeGreaterThan(40); // 80% success rate
});
```

### Latency Testing
```typescript
it('should respond within acceptable time', async () => {
  const startTime = Date.now();
  
  await request(app)
    .get('/api/v1/[feature]')
    .expect(200);
    
  const responseTime = Date.now() - startTime;
  expect(responseTime).toBeLessThan(500); // 500ms max
});
```

## Documentation Requirements

For every feature, update:

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Feature documentation in `/docs/features/`
- [ ] Test documentation
- [ ] README.md (if public interface changes)

## Review Checklist

Before marking feature complete:

- [ ] All tests pass locally
- [ ] Coverage meets minimum thresholds  
- [ ] No test pollution (tests pass when run in isolation)
- [ ] Performance requirements met
- [ ] Security tests included
- [ ] Error handling comprehensive
- [ ] Documentation updated
- [ ] CI/CD pipeline passes
- [ ] Code review completed

Remember: **Tests are not optional - they are part of the feature implementation.**