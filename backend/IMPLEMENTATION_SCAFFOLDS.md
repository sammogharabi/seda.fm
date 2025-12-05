# Backend Implementation Scaffolds for Seda.fm v2

**Purpose**: Provide ready-to-implement NestJS + Prisma scaffolds for all missing/partial features identified in gap analysis.

**Generated**: 2025-11-08

**Next Step**: Copy-paste these scaffolds into actual files and run migrations.

---

## Table of Contents

1. [Prisma Schema Changes](#prisma-schema-changes)
2. [Social Feed Module](#social-feed-module)
3. [Crates Module (Extend Playlists)](#crates-module-extend-playlists)
4. [Rooms & DJ Sessions Module](#rooms--dj-sessions-module)
5. [Progression System Module](#progression-system-module)
6. [Marketplace Module](#marketplace-module)
7. [Search Module](#search-module)
8. [Discover Module](#discover-module)
9. [AI Detection Module](#ai-detection-module)
10. [Messaging Module](#messaging-module)
11. [Prioritized Implementation Steps](#prioritized-implementation-steps)

---

## Prisma Schema Changes

### 1. Social Feed Models

```prisma
// Add to schema.prisma

enum PostType {
  TEXT
  TRACK
  CRATE
  MEDIA
}

model Post {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      PostType
  content   String?  // Text content
  trackRef  Json?    @map("track_ref") // Track metadata if type=TRACK
  crateId   String?  @map("crate_id")  // If type=CRATE
  mediaUrls String[] @map("media_urls") // If type=MEDIA

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  user      Profile  @relation(fields: [userId], references: [userId], onDelete: Cascade)
  crate     Playlist? @relation(fields: [crateId], references: [id], onDelete: SetNull)
  comments  Comment[]
  likes     Like[]
  reposts   Repost[]

  @@index([userId, createdAt])
  @@index([type])
  @@index([deletedAt])
  @@map("posts")
}

model Comment {
  id        String    @id @default(uuid())
  postId    String    @map("post_id")
  userId    String    @map("user_id")
  parentId  String?   @map("parent_id") // For threading
  content   String

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      Profile   @relation(fields: [userId], references: [userId], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  likes     Like[]

  @@index([postId, createdAt])
  @@index([userId])
  @@index([parentId])
  @@map("comments")
}

enum LikeableType {
  POST
  COMMENT
  CRATE
}

model Like {
  id        String       @id @default(uuid())
  userId    String       @map("user_id")
  type      LikeableType
  postId    String?      @map("post_id")
  commentId String?      @map("comment_id")
  crateId   String?      @map("crate_id")

  createdAt DateTime     @default(now()) @map("created_at")

  user      Profile      @relation(fields: [userId], references: [userId], onDelete: Cascade)
  post      Post?        @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   Comment?     @relation(fields: [commentId], references: [id], onDelete: Cascade)
  crate     Playlist?    @relation(fields: [crateId], references: [id], onDelete: Cascade)

  @@unique([userId, type, postId])
  @@unique([userId, type, commentId])
  @@unique([userId, type, crateId])
  @@index([postId])
  @@index([commentId])
  @@index([crateId])
  @@map("likes")
}

model Repost {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  postId    String   @map("post_id")

  createdAt DateTime @default(now()) @map("created_at")

  user      Profile  @relation(fields: [userId], references: [userId], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId, createdAt])
  @@map("reposts")
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")

  createdAt   DateTime @default(now()) @map("created_at")

  follower    Profile  @relation("Following", fields: [followerId], references: [userId], onDelete: Cascade)
  following   Profile  @relation("Followers", fields: [followingId], references: [userId], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}
```

### 2. DJ Sessions & Rooms Models

```prisma
// Add to schema.prisma

enum SessionStatus {
  ACTIVE
  PAUSED
  ENDED
}

model DJSession {
  id              String        @id @default(uuid())
  roomId          String        @map("room_id")
  hostId          String        @map("host_id")
  currentDJId     String        @map("current_dj_id")
  status          SessionStatus @default(ACTIVE)
  nowPlayingRef   Json?         @map("now_playing_ref") // Current track metadata
  nowPlayingStart DateTime?     @map("now_playing_start")

  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  endedAt         DateTime?     @map("ended_at")

  room            Room          @relation(fields: [roomId], references: [id], onDelete: Cascade)
  queue           QueueItem[]

  @@index([roomId])
  @@index([status])
  @@map("dj_sessions")
}

model QueueItem {
  id        String   @id @default(uuid())
  sessionId String   @map("session_id")
  addedBy   String   @map("added_by")
  trackRef  Json     @map("track_ref") // Track metadata
  position  Int
  upvotes   Int      @default(0)
  downvotes Int      @default(0)

  createdAt DateTime @default(now()) @map("created_at")
  playedAt  DateTime? @map("played_at")
  skipped   Boolean  @default(false)

  session   DJSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  votes     Vote[]

  @@unique([sessionId, position])
  @@index([sessionId, position])
  @@map("queue_items")
}

enum VoteType {
  UPVOTE
  DOWNVOTE
}

model Vote {
  id          String   @id @default(uuid())
  queueItemId String   @map("queue_item_id")
  userId      String   @map("user_id")
  voteType    VoteType @map("vote_type")

  createdAt   DateTime @default(now()) @map("created_at")

  queueItem   QueueItem @relation(fields: [queueItemId], references: [id], onDelete: Cascade)

  @@unique([queueItemId, userId])
  @@index([queueItemId])
  @@map("votes")
}
```

### 3. Progression System Models

```prisma
// Add to schema.prisma

model UserProgression {
  id            String   @id @default(uuid())
  userId        String   @unique @map("user_id")
  level         Int      @default(1)
  xp            Int      @default(0)
  totalXP       Int      @default(0) @map("total_xp")

  // Streaks
  currentStreak Int      @default(0) @map("current_streak")
  longestStreak Int      @default(0) @map("longest_streak")
  lastActivity  DateTime @default(now()) @map("last_activity")

  // Stats
  tracksPlayed       Int @default(0) @map("tracks_played")
  totalListeningTime Int @default(0) @map("total_listening_time") // seconds
  postsCreated       Int @default(0) @map("posts_created")
  commentsCreated    Int @default(0) @map("comments_created")
  cratesCreated      Int @default(0) @map("crates_created")
  artistsDiscovered  Int @default(0) @map("artists_discovered")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user          Profile @relation(fields: [userId], references: [userId], onDelete: Cascade)
  badgeUnlocks  UserBadge[]

  @@index([level])
  @@index([totalXP])
  @@map("user_progression")
}

enum BadgeRarity {
  COMMON
  RARE
  EPIC
  LEGENDARY
}

enum BadgeCategory {
  ACTIVITY
  SOCIAL
  CURATOR
  DISCOVERY
  SPECIAL
}

model Badge {
  id             String        @id @default(uuid())
  name           String
  description    String
  icon           String        // Icon name or URL
  rarity         BadgeRarity
  category       BadgeCategory
  requirementKey String        @map("requirement_key") // e.g., "tracks_played"
  requirementValue Int         @map("requirement_value") // e.g., 100

  createdAt      DateTime      @default(now()) @map("created_at")

  unlocks        UserBadge[]

  @@unique([requirementKey, requirementValue])
  @@map("badges")
}

model UserBadge {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  badgeId    String   @map("badge_id")
  unlockedAt DateTime @default(now()) @map("unlocked_at")

  user       Profile  @relation(fields: [userId], references: [userId], onDelete: Cascade)
  badge      Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
  @@map("user_badges")
}

enum ChallengeType {
  DAILY
  WEEKLY
  MONTHLY
  SPECIAL
}

model Challenge {
  id          String        @id @default(uuid())
  name        String
  description String
  type        ChallengeType
  xpReward    Int           @map("xp_reward")
  targetKey   String        @map("target_key") // e.g., "tracks_played_today"
  targetValue Int           @map("target_value")
  startDate   DateTime      @map("start_date")
  endDate     DateTime      @map("end_date")

  createdAt   DateTime      @default(now()) @map("created_at")

  @@index([type, endDate])
  @@map("challenges")
}
```

### 4. Marketplace Models

```prisma
// Add to schema.prisma

enum ProductType {
  TRACK
  ALBUM
  MERCH
  DIGITAL_GOOD
}

enum PricingType {
  FIXED
  PWYW // Pay What You Want
  FREE
}

model Product {
  id             String       @id @default(uuid())
  artistId       String       @map("artist_id")
  type           ProductType
  name           String
  description    String?
  price          Decimal      @db.Decimal(10, 2) // In USD
  pricingType    PricingType  @default(FIXED) @map("pricing_type")
  minimumPrice   Decimal?     @db.Decimal(10, 2) @map("minimum_price") // For PWYW

  // Digital product fields
  trackRef       Json?        @map("track_ref") // If type=TRACK
  downloadUrl    String?      @map("download_url") // Signed URL or storage path
  fileSize       Int?         @map("file_size") // bytes
  format         String?      // mp3, wav, flac

  // Physical product fields
  stock          Int?         // For physical merch
  shippingRequired Boolean   @default(false) @map("shipping_required")

  images         String[]     // Image URLs

  isActive       Boolean      @default(true) @map("is_active")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  artist         ArtistProfile @relation(fields: [artistId], references: [id], onDelete: Cascade)
  orderItems     OrderItem[]

  @@index([artistId, type])
  @@index([isActive])
  @@map("products")
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  COMPLETED
  REFUNDED
  FAILED
}

model Order {
  id              String      @id @default(uuid())
  userId          String      @map("user_id")
  status          OrderStatus @default(PENDING)

  subtotal        Decimal     @db.Decimal(10, 2)
  platformFee     Decimal     @db.Decimal(10, 2) @map("platform_fee")
  processingFee   Decimal     @db.Decimal(10, 2) @map("processing_fee")
  total           Decimal     @db.Decimal(10, 2)

  stripeSessionId String?     @unique @map("stripe_session_id")
  stripPaymentIntentId String? @unique @map("stripe_payment_intent_id")

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  paidAt          DateTime?   @map("paid_at")

  items           OrderItem[]

  @@index([userId, createdAt])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id         String  @id @default(uuid())
  orderId    String  @map("order_id")
  productId  String  @map("product_id")
  quantity   Int
  priceAtPurchase Decimal @db.Decimal(10, 2) @map("price_at_purchase")

  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product    Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@map("order_items")
}

model Download {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  productId    String   @map("product_id")
  orderId      String   @map("order_id")
  downloadUrl  String   @map("download_url") // Signed URL
  expiresAt    DateTime @map("expires_at")
  downloadCount Int     @default(0) @map("download_count")
  maxDownloads Int      @default(3) @map("max_downloads")

  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId, productId])
  @@index([expiresAt])
  @@map("downloads")
}
```

### 5. AI Detection Models

```prisma
// Add to schema.prisma

enum AIDetectionStatus {
  PENDING
  ANALYZING
  VERIFIED_HUMAN
  FLAGGED_AI
  UNDER_REVIEW
  REJECTED
}

model AIDetectionResult {
  id        String             @id @default(uuid())
  trackRef  Json               @map("track_ref") // Track metadata
  uploadedBy String            @map("uploaded_by")
  status    AIDetectionStatus @default(PENDING)
  riskScore Float?             @map("risk_score") // 0-100

  detectionData Json?           @map("detection_data") // AI service response
  moderatorNotes String?        @map("moderator_notes")
  reviewedBy String?            @map("reviewed_by")
  reviewedAt DateTime?          @map("reviewed_at")

  createdAt DateTime           @default(now()) @map("created_at")
  updatedAt DateTime           @updatedAt @map("updated_at")

  @@index([uploadedBy, status])
  @@index([status, riskScore])
  @@map("ai_detection_results")
}

model CommunityReport {
  id        String   @id @default(uuid())
  trackRef  Json     @map("track_ref")
  reportedBy String  @map("reported_by")
  reason    String
  description String?

  createdAt DateTime @default(now()) @map("created_at")

  @@index([reportedBy])
  @@map("community_reports")
}

// Add to ArtistProfile model:
// trustedUploader Boolean @default(false) @map("trusted_uploader")
// trustedUploaderSince DateTime? @map("trusted_uploader_since")
```

### 6. Messaging Models

```prisma
// Add to schema.prisma

model Conversation {
  id           String    @id @default(uuid())
  participantIds String[] @map("participant_ids") // Array of user IDs

  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  messages     DirectMessage[]

  @@index([participantIds])
  @@map("conversations")
}

model DirectMessage {
  id             String       @id @default(uuid())
  conversationId String       @map("conversation_id")
  senderId       String       @map("sender_id")
  content        String

  readBy         String[]     @default([]) @map("read_by") // Array of user IDs

  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@index([senderId])
  @@map("direct_messages")
}
```

### 7. Update Profile Model for Relations

```prisma
// Update Profile model to add new relations

model Profile {
  // ... existing fields ...

  // Social Feed Relations
  posts          Post[]
  comments       Comment[]
  likes          Like[]
  reposts        Repost[]
  following      Follow[]  @relation("Following")
  followers      Follow[]  @relation("Followers")

  // Progression Relations
  progression    UserProgression?
  badgeUnlocks   UserBadge[]

  // ... rest of existing fields ...
}
```

### 8. Update ArtistProfile Model

```prisma
// Update ArtistProfile model

model ArtistProfile {
  // ... existing fields ...

  // Marketplace
  products            Product[]

  // AI Detection
  trustedUploader     Boolean  @default(false) @map("trusted_uploader")
  trustedUploaderSince DateTime? @map("trusted_uploader_since")
  uploadCount         Int      @default(0) @map("upload_count")
  verifiedUploadCount Int      @default(0) @map("verified_upload_count")

  // ... rest of existing fields ...
}
```

### 9. Update Playlist Model (Crates)

```prisma
// Update Playlist model to support social features

model Playlist {
  // ... existing fields ...

  // Social features
  coverImageUrl String?  @map("cover_image_url")
  genre         String?
  mood          String?
  tags          String[] @default([])
  playCount     Int      @default(0) @map("play_count")

  // Relations
  posts         Post[]
  likes         Like[]

  // ... rest of existing fields ...
}
```

---

## Social Feed Module

### Module Structure

```
backend/src/modules/feed/
├── feed.module.ts
├── feed.controller.ts
├── feed.service.ts
├── posts.service.ts
├── comments.service.ts
├── likes.service.ts
├── follows.service.ts
├── dto/
│   ├── create-post.dto.ts
│   ├── update-post.dto.ts
│   ├── create-comment.dto.ts
│   ├── like.dto.ts
│   ├── follow.dto.ts
│   └── get-feed.dto.ts
└── entities/
    ├── post.entity.ts
    └── comment.entity.ts
```

### DTOs

**`dto/create-post.dto.ts`**:
```typescript
import { IsEnum, IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ enum: PostType })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  trackRef?: any; // JSON

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  crateId?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
```

**`dto/create-comment.dto.ts`**:
```typescript
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
```

**`dto/get-feed.dto.ts`**:
```typescript
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetFeedDto {
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string; // ID of last post from previous page
}
```

### Controller

**`feed.controller.ts`**:
```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeedService } from './feed.service';
import { PostsService } from './posts.service';
import { CommentsService } from './comments.service';
import { LikesService } from './likes.service';
import { FollowsService } from './follows.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetFeedDto } from './dto/get-feed.dto';

@ApiTags('feed')
@Controller('feed')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly likesService: LikesService,
    private readonly followsService: FollowsService,
  ) {}

  // === FEED ===

  @Get()
  @ApiOperation({ summary: 'Get personalized feed (posts from followed users)' })
  async getFeed(@Request() req: any, @Query() query: GetFeedDto) {
    const userId = req.user.id;
    return this.feedService.getFeed(userId, query);
  }

  @Get('global')
  @ApiOperation({ summary: 'Get global feed (all public posts)' })
  async getGlobalFeed(@Query() query: GetFeedDto) {
    return this.feedService.getGlobalFeed(query);
  }

  // === POSTS ===

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    const userId = req.user.id;
    return this.postsService.create(userId, dto);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get single post with comments' })
  async getPost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.postsService.getById(id, userId);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own post' })
  async deletePost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.postsService.delete(id, userId);
  }

  @Post('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post' })
  async likePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.likesService.likePost(userId, postId);
  }

  @Delete('posts/:id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a post' })
  async unlikePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.likesService.unlikePost(userId, postId);
  }

  @Post('posts/:id/repost')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Repost a post' })
  async repost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.postsService.repost(userId, postId);
  }

  @Delete('posts/:id/repost')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove repost' })
  async unrepost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.postsService.unrepost(userId, postId);
  }

  // === COMMENTS ===

  @Post('posts/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add comment to post' })
  async createComment(
    @Param('id') postId: string,
    @Request() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = req.user.id;
    return this.commentsService.create(postId, userId, dto);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get post comments (with threading)' })
  async getComments(@Param('id') postId: string, @Query() query: GetFeedDto) {
    return this.commentsService.getByPost(postId, query);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own comment' })
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.commentsService.delete(id, userId);
  }

  @Post('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a comment' })
  async likeComment(@Param('id') commentId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.likesService.likeComment(userId, commentId);
  }

  // === FOLLOWS ===

  @Post('follow/:username')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow a user' })
  async follow(@Param('username') username: string, @Request() req: any) {
    const userId = req.user.id;
    return this.followsService.follow(userId, username);
  }

  @Delete('follow/:username')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollow(@Param('username') username: string, @Request() req: any) {
    const userId = req.user.id;
    await this.followsService.unfollow(userId, username);
  }

  @Get('followers/:username')
  @ApiOperation({ summary: 'Get user followers' })
  async getFollowers(@Param('username') username: string, @Query() query: GetFeedDto) {
    return this.followsService.getFollowers(username, query);
  }

  @Get('following/:username')
  @ApiOperation({ summary: 'Get users followed by user' })
  async getFollowing(@Param('username') username: string, @Query() query: GetFeedDto) {
    return this.followsService.getFollowing(username, query);
  }
}
```

### Service

**`feed.service.ts`**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetFeedDto } from './dto/get-feed.dto';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getFeed(userId: string, query: GetFeedDto) {
    const { limit = 20, cursor } = query;

    // Get users that current user follows
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Include own posts

    const posts = await this.prisma.post.findMany({
      where: {
        userId: { in: followingIds },
        deletedAt: null,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
      },
    });

    return {
      data: posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
      hasMore: posts.length === limit,
    };
  }

  async getGlobalFeed(query: GetFeedDto) {
    const { limit = 20, cursor } = query;

    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
      },
    });

    return {
      data: posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
      hasMore: posts.length === limit,
    };
  }
}
```

**`posts.service.ts`**:
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        trackRef: dto.trackRef,
        crateId: dto.crateId,
        mediaUrls: dto.mediaUrls || [],
      },
      include: {
        user: { select: { userId: true, username: true, displayName: true } },
      },
    });
  }

  async getById(id: string, requestingUserId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { userId: true, username: true, displayName: true } },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    // Check if requesting user liked this post
    const liked = await this.prisma.like.findUnique({
      where: {
        userId_type_postId: {
          userId: requestingUserId,
          type: 'POST',
          postId: id,
        },
      },
    });

    return { ...post, isLiked: !!liked };
  }

  async delete(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async repost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.repost.create({
      data: { userId, postId },
    });
  }

  async unrepost(userId: string, postId: string) {
    await this.prisma.repost.delete({
      where: { userId_postId: { userId, postId } },
    });
  }
}
```

---

## Crates Module (Extend Playlists)

### Extend Playlists Controller

**Add to `playlists.controller.ts`**:
```typescript
// Add these new endpoints to PlaylistsController

@Post(':id/like')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Like a crate' })
async likeCrate(@Param('id') crateId: string, @Request() req: any) {
  const userId = req.user.id;
  return this.playlistsService.likeCrate(userId, crateId);
}

@Delete(':id/like')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Unlike a crate' })
async unlikeCrate(@Param('id') crateId: string, @Request() req: any) {
  const userId = req.user.id;
  await this.playlistsService.unlikeCrate(userId, crateId);
}

@Post(':id/share')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Share crate to social feed' })
async shareCrate(@Param('id') crateId: string, @Request() req: any) {
  const userId = req.user.id;
  return this.playlistsService.shareCrateToFeed(userId, crateId);
}

@Patch(':id/cover-image')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Update crate cover image' })
async updateCoverImage(
  @Param('id') crateId: string,
  @Request() req: any,
  @Body() body: { coverImageUrl: string },
) {
  const userId = req.user.id;
  return this.playlistsService.updateCoverImage(userId, crateId, body.coverImageUrl);
}

@Get('trending')
@ApiOperation({ summary: 'Get trending crates' })
async getTrendingCrates(@Query('limit') limit: number = 20) {
  return this.playlistsService.getTrending(limit);
}

@Get('featured')
@ApiOperation({ summary: 'Get featured crates (curated)' })
async getFeaturedCrates(@Query('limit') limit: number = 20) {
  return this.playlistsService.getFeatured(limit);
}
```

**Add to `playlists.service.ts`**:
```typescript
// Add these methods to PlaylistsService

async likeCrate(userId: string, crateId: string) {
  return this.prisma.like.create({
    data: {
      userId,
      type: 'CRATE',
      crateId,
    },
  });
}

async unlikeCrate(userId: string, crateId: string) {
  await this.prisma.like.delete({
    where: {
      userId_type_crateId: {
        userId,
        type: 'CRATE',
        crateId,
      },
    },
  });
}

async shareCrateToFeed(userId: string, crateId: string) {
  const crate = await this.prisma.playlist.findUnique({ where: { id: crateId } });
  if (!crate) throw new NotFoundException('Crate not found');

  // Create a post of type CRATE
  return this.prisma.post.create({
    data: {
      userId,
      type: 'CRATE',
      crateId,
      content: crate.description,
    },
  });
}

async updateCoverImage(userId: string, crateId: string, coverImageUrl: string) {
  const crate = await this.prisma.playlist.findUnique({ where: { id: crateId } });
  if (!crate) throw new NotFoundException('Crate not found');
  if (crate.ownerUserId !== userId) throw new ForbiddenException('Not authorized');

  return this.prisma.playlist.update({
    where: { id: crateId },
    data: { coverImageUrl },
  });
}

async getTrending(limit: number) {
  // Simple trending: most played in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return this.prisma.playlist.findMany({
    where: {
      isPublic: true,
      updatedAt: { gte: sevenDaysAgo },
    },
    orderBy: { playCount: 'desc' },
    take: limit,
  });
}

async getFeatured(limit: number) {
  // Featured: staff-curated (add 'featured' boolean field to Playlist model)
  return this.prisma.playlist.findMany({
    where: {
      isPublic: true,
      // featured: true, // Add this field to schema
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
```

---

## Rooms & DJ Sessions Module

### Module Structure

```
backend/src/modules/sessions/
├── sessions.module.ts
├── sessions.controller.ts
├── sessions.service.ts
├── queue.service.ts
├── votes.service.ts
├── dto/
│   ├── create-session.dto.ts
│   ├── add-to-queue.dto.ts
│   ├── vote.dto.ts
│   └── get-active-sessions.dto.ts
└── sessions.gateway.ts  // WebSocket gateway for real-time
```

### DTOs

**`dto/create-session.dto.ts`**:
```typescript
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  roomId: string;
}
```

**`dto/add-to-queue.dto.ts`**:
```typescript
import { IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToQueueDto {
  @ApiProperty()
  @IsObject()
  trackRef: any; // Track metadata (JSON)
}
```

**`dto/vote.dto.ts`**:
```typescript
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class VoteDto {
  @ApiProperty({ enum: VoteType })
  @IsEnum(VoteType)
  voteType: VoteType;
}
```

### Controller

**`sessions.controller.ts`**:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SessionsService } from './sessions.service';
import { QueueService } from './queue.service';
import { VotesService } from './votes.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { VoteDto } from './dto/vote.dto';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly queueService: QueueService,
    private readonly votesService: VotesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new DJ session in a room' })
  async createSession(@Request() req: any, @Body() dto: CreateSessionDto) {
    const userId = req.user.id;
    return this.sessionsService.create(userId, dto.roomId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active DJ sessions' })
  async getActiveSessions(@Query('limit') limit: number = 20) {
    return this.sessionsService.getActive(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details with queue' })
  async getSession(@Param('id') id: string) {
    return this.sessionsService.getById(id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a session (adds to room membership)' })
  async joinSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.join(sessionId, userId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a session' })
  async leaveSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.leave(sessionId, userId);
  }

  @Post(':id/queue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add track to session queue' })
  async addToQueue(
    @Param('id') sessionId: string,
    @Request() req: any,
    @Body() dto: AddToQueueDto,
  ) {
    const userId = req.user.id;
    return this.queueService.addTrack(sessionId, userId, dto.trackRef);
  }

  @Get(':id/queue')
  @ApiOperation({ summary: 'Get session queue with votes' })
  async getQueue(@Param('id') sessionId: string) {
    return this.queueService.getQueue(sessionId);
  }

  @Post(':id/queue/:queueItemId/vote')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vote on queued track' })
  async vote(
    @Param('id') sessionId: string,
    @Param('queueItemId') queueItemId: string,
    @Request() req: any,
    @Body() dto: VoteDto,
  ) {
    const userId = req.user.id;
    return this.votesService.vote(userId, queueItemId, dto.voteType);
  }

  @Post(':id/skip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Skip current track (manual or auto by votes)' })
  async skipTrack(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.skipTrack(sessionId, userId);
  }

  @Patch(':id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End the session (host only)' })
  async endSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.end(sessionId, userId);
  }
}
```

### Service

**`sessions.service.ts`**:
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(hostId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    // Check if there's already an active session in this room
    const existingSession = await this.prisma.dJSession.findFirst({
      where: { roomId, status: 'ACTIVE' },
    });
    if (existingSession) {
      throw new ForbiddenException('Room already has an active session');
    }

    return this.prisma.dJSession.create({
      data: {
        roomId,
        hostId,
        currentDJId: hostId,
        status: 'ACTIVE',
      },
      include: {
        room: true,
      },
    });
  }

  async getById(id: string) {
    const session = await this.prisma.dJSession.findUnique({
      where: { id },
      include: {
        room: true,
        queue: {
          orderBy: { position: 'asc' },
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getActive(limit: number) {
    return this.prisma.dJSession.findMany({
      where: { status: 'ACTIVE' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        room: { select: { id: true, name: true, description: true } },
        _count: { select: { queue: true } },
      },
    });
  }

  async join(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({
      where: { id: sessionId },
      include: { room: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    // Add user to room membership if not already a member
    await this.prisma.roomMembership.upsert({
      where: {
        roomId_userId: {
          roomId: session.roomId,
          userId,
        },
      },
      create: {
        roomId: session.roomId,
        userId,
      },
      update: {},
    });

    return { message: 'Joined session', session };
  }

  async leave(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Remove from room membership
    await this.prisma.roomMembership.delete({
      where: {
        roomId_userId: {
          roomId: session.roomId,
          userId,
        },
      },
    });

    return { message: 'Left session' };
  }

  async skipTrack(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Get next track from queue
    const nextTrack = await this.prisma.queueItem.findFirst({
      where: {
        sessionId,
        playedAt: null,
        skipped: false,
      },
      orderBy: [{ upvotes: 'desc' }, { position: 'asc' }],
    });

    if (!nextTrack) {
      return this.prisma.dJSession.update({
        where: { id: sessionId },
        data: { nowPlayingRef: null, nowPlayingStart: null },
      });
    }

    // Mark current track as played/skipped
    // Update session with new track
    return this.prisma.dJSession.update({
      where: { id: sessionId },
      data: {
        nowPlayingRef: nextTrack.trackRef,
        nowPlayingStart: new Date(),
      },
    });
  }

  async end(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== userId) throw new ForbiddenException('Only host can end session');

    return this.prisma.dJSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });
  }
}
```

**`queue.service.ts`**:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async addTrack(sessionId: string, userId: string, trackRef: any) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Get current max position
    const maxPosition = await this.prisma.queueItem.findFirst({
      where: { sessionId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = (maxPosition?.position || 0) + 1;

    return this.prisma.queueItem.create({
      data: {
        sessionId,
        addedBy: userId,
        trackRef,
        position,
      },
    });
  }

  async getQueue(sessionId: string) {
    return this.prisma.queueItem.findMany({
      where: { sessionId, playedAt: null, skipped: false },
      orderBy: [{ upvotes: 'desc' }, { position: 'asc' }],
      include: {
        _count: { select: { votes: true } },
      },
    });
  }
}
```

**`votes.service.ts`**:
```typescript
import { Injectable, NotFoundException } from '@nestjs/client';
import { PrismaService } from '../prisma/prisma.service';
import { VoteType } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async vote(userId: string, queueItemId: string, voteType: VoteType) {
    const queueItem = await this.prisma.queueItem.findUnique({
      where: { id: queueItemId },
    });
    if (!queueItem) throw new NotFoundException('Queue item not found');

    // Upsert vote (update if exists, create if not)
    const vote = await this.prisma.vote.upsert({
      where: {
        queueItemId_userId: {
          queueItemId,
          userId,
        },
      },
      create: {
        queueItemId,
        userId,
        voteType,
      },
      update: {
        voteType,
      },
    });

    // Recalculate upvotes/downvotes count
    const upvoteCount = await this.prisma.vote.count({
      where: { queueItemId, voteType: 'UPVOTE' },
    });
    const downvoteCount = await this.prisma.vote.count({
      where: { queueItemId, voteType: 'DOWNVOTE' },
    });

    await this.prisma.queueItem.update({
      where: { id: queueItemId },
      data: {
        upvotes: upvoteCount,
        downvotes: downvoteCount,
      },
    });

    return vote;
  }
}
```

---

## Progression System Module

### Module Structure

```
backend/src/modules/progression/
├── progression.module.ts
├── progression.controller.ts
├── progression.service.ts
├── badges.service.ts
├── xp.service.ts
├── dto/
│   ├── award-xp.dto.ts
│   └── get-leaderboard.dto.ts
└── events/
    └── progression.events.ts
```

### DTOs

**`dto/award-xp.dto.ts`**:
```typescript
import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AwardXPDto {
  @ApiProperty()
  @IsString()
  activityType: string; // listen_minute, create_post, etc.

  @ApiProperty()
  @IsInt()
  @Min(1)
  xpAmount: number;
}
```

**`dto/get-leaderboard.dto.ts`**:
```typescript
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum LeaderboardType {
  XP = 'xp',
  LEVEL = 'level',
  STREAK = 'streak',
}

export class GetLeaderboardDto {
  @ApiPropertyOptional({ enum: LeaderboardType })
  @IsOptional()
  @IsEnum(LeaderboardType)
  type?: LeaderboardType = LeaderboardType.XP;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
```

### Controller

**`progression.controller.ts`**:
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ProgressionService } from './progression.service';
import { BadgesService } from './badges.service';
import { XPService } from './xp.service';
import { AwardXPDto } from './dto/award-xp.dto';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';

@ApiTags('progression')
@Controller('progression')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProgressionController {
  constructor(
    private readonly progressionService: ProgressionService,
    private readonly badgesService: BadgesService,
    private readonly xpService: XPService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user progression stats' })
  async getMyProgression(@Request() req: any) {
    const userId = req.user.id;
    return this.progressionService.getOrCreate(userId);
  }

  @Get('users/:username')
  @ApiOperation({ summary: 'Get user progression by username' })
  async getUserProgression(@Param('username') username: string) {
    return this.progressionService.getByUsername(username);
  }

  @Post('xp/award')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Award XP to current user (internal use)' })
  async awardXP(@Request() req: any, @Body() dto: AwardXPDto) {
    const userId = req.user.id;
    return this.xpService.awardXP(userId, dto.activityType, dto.xpAmount);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get all available badges' })
  async getAllBadges() {
    return this.badgesService.getAllBadges();
  }

  @Get('me/badges')
  @ApiOperation({ summary: 'Get current user unlocked badges' })
  async getMyBadges(@Request() req: any) {
    const userId = req.user.id;
    return this.badgesService.getUserBadges(userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard' })
  async getLeaderboard(@Query() query: GetLeaderboardDto) {
    return this.progressionService.getLeaderboard(query);
  }

  @Post('daily-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record daily login for streak' })
  async recordDailyLogin(@Request() req: any) {
    const userId = req.user.id;
    return this.progressionService.recordDailyLogin(userId);
  }
}
```

### Service

**`progression.service.ts`**:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';

@Injectable()
export class ProgressionService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    let progression = await this.prisma.userProgression.findUnique({
      where: { userId },
      include: {
        badgeUnlocks: {
          include: { badge: true },
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });

    if (!progression) {
      progression = await this.prisma.userProgression.create({
        data: { userId },
        include: {
          badgeUnlocks: { include: { badge: true } },
        },
      });
    }

    return progression;
  }

  async getByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      select: { userId: true },
    });
    if (!profile) throw new NotFoundException('User not found');

    return this.getOrCreate(profile.userId);
  }

  async getLeaderboard(query: GetLeaderboardDto) {
    const { type, limit } = query;

    const orderBy: any = {};
    switch (type) {
      case 'level':
        orderBy.level = 'desc';
        break;
      case 'streak':
        orderBy.currentStreak = 'desc';
        break;
      case 'xp':
      default:
        orderBy.totalXP = 'desc';
    }

    const leaders = await this.prisma.userProgression.findMany({
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    return leaders.map((leader, index) => ({
      rank: index + 1,
      userId: leader.userId,
      username: leader.user.username,
      displayName: leader.user.displayName,
      value:
        type === 'level'
          ? leader.level
          : type === 'streak'
          ? leader.currentStreak
          : leader.totalXP,
      level: leader.level,
      xp: leader.totalXP,
    }));
  }

  async recordDailyLogin(userId: string) {
    const progression = await this.getOrCreate(userId);

    const now = new Date();
    const lastActivity = new Date(progression.lastActivity);
    const daysSinceLastActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    let newStreak = progression.currentStreak;
    if (daysSinceLastActivity === 0) {
      // Same day, no change
    } else if (daysSinceLastActivity === 1) {
      // Next day, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, progression.longestStreak);

    return this.prisma.userProgression.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActivity: now,
      },
    });
  }
}
```

**`xp.service.ts`**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from './badges.service';

@Injectable()
export class XPService {
  constructor(
    private prisma: PrismaService,
    private badgesService: BadgesService,
  ) {}

  async awardXP(userId: string, activityType: string, xpAmount: number) {
    const progression = await this.prisma.userProgression.findUnique({
      where: { userId },
    });

    if (!progression) {
      throw new Error('User progression not found');
    }

    const newXP = progression.xp + xpAmount;
    const newTotalXP = progression.totalXP + xpAmount;
    const newLevel = this.calculateLevel(newTotalXP);
    const leveledUp = newLevel > progression.level;

    const updated = await this.prisma.userProgression.update({
      where: { userId },
      data: {
        xp: newXP,
        totalXP: newTotalXP,
        level: newLevel,
      },
    });

    // Check for badge unlocks
    await this.badgesService.checkAndUnlockBadges(userId);

    return {
      ...updated,
      xpAwarded: xpAmount,
      leveledUp,
      activityType,
    };
  }

  private calculateLevel(totalXP: number): number {
    // Level thresholds from frontend spec
    const thresholds = [
      { maxLevel: 10, xpPerLevel: 100 },
      { maxLevel: 25, xpPerLevel: 250 },
      { maxLevel: 50, xpPerLevel: 500 },
      { maxLevel: 75, xpPerLevel: 1000 },
      { maxLevel: 99, xpPerLevel: 2000 },
    ];

    let level = 1;
    let xpRequired = 0;

    for (const threshold of thresholds) {
      while (level < threshold.maxLevel) {
        xpRequired += threshold.xpPerLevel;
        if (totalXP < xpRequired) return level;
        level++;
      }
    }

    return Math.min(level, 100);
  }
}
```

**`badges.service.ts`**:
```typescript
import { Injectable } from '@nestjs/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: [{ category: 'asc' }, { requirementValue: 'asc' }],
    });
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async checkAndUnlockBadges(userId: string) {
    const progression = await this.prisma.userProgression.findUnique({
      where: { userId },
    });

    if (!progression) return;

    const allBadges = await this.prisma.badge.findMany();
    const unlockedBadgeIds = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const unlockedIds = new Set(unlockedBadgeIds.map((ub) => ub.badgeId));

    const newlyUnlocked = [];

    for (const badge of allBadges) {
      if (unlockedIds.has(badge.id)) continue;

      const progressionValue = (progression as any)[badge.requirementKey];
      if (progressionValue >= badge.requirementValue) {
        const userBadge = await this.prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
          include: { badge: true },
        });
        newlyUnlocked.push(userBadge);
      }
    }

    return newlyUnlocked;
  }
}
```

---

## Marketplace Module

### Module Structure

```
backend/src/modules/marketplace/
├── marketplace.module.ts
├── marketplace.controller.ts
├── products.service.ts
├── orders.service.ts
├── payments.service.ts  // Stripe integration
├── downloads.service.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── create-order.dto.ts
│   └── checkout.dto.ts
└── webhooks/
    └── stripe.webhook.ts
```

### DTOs

**`dto/create-product.dto.ts`**:
```typescript
import { IsEnum, IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType, PricingType } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ enum: PricingType })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minimumPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  trackRef?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  shippingRequired?: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
```

**`dto/checkout.dto.ts`**:
```typescript
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CartItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  items: CartItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
```

### Controller

**`marketplace.controller.ts`**:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ProductsService } from './products.service';
import { OrdersService } from './orders.service';
import { PaymentsService } from './payments.service';
import { DownloadsService } from './downloads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly downloadsService: DownloadsService,
  ) {}

  // === PRODUCTS ===

  @Get('artists/:artistId/products')
  @ApiOperation({ summary: 'Get products for an artist' })
  async getArtistProducts(@Param('artistId') artistId: string) {
    return this.productsService.getByArtist(artistId);
  }

  @Post('products')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product (artist only)' })
  async createProduct(@Request() req: any, @Body() dto: CreateProductDto) {
    const userId = req.user.id;
    return this.productsService.create(userId, dto);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details' })
  async getProduct(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product (owner only)' })
  async updateProduct(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    const userId = req.user.id;
    return this.productsService.update(id, userId, dto);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product (owner only)' })
  async deleteProduct(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.productsService.delete(id, userId);
  }

  // === CHECKOUT & ORDERS ===

  @Post('checkout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckout(@Request() req: any, @Body() dto: CheckoutDto) {
    const userId = req.user.id;
    return this.paymentsService.createCheckoutSession(userId, dto);
  }

  @Get('orders')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user purchase history' })
  async getMyOrders(@Request() req: any) {
    const userId = req.user.id;
    return this.ordersService.getByUser(userId);
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.ordersService.getById(id, userId);
  }

  // === DOWNLOADS ===

  @Post('downloads/:productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate download link for purchased product' })
  async generateDownloadLink(
    @Param('productId') productId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.downloadsService.generateLink(userId, productId);
  }
}
```

### Service (Stripe Integration)

**`payments.service.ts`**:
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(userId: string, dto: CheckoutDto) {
    // Fetch products
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products not found');
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      const amount = Number(product.price) * 100; // Convert to cents
      subtotal += amount * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.images || [],
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      });
    }

    const platformFee = Math.floor(subtotal * 0.10);
    const processingFee = Math.floor(subtotal * 0.05);
    const total = subtotal + platformFee + processingFee;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        subtotal: subtotal / 100,
        platformFee: platformFee / 100,
        processingFee: processingFee / 100,
        total: total / 100,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: products.find((p) => p.id === item.productId)!.price,
          })),
        },
      },
    });

    // Create Stripe session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: dto.successUrl || `${process.env.FRONTEND_URL}/purchase/success?orderId=${order.id}`,
      cancel_url: dto.cancelUrl || `${process.env.FRONTEND_URL}/marketplace`,
      metadata: {
        orderId: order.id,
      },
    });

    // Update order with Stripe session ID
    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return {
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
    };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutComplete(session);
        break;
      // Handle other events...
    }
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripPaymentIntentId: session.payment_intent as string,
      },
    });

    // TODO: Generate download links, send receipt email, etc.
  }
}
```

---

## Search Module

### Module Structure

```
backend/src/modules/search/
├── search.module.ts
├── search.controller.ts
├── search.service.ts
└── dto/
    └── search.dto.ts
```

### DTO

**`dto/search.dto.ts`**:
```typescript
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum SearchType {
  ALL = 'all',
  TRACKS = 'tracks',
  ARTISTS = 'artists',
  USERS = 'users',
  CRATES = 'crates',
  ROOMS = 'rooms',
}

export class SearchDto {
  @ApiPropertyOptional()
  @IsString()
  q: string;

  @ApiPropertyOptional({ enum: SearchType })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

### Controller

**`search.controller.ts`**:
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Universal search across all entities' })
  async search(@Query() query: SearchDto) {
    return this.searchService.search(query);
  }
}
```

### Service (PostgreSQL Full-Text Search)

**`search.service.ts`**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchDto) {
    const { q, type, limit } = dto;
    const query = q.trim().toLowerCase();

    if (!query) {
      return { tracks: [], artists: [], users: [], crates: [], rooms: [] };
    }

    const results: any = {};

    if (type === 'all' || type === 'users') {
      results.users = await this.searchUsers(query, limit!);
    }

    if (type === 'all' || type === 'crates') {
      results.crates = await this.searchCrates(query, limit!);
    }

    if (type === 'all' || type === 'rooms') {
      results.rooms = await this.searchRooms(query, limit!);
    }

    // TODO: Tracks and Artists search (requires track storage system)

    return results;
  }

  private async searchUsers(query: string, limit: number) {
    return this.prisma.profile.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        userId: true,
        username: true,
        displayName: true,
        bio: true,
      },
    });
  }

  private async searchCrates(query: string, limit: number) {
    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  private async searchRooms(query: string, limit: number) {
    return this.prisma.room.findMany({
      where: {
        isPrivate: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        _count: { select: { memberships: true, messages: true } },
      },
    });
  }
}
```

---

## Discover Module

### Module Structure

```
backend/src/modules/discover/
├── discover.module.ts
├── discover.controller.ts
├── discover.service.ts
└── dto/
    └── get-discover.dto.ts
