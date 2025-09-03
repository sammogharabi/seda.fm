import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    // Check if user already has a profile
    const existingProfile = await this.prisma.profile.findFirst({
      where: { user_id: userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has a profile');
    }

    // Check if username is already taken
    const existingUsername = await this.prisma.profile.findFirst({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // #COMPLETION_DRIVE: Need to add Profile model to Prisma schema
    return this.prisma.profile.create({
      data: {
        user_id: userId,
        username: dto.username,
        display_name: dto.display_name,
        bio: dto.bio,
        avatar_url: dto.avatar_url,
      },
    });
  }

  async getProfileByUsername(username: string) {
    // #COMPLETION_DRIVE: Need to add Profile model to Prisma schema
    return this.prisma.profile.findFirst({
      where: { username },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getProfileByUserId(userId: string) {
    // #COMPLETION_DRIVE: Need to add Profile model to Prisma schema
    return this.prisma.profile.findFirst({
      where: { user_id: userId },
    });
  }

  async updateProfile(userId: string, username: string, dto: UpdateProfileDto) {
    // Get the profile to check ownership
    const profile = await this.prisma.profile.findFirst({
      where: { username },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.user_id !== userId) {
      throw new ForbiddenException('Not authorized to update this profile');
    }

    // If updating username, check if it's available
    if (dto.username && dto.username !== username) {
      const existingUsername = await this.prisma.profile.findFirst({
        where: { username: dto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    // #COMPLETION_DRIVE: Need to add Profile model to Prisma schema
    return this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        username: dto.username,
        display_name: dto.display_name,
        bio: dto.bio,
        avatar_url: dto.avatar_url,
        updated_at: new Date(),
      },
    });
  }
}