import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateGenresDto } from './dto/update-genres.dto';
import { UpdateCustomizationDto } from './dto/update-customization.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
@UseGuards(AuthGuard, FeatureGuard)
@Feature('PROFILES')
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or username already taken',
  })
  @ApiResponse({
    status: 409,
    description: 'User already has a profile',
  })
  async createProfile(@Request() req: any, @Body() dto: CreateProfileDto) {
    const userId = req.user.id;
    return this.profilesService.createProfile(userId, dto);
  }

  @Get('check-username')
  @Public()
  @ApiOperation({ summary: 'Check if username is available (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Username availability checked',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        username: { type: 'string' },
      },
    },
  })
  async checkUsername(@Query('username') username: string) {
    const profile = await this.profilesService.getProfileByUsername(username);
    return {
      available: !profile,
      username,
    };
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get profile by username' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async getProfile(@Param('username') username: string) {
    const profile = await this.profilesService.getProfileByUsername(username);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Patch(':username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this profile',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async updateProfile(
    @Request() req: any,
    @Param('username') username: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user.id;
    return this.profilesService.updateProfile(userId, username, dto);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User has no profile',
  })
  async getMyProfile(@Request() req: any) {
    const userId = req.user.id;
    const profile = await this.profilesService.getProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Post('me/genres')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user genres and mark onboarding complete' })
  @ApiResponse({
    status: 200,
    description: 'Genres updated successfully (existing user)',
  })
  @ApiResponse({
    status: 201,
    description: 'Genres set successfully (first time completion)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid genres data',
  })
  async updateGenres(@Request() req: any, @Body() dto: UpdateGenresDto) {
    const userId = req.user.id;
    return this.profilesService.updateGenres(userId, dto.genres);
  }

  @Get('me/onboarding-status')
  @ApiOperation({ summary: 'Check current user onboarding completion status' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved',
    schema: {
      type: 'object',
      properties: {
        genresCompleted: { type: 'boolean' },
        genresCompletedAt: { type: 'string', format: 'date-time', nullable: true },
        shouldShowGenresStep: { type: 'boolean' },
      },
    },
  })
  async getOnboardingStatus(@Request() req: any) {
    const userId = req.user.id;
    return this.profilesService.getOnboardingStatus(userId);
  }

  // Profile Customization Endpoints

  @Patch('me/customization')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update profile customization (cover, photos, videos, highlights)' })
  async updateCustomization(@Request() req: any, @Body() dto: UpdateCustomizationDto) {
    const userId = req.user.id;
    return this.profilesService.updateProfileCustomization(userId, dto);
  }

  // Follower/Following Endpoints

  @Post(':username/follow')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(@Request() req: any, @Param('username') username: string) {
    const userId = req.user.id;
    return this.profilesService.followUser(userId, username);
  }

  @Post(':username/unfollow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(@Request() req: any, @Param('username') username: string) {
    const userId = req.user.id;
    return this.profilesService.unfollowUser(userId, username);
  }

  @Get(':username/followers')
  @ApiOperation({ summary: 'Get user followers' })
  async getFollowers(
    @Param('username') username: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.profilesService.getFollowers(username, parsedLimit);
  }

  @Get(':username/following')
  @ApiOperation({ summary: 'Get users that this user follows' })
  async getFollowing(
    @Param('username') username: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.profilesService.getFollowing(username, parsedLimit);
  }

  @Get(':username/is-following')
  @ApiOperation({ summary: 'Check if current user is following this user' })
  async isFollowing(@Request() req: any, @Param('username') username: string) {
    const userId = req.user.id;
    const following = await this.profilesService.isFollowing(userId, username);
    return { following };
  }

  // Stats Endpoints

  @Get(':username/stats')
  @ApiOperation({ summary: 'Get profile statistics (followers, posts, tracks, plays)' })
  async getProfileStats(@Param('username') username: string) {
    return this.profilesService.getProfileStats(username);
  }

  // Content Endpoints

  @Get(':username/posts')
  @ApiOperation({ summary: 'Get user posts' })
  async getProfilePosts(
    @Param('username') username: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.profilesService.getProfilePosts(username, parsedLimit, parsedOffset);
  }

  @Get(':username/comments')
  @ApiOperation({ summary: 'Get user comment history' })
  async getProfileComments(
    @Param('username') username: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.profilesService.getProfileComments(username, parsedLimit, parsedOffset);
  }

  @Get(':username/tracks')
  @ApiOperation({ summary: 'Get user published tracks' })
  async getProfileTracks(@Param('username') username: string) {
    return this.profilesService.getProfileTracks(username);
  }

  @Get(':username/top-fans')
  @ApiOperation({ summary: 'Get top fans by total spent' })
  async getTopFans(
    @Param('username') username: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.profilesService.getTopFans(username, parsedLimit);
  }
}
