import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(
    artistId: string,
    eventType: string,
    data: Record<string, any>,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await this.prisma.artistAnalytics.findUnique({
      where: {
        artistId_date: {
          artistId,
          date: today,
        },
      },
    });

    const updateData: any = {};

    switch (eventType) {
      case 'profile_view':
        updateData.profileViews = { increment: 1 };
        break;
      case 'track_play':
        updateData.trackPlays = { increment: 1 };
        break;
      case 'track_share':
        updateData.trackShares = { increment: 1 };
        break;
      case 'new_follower':
        updateData.newFollowers = { increment: 1 };
        break;
      case 'product_view':
        updateData.productViews = { increment: 1 };
        break;
      case 'product_click':
        updateData.productClicks = { increment: 1 };
        break;
      case 'sale':
        updateData.sales = { increment: 1 };
        if (data.amount) {
          updateData.revenue = { increment: data.amount };
        }
        break;
    }

    if (analytics) {
      return this.prisma.artistAnalytics.update({
        where: {
          artistId_date: {
            artistId,
            date: today,
          },
        },
        data: updateData,
      });
    } else {
      return this.prisma.artistAnalytics.create({
        data: {
          artistId,
          date: today,
          ...Object.keys(updateData).reduce((acc: Record<string, any>, key) => {
            acc[key] = updateData[key].increment || 0;
            return acc;
          }, {}),
        },
      });
    }
  }

  async getAnalytics(artistId: string, startDate: Date, endDate: Date) {
    return this.prisma.artistAnalytics.findMany({
      where: {
        artistId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getAnalyticsSummary(artistId: string, days = 30) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await this.getAnalytics(artistId, startDate, endDate);

    const summary = {
      profileViews: 0,
      trackPlays: 0,
      trackShares: 0,
      newFollowers: 0,
      productViews: 0,
      productClicks: 0,
      sales: 0,
      revenue: 0,
      dailyData: analytics,
    };

    analytics.forEach((day) => {
      summary.profileViews += day.profileViews;
      summary.trackPlays += day.trackPlays;
      summary.trackShares += day.trackShares;
      summary.newFollowers += day.newFollowers;
      summary.productViews += day.productViews;
      summary.productClicks += day.productClicks;
      summary.sales += day.sales;
      summary.revenue += day.revenue;
    });

    return summary;
  }

  async getTodayAnalytics(artistId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await this.prisma.artistAnalytics.findUnique({
      where: {
        artistId_date: {
          artistId,
          date: today,
        },
      },
    });

    if (!analytics) {
      return {
        artistId,
        date: today,
        profileViews: 0,
        trackPlays: 0,
        trackShares: 0,
        newFollowers: 0,
        productViews: 0,
        productClicks: 0,
        sales: 0,
        revenue: 0,
      };
    }

    return analytics;
  }

  async getTopCountries(artistId: string, limit = 5) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const analytics = await this.prisma.artistAnalytics.findMany({
      where: {
        artistId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        topCountries: true,
      },
    });

    // Aggregate country data
    const countryMap = new Map<string, number>();

    analytics.forEach((day) => {
      const countries = day.topCountries as any[];
      if (Array.isArray(countries)) {
        countries.forEach((country) => {
          const current = countryMap.get(country.country) || 0;
          countryMap.set(country.country, current + country.count);
        });
      }
    });

    // Convert to array and sort
    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return topCountries;
  }
}
