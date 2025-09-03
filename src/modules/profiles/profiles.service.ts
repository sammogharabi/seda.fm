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
      where: { userId: userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has a profile');
    }

    // Canonicalize username: trim and lowercase
    const canonicalUsername = dto.username.trim().toLowerCase();

    // Check if username is already taken (case-insensitive)
    const existingUsername = await this.prisma.profile.findFirst({
      where: { username: canonicalUsername },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    return this.prisma.profile.create({
      data: {
        userId: userId,
        username: canonicalUsername,
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      },
    });
  }

  async getProfileByUsername(username: string) {
    // Canonicalize username for lookup
    const canonicalUsername = username.trim().toLowerCase();
    
    return this.prisma.profile.findFirst({
      where: { username: canonicalUsername },
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
    return this.prisma.profile.findFirst({
      where: { userId: userId },
    });
  }

  async updateProfile(userId: string, username: string, dto: UpdateProfileDto) {
    // Canonicalize username for lookup
    const canonicalUsername = username.trim().toLowerCase();
    
    // Get the profile to check ownership
    const profile = await this.prisma.profile.findFirst({
      where: { username: canonicalUsername },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this profile');
    }

    // If updating username, check if it's available
    let newCanonicalUsername: string | undefined;
    if (dto.username) {
      newCanonicalUsername = dto.username.trim().toLowerCase();
      
      // Only check availability if username is actually changing
      if (newCanonicalUsername !== canonicalUsername) {
        const existingUsername = await this.prisma.profile.findFirst({
          where: { username: newCanonicalUsername },
        });

        if (existingUsername) {
          throw new ConflictException('Username already taken');
        }
      }
    }

    return this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        username: newCanonicalUsername || profile.username,
        displayName: dto.displayName !== undefined ? dto.displayName : profile.displayName,
        bio: dto.bio !== undefined ? dto.bio : profile.bio,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : profile.avatarUrl,
        updatedAt: new Date(),
      },
    });
  }
}