```

### Controller

**`discover.controller.ts`**:
```typescript
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { DiscoverService } from './discover.service';

@ApiTags('discover')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('trending')
  @ApiOperation({ summary: 'Get trending crates' })
  async getTrending(@Query('limit') limit: number = 20) {
    return this.discoverService.getTrendingCrates(limit);
  }

  @Get('new-releases')
  @ApiOperation({ summary: 'Get new releases' })
  async getNewReleases(@Query('limit') limit: number = 20) {
    return this.discoverService.getNewCrates(limit);
  }

  @Get('for-you')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations' })
  async getForYou(@Request() req: any, @Query('limit') limit: number = 20) {
    const userId = req.user.id;
    return this.discoverService.getPersonalized(userId, limit);
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: 'Get crates by genre' })
  async getByGenre(@Param('genre') genre: string, @Query('limit') limit: number = 20) {
    return this.discoverService.getByGenre(genre, limit);
  }
}
```

### Service

**`discover.service.ts`**:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscoverService {
  constructor(private prisma: PrismaService) {}

  async getTrendingCrates(limit: number) {
    // Simple trending: most played in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        updatedAt: { gte: sevenDaysAgo },
      },
      orderBy: { playCount: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true, likes: true } },
      },
    });
  }

  async getNewCrates(limit: number) {
    return this.prisma.playlist.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async getPersonalized(userId: string, limit: number) {
    // Simple personalization: based on user's genres
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { genres: true },
    });

    if (!profile || !profile.genres || profile.genres.length === 0) {
      return this.getTrendingCrates(limit);
    }

    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        genre: { in: profile.genres },
      },
      orderBy: { playCount: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async getByGenre(genre: string, limit: number) {
    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        genre: { equals: genre, mode: 'insensitive' },
      },
      orderBy: { playCount: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }
}
```

