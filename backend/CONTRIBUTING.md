# CONTRIBUTING.md - Development Setup & Guidelines

## Local Development Setup

### Prerequisites
- Node.js 18+ (check with `node --version`)
- npm 9+ (check with `npm --version`)
- Git (check with `git --version`)
- PostgreSQL 14+ (via Supabase CLI)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-org/seda-auth-service.git
cd seda-auth-service

# Install dependencies
npm install

# Set up environment files
cp .env.example .env.qa
cp .env.example .env.sandbox

# Edit .env.qa with your development values
# See Environment Configuration section below
```

### Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase stack (PostgreSQL, Auth, etc.)
supabase start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev
```

### Running the Application
```bash
# Development mode (with hot reload)
npm run start:dev

# The API will be available at: http://localhost:3001
# Swagger docs at: http://localhost:3001/api/v1/docs
# Supabase Studio at: http://localhost:54323
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run linting and type checking
npm run lint
npm run typecheck
```

## Environment Configuration

### .env.qa (Local Development)
```env
NODE_ENV=qa
PORT=3001
API_PREFIX=api/v1

# Supabase (from supabase status)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from_supabase_start>
SUPABASE_SERVICE_KEY=<from_supabase_start>

# Database (from supabase status)  
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Security
JWT_SECRET=local-development-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Admin
ADMIN_API_KEY=local-admin-key

# Rate Limiting
RATE_LIMIT_VERIFICATION_PER_DAY=3
RATE_LIMIT_WINDOW_MS=86400000

# Crawler
CRAWLER_USER_AGENT=Mozilla/5.0 (compatible; SedaBot-Dev/1.0)
CRAWLER_TIMEOUT_MS=30000
CRAWLER_MAX_RETRIES=3

# Feature Flags (for testing)
FEATURE_PROFILES=false
FEATURE_PLAYLISTS=false
FEATURE_SOCIAL=false
FEATURE_LEADERBOARDS=false
FEATURE_TROPHY_CASE=false

# Analytics (optional)
POSTHOG_API_KEY=phc_dev_key_here
LOG_LEVEL=debug
```

### Getting Supabase Credentials
```bash
# Start Supabase (if not already running)
supabase start

# Get your local credentials
supabase status

# Copy the values to your .env.qa:
# - API URL -> SUPABASE_URL
# - anon key -> SUPABASE_ANON_KEY  
# - service_role key -> SUPABASE_SERVICE_KEY
# - DB URL -> DATABASE_URL
```

## Development Workflow

### Branch Strategy
```bash
# Main branches
main          # Production-ready code
sandbox       # Staging/testing environment
qa           # Integration testing

# Feature branches
feature/auth-improvements
feature/playlist-management
bugfix/verification-timeout
hotfix/security-patch
```

### Making Changes
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes with Tagged Comments**
   ```typescript
   // #COMPLETION_DRIVE: Assuming user has verified email
   // #SUGGEST_VERIFY: Add email verification check
   if (user.email) {
     await sendWelcomeEmail(user.email)
   }
   ```

3. **Run Quality Checks**
   ```bash
   # Before committing
   npm run lint
   npm run typecheck
   npm run test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add playlist collaboration features
   
   - Add collaborator invite system
   - Implement permission-based editing
   - Add real-time collaboration updates
   
   🤖 Generated with Claude Code (claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

### Code Quality Standards

#### TypeScript Guidelines
```typescript
// Use strict typing
interface UserProfile {
  id: string
  username: string
  bio?: string // Optional properties clearly marked
}

// Avoid 'any' type
const handleApiResponse = (data: ApiResponse): User => {
  // #COMPLETION_DRIVE: Assuming API response matches User interface
  // #SUGGEST_VERIFY: Add runtime validation with zod
  return data as User
}

// Use enums for constants
enum UserRole {
  USER = 'user',
  ARTIST = 'artist', 
  ADMIN = 'admin'
}
```

#### Error Handling Patterns
```typescript
// Consistent error responses
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
  }
}

// Service layer error handling
async updateProfile(userId: string, data: UpdateProfileDto): Promise<Profile> {
  try {
    const profile = await this.prisma.profile.update({
      where: { userId },
      data
    })
    
    return profile
  } catch (error) {
    if (error.code === 'P2002') { // Prisma unique constraint
      throw new AppError('Username already taken', 400, 'USERNAME_TAKEN')
    }
    
    throw new AppError('Failed to update profile', 500)
  }
}
```

#### Testing Patterns
```typescript
// Unit test example
describe('ProfileService', () => {
  let service: ProfileService
  let mockPrisma: jest.Mocked<PrismaService>
  
  beforeEach(() => {
    mockPrisma = createMockPrisma()
    service = new ProfileService(mockPrisma)
  })
  
  it('should create profile with unique username', async () => {
    // Arrange
    const userData = { username: 'testuser', bio: 'Test bio' }
    mockPrisma.profile.create.mockResolvedValue(mockProfile)
    
    // Act
    const result = await service.createProfile(userData)
    
    // Assert
    expect(result.username).toBe('testuser')
    expect(mockPrisma.profile.create).toHaveBeenCalledWith({
      data: userData
    })
  })
})

