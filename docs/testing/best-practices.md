# Testing Best Practices

This document outlines the testing best practices for the sedā.fm authentication service.

## General Principles

### 1. Test Pyramid
Follow the test pyramid structure:
- **Unit Tests (70%)**: Fast, isolated tests for individual functions/methods
- **Integration Tests (20%)**: Test interactions between components
- **E2E Tests (10%)**: Full system tests through the API/UI

### 2. AAA Pattern
Structure all tests using the Arrange-Act-Assert pattern:
```typescript
it('should create user successfully', async () => {
  // Arrange
  const userData = { email: 'test@example.com', name: 'Test User' };
  
  // Act
  const result = await userService.createUser(userData);
  
  // Assert
  expect(result).toHaveProperty('id');
  expect(result.email).toBe(userData.email);
});
```

### 3. Test Naming
Use descriptive test names that explain the scenario:
- ✅ `should throw ConflictException when user already exists`
- ❌ `test user creation error`

### 4. Test Independence
Each test should be independent and able to run in isolation:
- Use `beforeEach`/`afterEach` for setup/cleanup
- Don't rely on test execution order
- Clean up test data after each test

## Unit Testing

### Service Testing
Mock all external dependencies:
```typescript
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      UserService,
      { provide: PrismaService, useValue: mockPrismaService },
    ],
  }).compile();
});
```

### Controller Testing
Test request/response handling:
```typescript
it('should return user data on GET /users/:id', async () => {
  const mockUser = { id: '123', name: 'Test User' };
  mockUserService.findById.mockResolvedValue(mockUser);

  const result = await controller.getUser('123');

  expect(result).toEqual(mockUser);
  expect(mockUserService.findById).toHaveBeenCalledWith('123');
});
```

### Testing Guidelines
- **Mock external services**: Database, HTTP clients, file system
- **Test edge cases**: Null values, empty arrays, validation errors
- **Test error handling**: Ensure proper exceptions are thrown
- **Use type safety**: Leverage TypeScript for better test reliability

## Integration Testing

### Database Testing
Use test containers or in-memory databases:
```typescript
// Use actual Prisma with test database
const prismaService = app.get(PrismaService);

beforeEach(async () => {
  // Clean database before each test
  await prismaService.user.deleteMany();
});
```

### HTTP Testing
Test actual HTTP endpoints:
```typescript
it('should create user via POST /users', async () => {
  const userData = { email: 'test@example.com', name: 'Test' };

  const response = await request(app.getHttpServer())
    .post('/users')
    .send(userData)
    .expect(201);

  expect(response.body).toHaveProperty('id');
});
```

## E2E Testing

### WebSocket Testing
Test real-time features:
```typescript
it('should broadcast messages to room members', (done) => {
  const message = { roomId: 'room-1', text: 'Hello' };

  client2.on('message', (receivedMessage) => {
    expect(receivedMessage.text).toBe(message.text);
    done();
  });

  client1.emit('send_message', message);
});
```

### Performance Testing
Include basic performance checks:
```typescript
it('should handle concurrent requests', async () => {
  const requests = Array(10).fill(null).map(() =>
    request(app).get('/api/health')
  );

  const responses = await Promise.all(requests);
  
  responses.forEach(response => {
    expect(response.status).toBe(200);
  });
});
```

## Mock Strategies

### 1. Service Mocks
Create reusable mock objects:
```typescript
export const createMockUserService = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});
```

### 2. Data Factories
Use factories for test data:
```typescript
export const createUserFactory = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  ...overrides,
});
```

### 3. Axios Mocking
Mock HTTP requests consistently:
```typescript
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.get.mockResolvedValue({ data: mockResponse });
```

## Test Data Management

### 1. Database Seeding
Create seed data for integration tests:
```typescript
async function seedTestData() {
  const user = await prisma.user.create({
    data: { email: 'test@example.com', name: 'Test User' }
  });
  return { user };
}
```

### 2. Cleanup Strategies
Always clean up after tests:
```typescript
afterEach(async () => {
  await prisma.message.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
});
```

### 3. Isolation
Use transactions for test isolation:
```typescript
describe('User Service', () => {
  let transaction: PrismaTransaction;

  beforeEach(async () => {
    transaction = prisma.$transaction(async (tx) => {
      // Run tests within transaction
      // Transaction is automatically rolled back
    });
  });
});
```

## Error Testing

### 1. Exception Testing
Test all error paths:
```typescript
it('should throw NotFoundException when user not found', async () => {
  mockPrisma.user.findUnique.mockResolvedValue(null);

  await expect(service.findById('invalid-id'))
    .rejects.toThrow(NotFoundException);
});
```

