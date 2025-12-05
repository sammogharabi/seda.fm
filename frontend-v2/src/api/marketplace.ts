import { apiClient } from './client';

export interface Product {
  id: string;
  artistId: string;
  type: 'DIGITAL_TRACK' | 'DIGITAL_ALBUM' | 'MERCHANDISE_LINK' | 'CONCERT_LINK' | 'PRESET_PACK' | 'SAMPLE_PACK';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  title: string;
  description?: string;
  price: number;
  coverImage?: string;
  trackRef?: any;
  fileUrl?: string;
  fileSize?: number;
  externalUrl?: string;
  externalPlatform?: string;
  packContents?: any;
  viewCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  artist?: any;
}

export interface Purchase {
  id: string;
  productId: string;
  buyerId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
  paymentMethod?: string;
  paymentIntentId?: string;
  downloadCount: number;
  lastDownloadAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  product?: Product;
}

export interface Revenue {
  id: string;
  artistId: string;
  totalRevenue: number;
  pendingRevenue: number;
  withdrawnRevenue: number;
  currentMonth: number;
  currentYear: number;
  monthlyRevenue: number;
  totalSales: number;
  monthlySales: number;
  updatedAt: string;
}

export interface FanEngagement {
  id: string;
  artistId: string;
  fanId: string;
  totalPlays: number;
  totalPurchases: number;
  totalSpent: number;
  lastEngagement: string;
  firstEngagement: string;
  fan?: any;
}

export const marketplaceApi = {
  // Product endpoints
  async createProduct(data: Partial<Product>) {
    const response = await apiClient.post('/marketplace/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const response = await apiClient.put(`/marketplace/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/marketplace/products/${id}`);
    return response.data;
  },

  async getProduct(id: string) {
    const response = await apiClient.get(`/marketplace/products/${id}`);
    return response.data;
  },

  async getAllProducts(type?: string) {
    const params = type ? { type } : {};
    const response = await apiClient.get('/marketplace/products', { params });
    return response.data;
  },

  async getArtistProducts(artistId: string, includeDrafts = false) {
    const params = { includeDrafts: includeDrafts.toString() };
    const response = await apiClient.get(`/marketplace/artists/${artistId}/products`, { params });
    return response.data;
  },

  // Purchase endpoints
  async createPurchase(data: { productId: string; amount: number; paymentMethod?: string; paymentIntentId?: string }) {
    const response = await apiClient.post('/marketplace/purchases', data);
    return response.data;
  },

  async completePurchase(id: string) {
    const response = await apiClient.post(`/marketplace/purchases/${id}/complete`);
    return response.data;
  },

  async getUserPurchases() {
    const response = await apiClient.get('/marketplace/purchases');
    return response.data;
  },

  async incrementDownloadCount(id: string) {
    const response = await apiClient.post(`/marketplace/purchases/${id}/download`);
    return response.data;
  },

  // Revenue endpoints
  async getRevenue() {
    const response = await apiClient.get('/marketplace/revenue');
    return response.data;
  },

  async getRevenueHistory() {
    const response = await apiClient.get('/marketplace/revenue/history');
    return response.data;
  },

  // Fan engagement endpoints
  async getFans() {
    const response = await apiClient.get('/marketplace/fans');
    return response.data;
  },

  async getTopFans(limit = 10) {
    const params = { limit: limit.toString() };
    const response = await apiClient.get('/marketplace/fans/top', { params });
    return response.data;
  },
};
