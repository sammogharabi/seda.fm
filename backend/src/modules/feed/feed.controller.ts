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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { FeedService } from './feed.service';
import { PostsService } from './posts.service';
import { CommentsService } from './comments.service';
import { LikesService } from './likes.service';
import { FollowsService } from './follows.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetFeedDto } from './dto/get-feed.dto';

@ApiTags('feed')
@Controller('feed')
@UseGuards(AuthGuard, FeatureGuard)
@Feature('FEED')
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
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  async getFeed(@Request() req: any, @Query() query: GetFeedDto) {
    const userId = req.user.id;
    return this.feedService.getFeed(userId, query);
  }

  @Get('global')
  @ApiOperation({ summary: 'Get global feed (all public posts)' })
  @ApiResponse({ status: 200, description: 'Global feed retrieved successfully' })
  async getGlobalFeed(@Query() query: GetFeedDto) {
    return this.feedService.getGlobalFeed(query);
  }

  // === POSTS ===

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    const userId = req.user.id;
    return this.postsService.create(userId, dto);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get single post with comments' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.postsService.getById(id, userId);
  }

  @Patch('posts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdatePostDto,
  ) {
    const userId = req.user.id;
    return this.postsService.update(id, userId, dto);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own post' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.postsService.delete(id, userId);
  }

  @Post('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 200, description: 'Post liked successfully' })
  async likePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.likesService.likePost(userId, postId);
  }

  @Delete('posts/:id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 204, description: 'Post unliked successfully' })
  async unlikePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.likesService.unlikePost(userId, postId);
  }

  @Post('posts/:id/repost')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Repost a post' })
  @ApiResponse({ status: 201, description: 'Post reposted successfully' })
  async repost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.postsService.repost(userId, postId);
  }

  @Delete('posts/:id/repost')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove repost' })
  @ApiResponse({ status: 204, description: 'Repost removed successfully' })
  async unrepost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.postsService.unrepost(userId, postId);
  }

  // === COMMENTS ===

  @Post('posts/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add comment to post' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
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
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getComments(@Param('id') postId: string, @Query() query: GetFeedDto) {
    return this.commentsService.getByPost(postId, query);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.commentsService.delete(id, userId);
  }

  @Post('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a comment' })
  @ApiResponse({ status: 200, description: 'Comment liked successfully' })
  async likeComment(@Param('id') commentId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.likesService.likeComment(userId, commentId);
  }

  @Delete('comments/:id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiResponse({ status: 204, description: 'Comment unliked successfully' })
  async unlikeComment(@Param('id') commentId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.likesService.unlikeComment(userId, commentId);
  }

  // === FOLLOWS ===

  @Post('follow/:username')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed successfully' })
  async follow(@Param('username') username: string, @Request() req: any) {
    const userId = req.user.id;
    return this.followsService.follow(userId, username);
  }

  @Delete('follow/:username')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 204, description: 'User unfollowed successfully' })
  async unfollow(@Param('username') username: string, @Request() req: any) {
    const userId = req.user.id;
    await this.followsService.unfollow(userId, username);
  }

  @Get('followers/:username')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
  async getFollowers(@Param('username') username: string, @Query() query: GetFeedDto) {
    return this.followsService.getFollowers(username, query);
  }

  @Get('following/:username')
  @ApiOperation({ summary: 'Get users followed by user' })
  @ApiResponse({ status: 200, description: 'Following retrieved successfully' })
  async getFollowing(@Param('username') username: string, @Query() query: GetFeedDto) {
    return this.followsService.getFollowing(username, query);
  }
}