### 2. Validation Testing
Test input validation:
```typescript
it('should reject invalid email format', async () => {
  const invalidData = { email: 'invalid-email', name: 'Test' };

  await request(app)
    .post('/users')
    .send(invalidData)
    .expect(400);
});
```

### 3. Rate Limiting
Test security features:
```typescript
it('should enforce rate limits', async () => {
  // Make multiple requests rapidly
  const promises = Array(10).fill(null).map(() =>
    request(app).post('/messages').send(messageData)
  );

  const responses = await Promise.all(promises);
  const rateLimited = responses.filter(r => r.status === 429);
  
  expect(rateLimited.length).toBeGreaterThan(0);
});
```

## CI/CD Best Practices

### 1. Test Environment
- Use consistent Node.js and database versions
- Set proper environment variables
- Use secrets management for API keys

### 2. Test Execution
```yaml
# Run tests in parallel when possible
npm run test:unit &
npm run test:integration &
wait
npm run test:e2e
```

### 3. Coverage Requirements
- Maintain minimum 80% code coverage
- Focus on critical business logic
- Don't chase 100% coverage at the expense of meaningful tests

### 4. Test Reports
- Generate coverage reports
- Save test artifacts for debugging
- Integrate with code quality tools

## Debugging Tests

### 1. Test Debugging
Use VS Code debugging:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### 2. Logging in Tests
Use appropriate logging:
```typescript
// Use console.log sparingly in tests
it('should process data', () => {
  console.log('Test data:', testData); // Remove before commit
  
  // Better: Use descriptive test names and assertions
  expect(result).toMatchObject(expectedStructure);
});
```

### 3. Test Isolation Issues
Debug test interdependencies:
```bash
# Run tests in random order to catch dependencies
npm test -- --runInBand --randomize

# Run specific test file
npm test -- user.service.spec.ts
```

## Performance Guidelines

### 1. Test Speed
- Keep unit tests under 50ms each
- Use mocks to avoid slow operations
- Parallelize test execution when possible

### 2. Resource Management
- Clean up resources in afterEach/afterAll
- Use connection pooling for database tests
- Limit concurrent test execution

### 3. Test Size
- Keep test files under 500 lines
- Split large test suites into smaller files
- Use shared setup utilities

## Security Testing

### 1. Authentication Testing
```typescript
it('should reject unauthenticated requests', async () => {
  await request(app)
    .get('/protected-endpoint')
    .expect(401);
});

it('should validate JWT tokens', async () => {
  await request(app)
    .get('/protected-endpoint')
    .set('Authorization', 'Bearer invalid-token')
    .expect(401);
});
```

### 2. Input Validation
```typescript
it('should sanitize user input', async () => {
  const maliciousInput = '<script>alert("xss")</script>';
  
  const response = await request(app)
    .post('/users')
    .send({ name: maliciousInput })
    .expect(400);
    
  expect(response.body.message).toContain('Invalid characters');
});
```

### 3. Rate Limiting
Test all rate-limited endpoints to ensure they're properly protected.

## Common Pitfalls

### 1. Test Pollution
❌ Tests affecting each other:
```typescript
// BAD: Modifying shared state
let sharedUser;
it('test 1', () => { sharedUser.name = 'Modified'; });
it('test 2', () => { expect(sharedUser.name).toBe('Original'); }); // Fails
```

✅ Isolated tests:
```typescript
// GOOD: Each test creates its own data
it('test 1', () => {
  const user = createUser({ name: 'Test 1' });
  // test logic
});
```

### 2. Over-mocking
❌ Mocking everything:
```typescript
// BAD: Mocking internal logic
mockUserService.validateEmail.mockReturnValue(true);
mockUserService.hashPassword.mockReturnValue('hashed');
```

✅ Mock external dependencies:
```typescript
// GOOD: Mock external services only
mockEmailService.sendWelcomeEmail.mockResolvedValue(true);
```

### 3. Brittle Tests
❌ Testing implementation details:
```typescript
// BAD: Testing internal method calls
expect(userService.validateInput).toHaveBeenCalled();
```

✅ Testing behavior:
```typescript
// GOOD: Testing outcomes
expect(result.isValid).toBe(true);
```

## Running Tests

### Development Workflow
```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- user.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

### CI/CD Commands
```bash
# CI test run (no watch, with coverage)
npm run test:ci

# Type checking
npm run typecheck

# Linting
npm run lint:check
```

Remember: Good tests are your safety net. Invest time in writing clear, maintainable tests that give you confidence in your code changes.