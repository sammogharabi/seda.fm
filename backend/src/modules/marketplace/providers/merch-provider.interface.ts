/**
 * Multi-provider commerce abstraction for Seda marketplace.
 * Supports Seda Native (default) and Shopify headless providers.
 */

export type MerchProviderType = 'native' | 'shopify';

/**
 * Normalized product representation across all providers.
 * Frontend receives this consistent shape regardless of source.
 */
export interface NormalizedProduct {
  id: string;
  externalId?: string; // Provider-specific ID (e.g., Shopify product ID)
  provider: MerchProviderType;

  // Basic info
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number; // Original price for sale items
  currency: string; // USD, etc.

  // Media
  coverImage?: string;
  images?: string[];

  // Product type (normalized)
  type: NormalizedProductType;

  // Availability
  status: 'draft' | 'published' | 'archived';
  inStock: boolean;
  quantity?: number; // For inventory-tracked products

  // Variants (for merch with sizes/colors)
  hasVariants: boolean;
  variants?: NormalizedVariant[];

  // Digital product fields
  fileUrl?: string;
  fileSize?: number;

  // External link fields (for link-type products)
  externalUrl?: string;
  externalPlatform?: string;

  // Artist info
  artistId: string;
  artist?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };

  // Stats
  viewCount?: number;
  purchaseCount?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type NormalizedProductType =
  | 'digital_track'
  | 'digital_album'
  | 'merch'
  | 'concert_ticket'
  | 'preset_pack'
  | 'sample_pack';

export interface NormalizedVariant {
  id: string;
  externalId?: string;
  title: string; // e.g., "Large / Black"
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  quantity?: number;
  options: Record<string, string>; // e.g., { size: 'L', color: 'Black' }
}

export interface ProductFilters {
  type?: NormalizedProductType;
  status?: 'draft' | 'published' | 'archived';
  inStock?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CheckoutParams {
  productId: string;
  variantId?: string;
  quantity?: number;
  buyerId: string;

  // For physical products
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };

  // Attribution
  dropId?: string;
  referrer?: string;
}

export interface CheckoutResult {
  provider: MerchProviderType;
  checkoutUrl: string; // Where to redirect the user
  checkoutId?: string; // Provider's checkout/session ID
  isExternal: boolean; // True if redirecting to external checkout (Shopify)
}

/**
 * Abstract interface for merch providers.
 * Each provider (Native, Shopify) implements this interface.
 */
export interface MerchProvider {
  /**
   * Get the provider type identifier.
   */
  getProviderType(): MerchProviderType;

  /**
   * List products with optional filtering.
   */
  listProducts(artistId: string, filters?: ProductFilters): Promise<NormalizedProduct[]>;

  /**
   * Get a single product by ID.
   */
  getProduct(productId: string): Promise<NormalizedProduct | null>;

  /**
   * Create a checkout session/link for purchasing.
   * Returns URL to redirect user to for payment.
   */
  createCheckoutLink(params: CheckoutParams): Promise<CheckoutResult>;

  /**
   * Check if this provider is available for the given artist.
   * Used to determine which providers to show in settings.
   */
  isAvailable(artistId: string): Promise<boolean>;
}

/**
 * Provider configuration stored per artist.
 */
export interface ArtistProviderConfig {
  artistId: string;
  activeProvider: MerchProviderType;

  // Native provider is always available
  nativeEnabled: boolean;

  // Shopify connection (if any)
  shopifyConnected: boolean;
  shopifyShopDomain?: string;
  shopifyLastSyncedAt?: Date;
}
