import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(supabaseId: string, email: string) {
    return this.prisma.user.upsert({
      where: { supabaseId },
      update: { email },
      create: {
        supabaseId,
        email,
        role: UserRole.USER,
      },
    });
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
