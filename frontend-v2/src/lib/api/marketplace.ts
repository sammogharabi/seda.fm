import { http, buildQueryString } from './http';

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

// Stripe types
export interface StripeConfig {
  publishableKey: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface ConnectStatus {
  hasAccount: boolean;
  status: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted?: boolean;
}

export interface ConnectBalance {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
}

// PayPal types
export interface PayPalConfig {
  clientId: string;
  isConfigured: boolean;
}

export interface PayPalOrder {
  orderId: string;
  approvalUrl: string;
}

export interface PayPalCaptureResult {
  success: boolean;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface RevenueBreakdown {
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  artistNet: number;
}

export const marketplaceApi = {
  // Product endpoints
  async createProduct(data: Partial<Product>): Promise<Product> {
    return http.post('/marketplace/products', data);
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return http.put(`/marketplace/products/${id}`, data);
  },

  async deleteProduct(id: string): Promise<void> {
    return http.delete(`/marketplace/products/${id}`);
  },

  async getProduct(id: string): Promise<Product> {
    return http.get(`/marketplace/products/${id}`);
  },

  async getAllProducts(type?: string): Promise<Product[]> {
    const query = type ? buildQueryString({ type }) : '';
    return http.get(`/marketplace/products${query}`);
  },

  async getArtistProducts(artistId: string, includeDrafts = false): Promise<Product[]> {
    const query = buildQueryString({ includeDrafts: includeDrafts.toString() });
    return http.get(`/marketplace/artists/${artistId}/products${query}`);
  },

  // Purchase endpoints
  async createPurchase(data: { productId: string; amount: number; paymentMethod?: string; paymentIntentId?: string }): Promise<Purchase> {
    return http.post('/marketplace/purchases', data);
  },

  async completePurchase(id: string): Promise<Purchase> {
    return http.post(`/marketplace/purchases/${id}/complete`);
  },

  async getUserPurchases(): Promise<Purchase[]> {
    return http.get('/marketplace/purchases');
  },

  async incrementDownloadCount(id: string): Promise<Purchase> {
    return http.post(`/marketplace/purchases/${id}/download`);
  },

  // Revenue endpoints
  async getRevenueBreakdown(
    amount: number,
    paymentMethod: 'stripe' | 'paypal' = 'stripe',
  ): Promise<RevenueBreakdown> {
    const query = buildQueryString({ amount: amount.toString(), paymentMethod });
    return http.get(`/marketplace/revenue/breakdown${query}`);
  },

  async getRevenue(): Promise<Revenue> {
    return http.get('/marketplace/revenue');
  },

  async getRevenueHistory(): Promise<Revenue[]> {
    return http.get('/marketplace/revenue/history');
  },

  // Fan engagement endpoints
  async getFans(): Promise<FanEngagement[]> {
    return http.get('/marketplace/fans');
  },

  async getTopFans(limit = 10): Promise<FanEngagement[]> {
    const query = buildQueryString({ limit: limit.toString() });
    return http.get(`/marketplace/fans/top${query}`);
  },

  // Stripe payment endpoints
  async getStripeConfig(): Promise<StripeConfig> {
    return http.get('/stripe/config');
  },

  async createCheckoutSession(data: {
    productId: string;
    amount: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    return http.post('/stripe/checkout/session', data);
  },

  // Stripe Connect endpoints (for artists)
  async createConnectAccount(): Promise<{ accountId: string }> {
    return http.post('/stripe/connect/account');
  },

  async getConnectOnboardingLink(data: {
    refreshUrl: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    return http.post('/stripe/connect/onboarding', data);
  },

  async getConnectStatus(): Promise<ConnectStatus> {
    return http.get('/stripe/connect/status');
  },

  async getConnectBalance(): Promise<ConnectBalance> {
    return http.get('/stripe/connect/balance');
  },

  async requestPayout(data: {
    amount: number;
    currency?: string;
  }): Promise<{
    payoutId: string;
    amount: number;
    currency: string;
    status: string;
    arrivalDate: number;
  }> {
    return http.post('/stripe/connect/payout', data);
  },

  // PayPal payment endpoints
  async getPayPalConfig(): Promise<PayPalConfig> {
    return http.get('/paypal/config');
  },

  async createPayPalOrder(data: {
    productId: string;
    amount: number;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PayPalOrder> {
    return http.post('/paypal/orders', data);
  },

  async capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
    return http.post(`/paypal/orders/${orderId}/capture`);
  },

  async getPayPalOrder(orderId: string): Promise<{
    orderId: string;
    status: string;
    amount: string;
    currency: string;
  }> {
    return http.get(`/paypal/orders/${orderId}`);
  },

  // PayPal Connect endpoints (for artists)
  async savePayPalEmail(email: string): Promise<{ success: boolean; email: string }> {
    return http.post('/paypal/connect/email', { email });
  },

  async getPayPalConnectStatus(): Promise<{ hasPayPal: boolean; email: string | null }> {
    return http.get('/paypal/connect/status');
  },
};
