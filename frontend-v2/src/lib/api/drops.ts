import { http, buildQueryString } from './http';

// Drop types
export type DropStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
export type DropGatingType = 'PUBLIC' | 'ROOM_ONLY' | 'FOLLOWERS_ONLY' | 'FOLLOWERS_EARLY_ACCESS';

export interface DropItem {
  id: string;
  sortOrder: number;
  customPrice?: number;
  customTitle?: string;
  maxQuantityPerUser?: number;
  product: NormalizedProduct | null;
}

export interface NormalizedProduct {
  id: string;
  externalId?: string;
  provider: 'native' | 'shopify';
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  coverImage?: string;
  images?: string[];
  type: string;
  status: string;
  inStock: boolean;
  quantity?: number;
  hasVariants: boolean;
  variants?: NormalizedVariant[];
  artistId: string;
  artist?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedVariant {
  id: string;
  externalId?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  quantity?: number;
  options: Record<string, string>;
}

export interface Drop {
  id: string;
  title: string;
  description?: string;
  heroImage?: string;
  status: DropStatus;
  startsAt?: string;
  endsAt?: string;
  showCountdown: boolean;
  gatingType: DropGatingType;
  roomId?: string;
  earlyAccessDays?: number;
  showOnArtistPage: boolean;
  showInRoomFeed: boolean;
  showInSessions: boolean;
  viewCount: number;
  purchaseCount: number;
  totalRevenue: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  items?: DropItem[];
  artist?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  // Access control (for gated drops)
  accessDenied?: boolean;
  accessMessage?: string;
}

export interface CreateDropData {
  title: string;
  description?: string;
  heroImage?: string;
  startsAt?: string;
  endsAt?: string;
  showCountdown?: boolean;
  gatingType?: DropGatingType;
  roomId?: string;
  earlyAccessDays?: number;
  showOnArtistPage?: boolean;
  showInRoomFeed?: boolean;
  showInSessions?: boolean;
  items?: {
    productId: string;
    provider?: string;
    sortOrder?: number;
    customPrice?: number;
    customTitle?: string;
    maxQuantityPerUser?: number;
  }[];
}

export interface UpdateDropData extends Partial<CreateDropData> {}

// Shopify connection types
export interface ShopifyConnectionStatus {
  connected: boolean;
  shopDomain?: string;
  lastSyncedAt?: string;
  syncedProductCount?: number;
  status: string;
}

export interface ShopifySyncResult {
  synced: number;
  errors: string[];
}

export const dropsApi = {
  // Drop CRUD
  async createDrop(data: CreateDropData): Promise<Drop> {
    return http.post('/marketplace/drops', data);
  },

  async updateDrop(id: string, data: UpdateDropData): Promise<Drop> {
    return http.put(`/marketplace/drops/${id}`, data);
  },

  async deleteDrop(id: string): Promise<{ success: boolean }> {
    return http.delete(`/marketplace/drops/${id}`);
  },

  async getDrop(id: string): Promise<Drop> {
    return http.get(`/marketplace/drops/${id}`);
  },

  // Artist drops (with status filter)
  async getMyDrops(status?: DropStatus): Promise<Drop[]> {
    const query = status ? buildQueryString({ status }) : '';
    return http.get(`/marketplace/drops/mine${query}`);
  },

  // Public drops for an artist
  async getArtistDrops(artistId: string): Promise<Drop[]> {
    return http.get(`/marketplace/drops/artist/${artistId}`);
  },

  // Drop actions
  async publishDrop(id: string): Promise<Drop> {
    return http.post(`/marketplace/drops/${id}/publish`);
  },

  async cancelDrop(id: string): Promise<{ success: boolean }> {
    return http.post(`/marketplace/drops/${id}/cancel`);
  },
};

export const shopifyApi = {
  // Shopify OAuth
  async initiateInstall(shopDomain: string): Promise<{ installUrl: string }> {
    return http.post('/marketplace/shopify/install', { shopDomain });
  },

  async getConnectionStatus(): Promise<ShopifyConnectionStatus> {
    return http.get('/marketplace/shopify/status');
  },

  async disconnect(): Promise<{ success: boolean }> {
    return http.delete('/marketplace/shopify/disconnect');
  },

  async syncProducts(): Promise<ShopifySyncResult> {
    return http.post('/marketplace/shopify/sync');
  },
};
