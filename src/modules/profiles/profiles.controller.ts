import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
}