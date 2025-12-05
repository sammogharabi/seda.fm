import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

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