// Integration test example
describe('Profile API (e2e)', () => {
  let app: INestApplication
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    
    app = moduleFixture.createNestApplication()
    await app.init()
  })
  
  it('/profiles (GET) should return user profile', () => {
    return request(app.getHttpServer())
      .get('/api/v1/profiles/testuser')
      .expect(200)
      .expect((res) => {
        expect(res.body.username).toBe('testuser')
      })
  })
})
```

## Database Development

### Working with Migrations
```bash
# Create a new migration
npx prisma migrate dev --name add_user_profiles

# Reset database (CAUTION: loses all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npm run prisma:generate

# View database in Prisma Studio
npm run prisma:studio
```

### Schema Guidelines
```prisma
// Use descriptive model names
model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique @map("user_id")
  username    String   @unique
  displayName String?  @map("display_name")
  bio         String?
  avatarUrl   String?  @map("avatar_url")
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  playlists   Playlist[]
  
  // Metadata
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("user_profiles")
}

// Add indexes for performance
@@index([username])
@@index([userId])
```

## API Development

### Controller Patterns
```typescript
@Controller('profiles')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  
  @Get(':username')
  @ApiOperation({ summary: 'Get user profile by username' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(
    @Param('username') username: string,
    @Request() req: AuthenticatedRequest
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.getByUsername(username)
    
    if (!profile) {
      throw new NotFoundException('Profile not found')
    }
    
    return this.profileService.formatForUser(profile, req.user.id)
  }
}
```

### DTO Validation
```typescript
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string
  
  @IsOptional()
  @IsString()
  displayName?: string
}
```

## Frontend Development (if applicable)

### Component Structure
```
src/
  components/
    ui/           # Reusable UI components
    features/     # Feature-specific components
  hooks/          # Custom React hooks  
  services/       # API clients
  types/          # TypeScript type definitions
  utils/          # Utility functions
```

### API Client Pattern
```typescript
// services/api.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL
  private token: string | null = null
  
  setToken(token: string) {
    this.token = token
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    }
    
    const response = await fetch(url, { ...options, headers })
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.text())
    }
    
    return response.json()
  }
}
```

## Debugging & Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start

# Reset database if corrupted
supabase db reset
```

#### Authentication Issues
```typescript
// Check token validity
const token = 'your-jwt-token'
const decoded = jwt.decode(token)
console.log('Token expiry:', new Date(decoded.exp * 1000))

// Test token with curl
curl -H "Authorization: Bearer ${token}" \
     http://localhost:3001/api/v1/users/me
```

#### WebSocket Issues
```javascript
// Test WebSocket connection in browser console
const socket = io('http://localhost:3001/chat', {
  auth: { token: 'your-token' }
})

socket.on('connect', () => console.log('Connected'))
socket.on('error', console.error)
```

### Logging & Debugging
```typescript
// Use structured logging
import { Logger } from '@nestjs/common'

export class MyService {
  private readonly logger = new Logger(MyService.name)
  
  async someMethod(userId: string): Promise<void> {
    this.logger.log(`Processing request for user: ${userId}`)
    
    try {
      // ... business logic
      this.logger.debug('Operation completed successfully')
    } catch (error) {
      this.logger.error(`Operation failed: ${error.message}`, error.stack)
      throw error
    }
  }
}
```

## Performance & Optimization

### Database Query Optimization
```typescript
// Use select to limit fields
const users = await this.prisma.user.findMany({
  select: {
    id: true,
    username: true,
    avatar: true
  },
  where: { verified: true },
  take: 20
})

// Use includes carefully (can cause N+1 queries)
const usersWithProfiles = await this.prisma.user.findMany({
  include: {
    profile: {
      select: {
        username: true,
        bio: true
      }
    }
  }
})
```

### Caching Strategies
```typescript
// Simple in-memory cache
class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>()
  
  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    
    if (!cached || Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }
}
```

## Deployment & CI/CD

### Environment Promotion
```bash
# Deploy to sandbox for testing
git push origin feature/my-feature

# Create PR to main for production
gh pr create --title "Feature: My awesome feature" \
             --body "Description of changes..."

# After approval, merge triggers production deployment
```

### Feature Flag Usage
```typescript
// Check feature flags
const isFeatureEnabled = process.env.FEATURE_PROFILES === 'true'

if (isFeatureEnabled) {
  // New feature code
  return this.newProfileService.getProfile(username)
} else {
  // Fallback to old behavior
  return this.legacyProfileService.getProfile(username)
}
```

## Getting Help

### Resources
- **Documentation**: Check `/docs` folder for detailed specs
- **API Reference**: http://localhost:3001/api/v1/docs (when running locally)
- **Team Chat**: #seda-development Slack channel
- **Code Reviews**: GitHub pull request discussions

### Reporting Issues
1. **Search existing issues** in GitHub
2. **Provide reproduction steps** and environment details
3. **Include relevant logs** and error messages
4. **Tag appropriately** (bug, enhancement, question)

### Contributing Guidelines
- **Follow the code style** established in the project
- **Write tests** for new functionality
- **Update documentation** for API changes
- **Use descriptive commit messages**
- **Keep PRs focused** and reasonably sized

---

Thank you for contributing to sedā.fm! 🎵