---

## AI Detection Module

### Module Structure

```
backend/src/modules/ai-detection/
├── ai-detection.module.ts
├── ai-detection.controller.ts
├── ai-detection.service.ts
├── moderation.service.ts
└── dto/
    ├── submit-track.dto.ts
    ├── submit-proof.dto.ts
    └── moderate.dto.ts
```

### Controller

**`ai-detection.controller.ts`**:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AIDetectionService } from './ai-detection.service';
import { ModerationService } from './moderation.service';

@ApiTags('ai-detection')
@Controller('ai-detection')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AIDetectionController {
  constructor(
    private readonly aiDetectionService: AIDetectionService,
    private readonly moderationService: ModerationService,
  ) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit track for AI detection' })
  async submitTrack(@Request() req: any, @Body() body: { trackRef: any }) {
    const userId = req.user.id;
    return this.aiDetectionService.submitTrack(userId, body.trackRef);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get AI detection status' })
  async getStatus(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.aiDetectionService.getStatus(id, userId);
  }

  @Get('my-tracks')
  @ApiOperation({ summary: 'Get all my tracks detection status' })
  async getMyTracks(@Request() req: any) {
    const userId = req.user.id;
    return this.aiDetectionService.getByUser(userId);
  }

  @Post('report')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report suspected AI-generated track' })
  async reportTrack(@Request() req: any, @Body() body: { trackRef: any; reason: string; description?: string }) {
    const userId = req.user.id;
    return this.aiDetectionService.reportTrack(userId, body.trackRef, body.reason, body.description);
  }

  // === MODERATION (ADMIN/MODERATOR ONLY) ===

  @Get('moderation/queue')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get moderation queue (flagged tracks)' })
  async getModerationQueue(@Query('status') status?: string) {
    return this.moderationService.getQueue(status);
  }

  @Patch('moderation/:id/approve')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve track as human-created' })
  async approveTrack(@Param('id') id: string, @Request() req: any, @Body() body: { notes?: string }) {
    const moderatorId = req.user.id;
    return this.moderationService.approve(id, moderatorId, body.notes);
  }

  @Patch('moderation/:id/reject')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject track as AI-generated' })
  async rejectTrack(@Param('id') id: string, @Request() req: any, @Body() body: { notes?: string }) {
    const moderatorId = req.user.id;
    return this.moderationService.reject(id, moderatorId, body.notes);
  }
}
```

---

## Messaging Module

### Module Structure

```
backend/src/modules/messaging/
├── messaging.module.ts
├── messaging.controller.ts
├── messaging.service.ts
├── messaging.gateway.ts  // WebSocket
└── dto/
    ├── send-message.dto.ts
    └── get-messages.dto.ts
```

### Controller

**`messaging.controller.ts`**:
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { MessagingService } from './messaging.service';

@ApiTags('messaging')
@Controller('messaging')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@Request() req: any) {
    const userId = req.user.id;
    return this.messagingService.getConversations(userId);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start new conversation' })
  async startConversation(@Request() req: any, @Body() body: { participantIds: string[] }) {
    const userId = req.user.id;
    return this.messagingService.createConversation([userId, ...body.participantIds]);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @Param('id') conversationId: string,
    @Request() req: any,
    @Query('limit') limit: number = 50,
    @Query('cursor') cursor?: string,
  ) {
    const userId = req.user.id;
    return this.messagingService.getMessages(conversationId, userId, limit, cursor);
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Request() req: any,
    @Body() body: { content: string },
  ) {
    const userId = req.user.id;
    return this.messagingService.sendMessage(conversationId, userId, body.content);
  }

  @Post('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markAsRead(@Param('id') conversationId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.messagingService.markAsRead(conversationId, userId);
  }
}
```

---

## Prioritized Implementation Steps

Based on product-market fit and technical dependencies:

### Phase 1: Core Social (4-6 weeks)
**Goal**: Enable community engagement and content discovery

1. **Social Feed Module** (Week 1-2)
   - Implement Post, Comment, Like, Repost models
   - Create feed endpoints
   - Build follow system
   - Priority: P0

2. **Extend Crates with Social Features** (Week 2)
   - Add like/share crate endpoints
   - Integrate crates into feed posts
   - Add cover image upload (Supabase Storage)
   - Priority: P0

3. **Global Search** (Week 3)
   - Implement basic cross-entity search
   - Use PostgreSQL full-text search
   - Add search history
   - Priority: P0

4. **Extended User Profiles** (Week 3)
   - Add post/comment/crate history endpoints
   - Implement follow/follower lists
   - Add profile stats aggregation
   - Priority: P1

5. **Discover Module** (Week 4)
   - Implement trending algorithm
   - Add "For You" personalization
   - Create genre-based discovery
   - Priority: P1

### Phase 2: Real-Time Collaboration (3-4 weeks)
**Goal**: Enable DJ sessions and live music experiences

6. **Rooms & DJ Sessions** (Week 5-6)
   - Implement DJSession, QueueItem, Vote models
   - Create session management endpoints
   - Build queue and voting system
   - Set up Supabase Realtime integration
   - Priority: P0

7. **Direct Messaging** (Week 7)
   - Implement Conversation, DirectMessage models
   - Create DM endpoints
   - Add real-time delivery via WebSocket
   - Priority: P2

### Phase 3: Monetization & Growth (4-5 weeks)
**Goal**: Enable artist monetization and user retention

8. **Marketplace** (Week 8-10)
   - Implement Product, Order, OrderItem models
   - Integrate Stripe for payments
   - Build digital download system
   - Create artist payout workflow
   - Priority: P1

9. **Progression System** (Week 11-12)
   - Implement UserProgression, Badge, Challenge models
   - Build XP calculation service
   - Create badge unlock detection
   - Add leaderboards
   - Priority: P1

### Phase 4: Trust & Safety (2-3 weeks)
**Goal**: Platform integrity and content quality

10. **AI Detection System** (Week 13-14)
    - Implement AIDetectionResult, CommunityReport models
    - Integrate external AI detection API
    - Build moderation queue
    - Add trusted uploader system
    - Priority: P1

11. **Content Moderation** (Week 15)
    - Add report/flag system for posts/comments
    - Implement block/mute functionality
    - Create admin moderation tools
    - Priority: P2

### Phase 5: Enhancements (Ongoing)
**Goal**: Quality-of-life improvements

12. **Advanced Search** (Week 16)
    - Add Elasticsearch/Algolia integration
    - Implement fuzzy matching
    - Add faceted search
    - Priority: P2

13. **Artist Analytics** (Week 17)
    - Build analytics dashboard endpoints
    - Track play counts, engagement
    - Revenue reporting
    - Priority: P2

14. **Cross-Device Sync** (Week 18)
    - Implement server-side queue persistence
    - Add playback position sync
    - Priority: P3

---

## Infrastructure Setup Required

### Supabase Configuration

1. **Storage Buckets**:
   - `crate-covers` - For crate cover images
   - `product-images` - For marketplace product images
   - `track-files` - For digital track downloads
   - `proof-files` - For AI detection proof uploads

2. **Realtime Channels**:
   - Configure Realtime for DJ sessions
   - Set up presence tracking
   - Enable broadcast for queue updates

3. **Row-Level Security (RLS)**:
   - Define policies for all new tables
   - Secure file storage buckets

### Stripe Integration

1. **Account Setup**:
   - Create Stripe account
   - Get API keys (test + live)
   - Set up Stripe Connect for artist payouts

2. **Webhooks**:
   - Configure webhook endpoint: `/api/marketplace/webhook`
   - Listen for: `checkout.session.completed`, `payment_intent.succeeded`, etc.

3. **Products & Pricing**:
   - Create product templates
   - Set up revenue split configuration

### Environment Variables

Add to `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Storage
SUPABASE_STORAGE_URL=https://...
SUPABASE_BUCKET_CRATE_COVERS=crate-covers
SUPABASE_BUCKET_PRODUCTS=product-images
SUPABASE_BUCKET_TRACKS=track-files

# External Services (Optional)
AI_DETECTION_API_KEY=...  # If using external AI detection service

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:5173
```

---

## Migration Commands

After adding Prisma schema changes:

```bash
# Generate migration
npx prisma migrate dev --name add_social_feed_models

# Apply to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database with badges
npx prisma db seed
```

Create seed script for badges in `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
  {
    name: 'First Track',
    description: 'Played your first track',
    icon: 'Music',
    rarity: 'COMMON',
    category: 'ACTIVITY',
    requirementKey: 'tracksPlayed',
    requirementValue: 1,
  },
  // ... add all badges from frontend spec
];

async function main() {
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: {
        requirementKey_requirementValue: {
          requirementKey: badge.requirementKey,
          requirementValue: badge.requirementValue,
        },
      },
      create: badge,
      update: badge,
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

---

## Testing Strategy

For each module:

1. **Unit Tests**: Services, utility functions
2. **Integration Tests**: Controller endpoints with test database
3. **E2E Tests**: Full user flows

Example test structure:

```typescript
// posts.service.spec.ts
describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PostsService, PrismaService],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a post', async () => {
    const dto = { type: 'TEXT', content: 'Hello world' };
    const result = await service.create('user-1', dto);
    expect(result.content).toBe('Hello world');
  });
});
```

---

## Final Notes

- All scaffolds follow existing NestJS patterns in the codebase
- DTOs use class-validator for validation
- Controllers use Swagger decorators for API docs
- Services use Prisma for database access
- Guards enforce authentication and authorization
- All endpoints return proper HTTP status codes
- Error handling uses NestJS exceptions

**Ready to implement**: Copy these scaffolds into your codebase, run migrations, and start building!
