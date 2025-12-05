import { http, buildQueryString } from './http';

export interface AnalyticsData {
  id: string;
  artistId: string;
  date: string;
  profileViews: number;
  trackPlays: number;
  trackShares: number;
  newFollowers: number;
  productViews: number;
  productClicks: number;
  sales: number;
  revenue: number;
  topCountries?: Array<{ country: string; count: number }>;
  createdAt: string;
}

export interface AnalyticsSummary {
  profileViews: number;
  trackPlays: number;
  trackShares: number;
  newFollowers: number;
  productViews: number;
  productClicks: number;
  sales: number;
  revenue: number;
  dailyData: AnalyticsData[];
}

export const analyticsApi = {
  async trackEvent(eventType: string, data?: Record<string, any>): Promise<AnalyticsData> {
    return http.post('/analytics/track', {
      eventType,
      data,
    });
  },

  async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const query = buildQueryString(params);
    return http.get(`/analytics${query}`);
  },

  async getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
    const query = buildQueryString({ days: days.toString() });
    return http.get(`/analytics/summary${query}`);
  },

  async getTodayAnalytics(): Promise<AnalyticsData> {
    return http.get('/analytics/today');
  },

  async getTopCountries(limit = 5): Promise<Array<{ country: string; count: number }>> {
    const query = buildQueryString({ limit: limit.toString() });
    return http.get(`/analytics/countries${query}`);
  },
};
