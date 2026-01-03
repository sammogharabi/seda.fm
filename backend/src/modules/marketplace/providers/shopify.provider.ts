import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../config/prisma.service';
import { ShopifyConnectionStatus, Prisma } from '@prisma/client';
import {
  MerchProvider,
  MerchProviderType,
  NormalizedProduct,
  NormalizedProductType,
  NormalizedVariant,
  ProductFilters,
  CheckoutParams,
  CheckoutResult,
} from './merch-provider.interface';

/**
 * Shopify headless provider - syncs products from Shopify stores.
 * Uses Storefront API for checkout, Admin API for sync.
 */
@Injectable()
export class ShopifyProvider implements MerchProvider {
  private readonly logger = new Logger(ShopifyProvider.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  getProviderType(): MerchProviderType {
    return 'shopify';
  }

  async listProducts(
    artistId: string,
    filters?: ProductFilters,
  ): Promise<NormalizedProduct[]> {
    // Get the artist's Shopify connection
    const connection = await this.prisma.shopifyConnection.findUnique({
      where: { artistId },
      include: { artist: { include: { artistProfile: true, profile: true } } },
    });

    if (!connection || connection.status !== ShopifyConnectionStatus.CONNECTED) {
      return [];
    }

    // Build where clause for cached products
    const where: any = {
      connectionId: connection.id,
    };

    if (filters?.status) {
      where.status = filters.status;
    } else {
      where.status = 'active';
    }

    if (filters?.inStock !== undefined) {
      where.availableForSale = filters.inStock;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.shopifyProduct.findMany({
      where,
      orderBy: { lastSyncedAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return products.map((p) =>
      this.normalizeShopifyProduct(p, connection.artist),
    );
  }

  async getProduct(productId: string): Promise<NormalizedProduct | null> {
    const product = await this.prisma.shopifyProduct.findUnique({
      where: { id: productId },
      include: {
        connection: {
          include: {
            artist: { include: { artistProfile: true, profile: true } },
          },
        },
      },
    });

    if (!product) return null;

    return this.normalizeShopifyProduct(product, product.connection.artist);
  }

  async createCheckoutLink(params: CheckoutParams): Promise<CheckoutResult> {
    // Get the product to find the Shopify connection
    const product = await this.prisma.shopifyProduct.findUnique({
      where: { id: params.productId },
      include: { connection: true },
    });

    if (!product) {
      throw new Error('Shopify product not found');
    }

    // Build Shopify checkout URL
    // For now, use direct product URL (Shopify hosted checkout)
    const shopDomain = product.connection.shopDomain;
    const productHandle = product.handle || product.shopifyProductId;

    // Build checkout URL with attribution
    let checkoutUrl = `https://${shopDomain}/products/${productHandle}`;

    // Add variant if specified
    if (params.variantId) {
      const variants = product.variants as any[];
      const variant = variants?.find((v: any) => v.id === params.variantId);
      if (variant?.shopifyVariantId) {
        checkoutUrl += `?variant=${variant.shopifyVariantId}`;
      }
    }

    // Add attribution params
    const url = new URL(checkoutUrl);
    url.searchParams.set('ref', 'seda');
    url.searchParams.set('utm_source', 'seda');
    url.searchParams.set('utm_medium', 'marketplace');
    if (params.dropId) {
      url.searchParams.set('drop', params.dropId);
    }

    return {
      provider: 'shopify',
      checkoutUrl: url.toString(),
      isExternal: true, // Shopify hosted checkout
    };
  }

  async isAvailable(artistId: string): Promise<boolean> {
    const connection = await this.prisma.shopifyConnection.findUnique({
      where: { artistId },
    });

    return (
      connection !== null &&
      connection.status === ShopifyConnectionStatus.CONNECTED
    );
  }

  /**
   * Sync products from Shopify Admin API to local cache.
   * Called by ShopifyService after OAuth or on manual sync.
   */
  async syncProducts(artistId: string): Promise<{ synced: number; errors: string[] }> {
    const connection = await this.prisma.shopifyConnection.findUnique({
      where: { artistId },
    });

    if (!connection) {
      throw new Error('No Shopify connection found');
    }

    const errors: string[] = [];
    let synced = 0;

    try {
      // Fetch products from Shopify Admin API
      const products = await this.fetchShopifyProducts(connection);

      for (const shopifyProduct of products) {
        try {
          await this.upsertCachedProduct(connection.id, shopifyProduct);
          synced++;
        } catch (error) {
          this.logger.error(
            `Failed to sync product ${shopifyProduct.id}: ${error.message}`,
          );
          errors.push(`Product ${shopifyProduct.title}: ${error.message}`);
        }
      }

      // Update connection sync status
      await this.prisma.shopifyConnection.update({
        where: { id: connection.id },
        data: {
          lastSyncedAt: new Date(),
          lastSyncStatus: errors.length > 0 ? 'partial' : 'success',
          syncedProductCount: synced,
        },
      });
    } catch (error) {
      this.logger.error(`Shopify sync failed: ${error.message}`);
      await this.prisma.shopifyConnection.update({
        where: { id: connection.id },
        data: {
          lastSyncStatus: 'failed',
        },
      });
      throw error;
    }

    return { synced, errors };
  }

  /**
   * Fetch products from Shopify Admin API
   */
  private async fetchShopifyProducts(connection: any): Promise<any[]> {
    const apiVersion = '2024-01';
    const url = `https://${connection.shopDomain}/admin/api/${apiVersion}/products.json`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': connection.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shopify API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.products || [];
  }

  /**
   * Upsert a cached Shopify product
   */
  private async upsertCachedProduct(
    connectionId: string,
    shopifyProduct: any,
  ): Promise<void> {
    const firstVariant = shopifyProduct.variants?.[0];
    const firstImage = shopifyProduct.images?.[0];

    const productData = {
      title: shopifyProduct.title,
      description: shopifyProduct.body_html
        ? this.stripHtml(shopifyProduct.body_html)
        : null,
      productType: shopifyProduct.product_type,
      vendor: shopifyProduct.vendor,
      handle: shopifyProduct.handle,
      price: parseFloat(firstVariant?.price || '0'),
      compareAtPrice: firstVariant?.compare_at_price
        ? parseFloat(firstVariant.compare_at_price)
        : null,
      currency: 'USD',
      coverImage: firstImage?.src || null,
      images: shopifyProduct.images?.map((img: any) => img.src) || null,
      status: shopifyProduct.status || 'active',
      availableForSale: shopifyProduct.status === 'active',
      totalInventory: this.calculateTotalInventory(shopifyProduct.variants),
      hasVariants: (shopifyProduct.variants?.length || 0) > 1,
      variants: this.mapVariants(shopifyProduct.variants),
      tags: shopifyProduct.tags
        ? shopifyProduct.tags.split(',').map((t: string) => t.trim())
        : [],
      lastSyncedAt: new Date(),
      shopifyUpdatedAt: shopifyProduct.updated_at
        ? new Date(shopifyProduct.updated_at)
        : null,
    };

    await this.prisma.shopifyProduct.upsert({
      where: {
        connectionId_shopifyProductId: {
          connectionId,
          shopifyProductId: String(shopifyProduct.id),
        },
      },
      update: productData,
      create: {
        connectionId,
        shopifyProductId: String(shopifyProduct.id),
        ...productData,
      },
    });
  }

  /**
   * Calculate total inventory across all variants
   */
  private calculateTotalInventory(variants: any[]): number | null {
    if (!variants?.length) return null;

    let total = 0;
    let hasInventory = false;

    for (const variant of variants) {
      if (variant.inventory_quantity !== undefined) {
        total += variant.inventory_quantity;
        hasInventory = true;
      }
    }

    return hasInventory ? total : null;
  }

  /**
   * Map Shopify variants to our format
   */
  private mapVariants(variants: any[]): any[] {
    if (!variants?.length) return [];

    return variants.map((v) => ({
      id: String(v.id),
      shopifyVariantId: String(v.id),
      title: v.title,
      price: parseFloat(v.price || '0'),
      compareAtPrice: v.compare_at_price
        ? parseFloat(v.compare_at_price)
        : null,
      inStock: v.inventory_quantity > 0 || !v.inventory_management,
      quantity: v.inventory_quantity,
      sku: v.sku,
      options: {
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
      },
    }));
  }

  /**
   * Strip HTML from description
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  /**
   * Normalize a cached Shopify product to the shared interface
   */
  private normalizeShopifyProduct(
    dbProduct: any,
    artist: any,
  ): NormalizedProduct {
    const artistName =
      artist?.artistProfile?.artistName ||
      artist?.profile?.displayName ||
      artist?.profile?.username ||
      'Artist';

    const variants = (dbProduct.variants as any[])?.map(
      (v): NormalizedVariant => ({
        id: v.id,
        externalId: v.shopifyVariantId,
        title: v.title,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        inStock: v.inStock,
        quantity: v.quantity,
        options: v.options || {},
      }),
    );

    return {
      id: dbProduct.id,
      externalId: dbProduct.shopifyProductId,
      provider: 'shopify',

      title: dbProduct.title,
      description: dbProduct.description,
      price: dbProduct.price,
      compareAtPrice: dbProduct.compareAtPrice,
      currency: dbProduct.currency,

      coverImage: dbProduct.coverImage,
      images: dbProduct.images || [],

      type: 'merch', // Shopify products are typically merch
      status: this.mapShopifyStatus(dbProduct.status),
      inStock: dbProduct.availableForSale,
      quantity: dbProduct.totalInventory,

      hasVariants: dbProduct.hasVariants,
      variants,

      artistId: artist?.id,
      artist: {
        id: artist?.id,
        name: artistName,
        avatarUrl: artist?.profile?.avatarUrl,
      },

      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }

  /**
   * Map Shopify status to normalized status
   */
  private mapShopifyStatus(
    shopifyStatus: string,
  ): 'draft' | 'published' | 'archived' {
    switch (shopifyStatus) {
      case 'active':
        return 'published';
      case 'draft':
        return 'draft';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  }
}
