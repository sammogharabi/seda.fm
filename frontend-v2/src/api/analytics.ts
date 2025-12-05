import { apiClient } from './client';

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
  async trackEvent(eventType: string, data?: Record<string, any>) {
    const response = await apiClient.post('/analytics/track', {
      eventType,
      data,
    });
    return response.data;
  },

  async getAnalytics(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get('/analytics', { params });
    return response.data as AnalyticsData[];
  },

  async getAnalyticsSummary(days = 30) {
    const params = { days: days.toString() };
    const response = await apiClient.get('/analytics/summary', { params });
    return response.data as AnalyticsSummary;
  },

  async getTodayAnalytics() {
    const response = await apiClient.get('/analytics/today');
    return response.data as AnalyticsData;
  },

  async getTopCountries(limit = 5) {
    const params = { limit: limit.toString() };
    const response = await apiClient.get('/analytics/countries', { params });
    return response.data as Array<{ country: string; count: number }>;
  },
};
