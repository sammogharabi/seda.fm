import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(supabaseId: string, email: string) {
    // First, try to find an existing user by supabaseId
    let user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: { profile: true },
    });

    if (user) {
      // Update email if changed
      if (user.email !== email) {
        user = await this.prisma.user.update({
          where: { supabaseId },
          data: { email },
          include: { profile: true },
        });
      }
      return user;
    }

    // User doesn't exist by supabaseId - check if there's a user with this email
    // This handles the case where magic link verification creates a new Supabase user ID
    const existingUserByEmail = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (existingUserByEmail) {
      // Update the existing user's supabaseId to the new one
      this.logger.log(`Updating supabaseId for existing user ${existingUserByEmail.id} (email: ${email})`);
      user = await this.prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: { supabaseId },
        include: { profile: true },
      });
      return user;
    }

    // No existing user found - create new user with profile
    this.logger.log(`Creating new user for supabaseId: ${supabaseId}, email: ${email}`);

    // Generate username from email
    const emailPrefix = email.split('@')[0];
    let baseUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseUsername.length < 3) {
      baseUsername = baseUsername + 'user';
    }

    // Find unique username
    let username = baseUsername;
    let counter = 1;
    while (await this.prisma.profile.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create user with profile in a transaction
    user = await this.prisma.user.create({
      data: {
        supabaseId,
        email,
        role: UserRole.USER,
        profile: {
          create: {
            username,
            displayName: emailPrefix,
          },
        },
      },
      include: { profile: true },
    });

    this.logger.log(`Created new user ${user.id} with profile (username: ${username})`);
    return user;
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        artistProfile: true,
      },
    });
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
      include: {
        artistProfile: true,
      },
    });
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
