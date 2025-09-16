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

  async updateGenres(userId: string, genres: string[]) {
    // #COMPLETION_DRIVE: Assuming user might not have a profile yet
    // #SUGGEST_VERIFY: Check if we should auto-create profile or require explicit creation first

    // Get or create profile for the user
    let profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    const isFirstTimeCompletion = !profile || !profile.genresCompleted;

    if (!profile) {
      // Auto-create profile if user doesn't have one
      // Use a temporary username based on user ID that they can change later
      const tempUsername = `user_${userId.slice(-8)}`;
      profile = await this.prisma.profile.create({
        data: {
          userId: userId,
          username: tempUsername,
          genres: genres,
          genresCompleted: true,
          genresCompletedAt: new Date(),
        },
      });
    } else {
      // Update existing profile
      profile = await this.prisma.profile.update({
        where: { id: profile.id },
        data: {
          genres: genres,
          genresCompleted: true,
          genresCompletedAt: profile.genresCompleted ? profile.genresCompletedAt : new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return {
      profile,
      isFirstTimeCompletion,
      statusCode: isFirstTimeCompletion ? 201 : 200,
    };
  }

  async getOnboardingStatus(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    const genresCompleted = profile?.genresCompleted || false;
    const hasGenres = profile?.genres && profile.genres.length > 0;

    return {
      genresCompleted,
      genresCompletedAt: profile?.genresCompletedAt || null,
      shouldShowGenresStep: !genresCompleted && !hasGenres,
    };
  }

  // Utility function to check if user should see genres step
  async shouldShowGenresStep(userId: string): Promise<boolean> {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    // Show genres step if user has no profile OR profile exists but genres not completed
    return !profile?.genresCompleted && (!profile?.genres || profile.genres.length === 0);
  }
}
