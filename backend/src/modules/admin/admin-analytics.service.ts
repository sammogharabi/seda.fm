import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TopItem {
  id: string;
  name: string;
  count: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  // ============ OVERVIEW METRICS ============
  async getOverviewMetrics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      // User metrics
      totalUsers,
      usersToday,
      usersYesterday,
      usersThisWeek,
      usersThisMonth,
      artistCount,

      // Content metrics
      totalRooms,
      roomsToday,
      totalPlaylists,
      playlistsToday,
      totalMessages,
      messagesToday,
      totalComments,
      commentsToday,

      // Revenue metrics
      totalPurchases,
      purchasesToday,
      completedPurchases,
    ] = await Promise.all([
      // Users
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      this.prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      this.prisma.user.count({ where: { role: 'ARTIST' } }),

      // Content
      this.prisma.room.count(),
      this.prisma.room.count({ where: { createdAt: { gte: today } } }),
      this.prisma.playlist.count(),
      this.prisma.playlist.count({ where: { createdAt: { gte: today } } }),
      this.prisma.message.count({ where: { deletedAt: null } }),
      this.prisma.message.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.comment.count({ where: { createdAt: { gte: today }, deletedAt: null } }),

      // Purchases
      this.prisma.purchase.count(),
      this.prisma.purchase.count({ where: { createdAt: { gte: today } } }),
      this.prisma.purchase.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Calculate growth rates
    const userGrowthToday = usersYesterday > 0
      ? ((usersToday - usersYesterday) / usersYesterday) * 100
      : usersToday > 0 ? 100 : 0;

    return {
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
        artists: artistCount,
        growthToday: Math.round(userGrowthToday * 100) / 100,
      },
      content: {
        rooms: { total: totalRooms, today: roomsToday },
        playlists: { total: totalPlaylists, today: playlistsToday },
        messages: { total: totalMessages, today: messagesToday },
        comments: { total: totalComments, today: commentsToday },
      },
      revenue: {
        totalPurchases,
        purchasesToday,
        completedPurchases,
        conversionRate: totalPurchases > 0
          ? Math.round((completedPurchases / totalPurchases) * 10000) / 100
          : 0,
      },
    };
  }

  // ============ USER ANALYTICS ============
  async getUserGrowthTimeSeries(days = 30): Promise<TimeSeriesData[]> {
    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      data.push({
        date: startOfDay.toISOString().split('T')[0],
        value: count,
      });
    }

    return data;
  }

  async getUsersByRole() {
    const [users, artists, admins, superAdmins] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'ARTIST' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
    ]);

    return {
      USER: users,
      ARTIST: artists,
      ADMIN: admins,
      SUPER_ADMIN: superAdmins,
    };
  }

  async getActiveUsers(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Active users = users who created messages in the time period
    const activeUserIds = await this.prisma.message.findMany({
      where: {
        createdAt: { gte: since },
        deletedAt: null,
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    return {
      count: activeUserIds.length,
      period: `${days} days`,
      since: since.toISOString(),
    };
  }

  // ============ CONTENT ANALYTICS ============
  async getContentGrowthTimeSeries(contentType: 'rooms' | 'playlists' | 'messages', days = 30): Promise<TimeSeriesData[]> {
    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      let count: number;

      switch (contentType) {
        case 'rooms':
          count = await this.prisma.room.count({
            where: { createdAt: { gte: startOfDay, lt: endOfDay } },
          });
          break;
        case 'playlists':
          count = await this.prisma.playlist.count({
            where: { createdAt: { gte: startOfDay, lt: endOfDay } },
          });
          break;
        case 'messages':
          count = await this.prisma.message.count({
            where: { createdAt: { gte: startOfDay, lt: endOfDay }, deletedAt: null },
          });
          break;
      }

      data.push({
        date: startOfDay.toISOString().split('T')[0],
        value: count,
      });
    }

    return data;
  }

  async getTopRooms(limit = 10): Promise<TopItem[]> {
    const rooms = await this.prisma.room.findMany({
      include: {
        _count: {
          select: { messages: true, memberships: true },
        },
        creator: {
          select: {
            profile: { select: { username: true } },
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      count: room._count.messages,
      metadata: {
        members: room._count.memberships,
        creator: room.creator?.profile?.username || 'Unknown',
        genre: room.genre,
      },
    }));
  }

  async getTopPlaylists(limit = 10): Promise<TopItem[]> {
    const playlists = await this.prisma.playlist.findMany({
      include: {
        _count: {
          select: { items: true },
        },
        owner: {
          select: { username: true, displayName: true },
        },
      },
      orderBy: {
        playCount: 'desc',
      },
      take: limit,
    });

    return playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.title,
      count: playlist.playCount,
      metadata: {
        items: playlist._count.items,
        owner: playlist.owner?.displayName || playlist.owner?.username || 'Unknown',
        genre: playlist.genre,
      },
    }));
  }

  // ============ REVENUE ANALYTICS ============
  async getRevenueTimeSeries(days = 30): Promise<TimeSeriesData[]> {
    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const purchases = await this.prisma.purchase.findMany({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay },
          status: 'COMPLETED',
        },
        select: { amount: true },
      });

      const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

      data.push({
        date: startOfDay.toISOString().split('T')[0],
        value: Math.round(totalRevenue * 100) / 100,
      });
    }

    return data;
  }

  async getRevenueByProductType() {
    const purchases = await this.prisma.purchase.findMany({
      where: { status: 'COMPLETED' },
      include: {
        product: { select: { type: true } },
      },
    });

    const revenueByType: Record<string, number> = {};

    for (const purchase of purchases) {
      const type = purchase.product?.type || 'UNKNOWN';
      revenueByType[type] = (revenueByType[type] || 0) + purchase.amount;
    }

    return Object.entries(revenueByType).map(([type, amount]) => ({
      type,
      amount: Math.round(amount * 100) / 100,
    }));
  }

  async getTopSellingProducts(limit = 10): Promise<TopItem[]> {
    const products = await this.prisma.marketplaceProduct.findMany({
      orderBy: { purchaseCount: 'desc' },
      take: limit,
      include: {
        artist: {
          select: {
            profile: { select: { username: true, displayName: true } },
          },
        },
      },
    });

    return products.map(product => ({
      id: product.id,
      name: product.title,
      count: product.purchaseCount,
      metadata: {
        type: product.type,
        price: product.price,
        artist: product.artist?.profile?.displayName || product.artist?.profile?.username || 'Unknown',
      },
    }));
  }

  // ============ ENGAGEMENT ANALYTICS ============
  async getEngagementMetrics(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      messageCount,
      commentCount,
      likeCount,
      repostCount,
      followCount,
    ] = await Promise.all([
      this.prisma.message.count({
        where: { createdAt: { gte: since }, deletedAt: null },
      }),
      this.prisma.comment.count({
        where: { createdAt: { gte: since }, deletedAt: null },
      }),
      this.prisma.like.count({
        where: { createdAt: { gte: since } },
      }),
      this.prisma.repost.count({
        where: { createdAt: { gte: since } },
      }),
      this.prisma.follow.count({
        where: { createdAt: { gte: since } },
      }),
    ]);

    return {
      period: `${days} days`,
      since: since.toISOString(),
      metrics: {
        messages: messageCount,
        comments: commentCount,
        likes: likeCount,
        reposts: repostCount,
        follows: followCount,
        total: messageCount + commentCount + likeCount + repostCount + followCount,
      },
    };
  }

  // ============ ARTIST ANALYTICS ============
  async getTopArtists(limit = 10): Promise<TopItem[]> {
    const artists = await this.prisma.user.findMany({
      where: { role: 'ARTIST' },
      include: {
        profile: { select: { username: true, displayName: true } },
        artistProfile: { select: { artistName: true, verified: true } },
        products: {
          select: { purchaseCount: true },
        },
        _count: {
          select: { products: true },
        },
      },
      take: limit * 2, // Get more to sort by sales
    });

    // Sort by total sales
    const sortedArtists = artists
      .map(artist => ({
        ...artist,
        totalSales: artist.products.reduce((sum, p) => sum + p.purchaseCount, 0),
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);

    return sortedArtists.map(artist => ({
      id: artist.id,
      name: artist.artistProfile?.artistName || artist.profile?.displayName || artist.profile?.username || 'Unknown',
      count: artist.totalSales,
      metadata: {
        products: artist._count.products,
        verified: artist.artistProfile?.verified || false,
      },
    }));
  }

  async getVerificationStats() {
    const [
      pending,
      crawling,
      awaitingAdmin,
      approved,
      denied,
      expired,
    ] = await Promise.all([
      this.prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.verificationRequest.count({ where: { status: 'CRAWLING' } }),
      this.prisma.verificationRequest.count({ where: { status: 'AWAITING_ADMIN' } }),
      this.prisma.verificationRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.verificationRequest.count({ where: { status: 'DENIED' } }),
      this.prisma.verificationRequest.count({ where: { status: 'EXPIRED' } }),
    ]);

    return {
      pending,
      crawling,
      awaitingAdmin,
      approved,
      denied,
      expired,
      total: pending + crawling + awaitingAdmin + approved + denied + expired,
    };
  }
}
