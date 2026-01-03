import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';
import { ProductStatus, ProductType } from '@prisma/client';
import {
  MerchProvider,
  MerchProviderType,
  NormalizedProduct,
  NormalizedProductType,
  ProductFilters,
  CheckoutParams,
  CheckoutResult,
} from './merch-provider.interface';

/**
 * Native Seda provider - wraps existing marketplace system.
 * This is the default provider for all artists.
 */
@Injectable()
export class NativeProvider implements MerchProvider {
  constructor(private prisma: PrismaService) {}

  getProviderType(): MerchProviderType {
    return 'native';
  }

  async listProducts(
    artistId: string,
    filters?: ProductFilters,
  ): Promise<NormalizedProduct[]> {
    const where: any = { artistId };

    if (filters?.status) {
      where.status = this.mapStatusToDb(filters.status);
    } else {
      // Default to published only for public listings
      where.status = ProductStatus.PUBLISHED;
    }

    if (filters?.type) {
      where.type = this.mapTypeToDb(filters.type);
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.marketplaceProduct.findMany({
      where,
      include: {
        artist: {
          include: {
            artistProfile: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return products.map((p) => this.normalizeProduct(p));
  }

  async getProduct(productId: string): Promise<NormalizedProduct | null> {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: productId },
      include: {
        artist: {
          include: {
            artistProfile: true,
            profile: true,
          },
        },
      },
    });

    if (!product) return null;
    return this.normalizeProduct(product);
  }

  async createCheckoutLink(params: CheckoutParams): Promise<CheckoutResult> {
    // For native provider, we return the internal checkout URL
    // The actual Stripe/PayPal checkout is handled by existing endpoints
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    // Build checkout URL with params
    const checkoutUrl = new URL(`${baseUrl}/checkout`);
    checkoutUrl.searchParams.set('productId', params.productId);
    if (params.variantId) {
      checkoutUrl.searchParams.set('variantId', params.variantId);
    }
    if (params.quantity) {
      checkoutUrl.searchParams.set('quantity', params.quantity.toString());
    }
    if (params.dropId) {
      checkoutUrl.searchParams.set('dropId', params.dropId);
    }

    return {
      provider: 'native',
      checkoutUrl: checkoutUrl.toString(),
      isExternal: false,
    };
  }

  async isAvailable(_artistId: string): Promise<boolean> {
    // Native provider is always available
    return true;
  }

  /**
   * Normalize a database product to the shared interface
   */
  private normalizeProduct(dbProduct: any): NormalizedProduct {
    const artistName =
      dbProduct.artist?.artistProfile?.artistName ||
      dbProduct.artist?.profile?.displayName ||
      dbProduct.artist?.profile?.username ||
      'Artist';

    return {
      id: dbProduct.id,
      provider: 'native',

      title: dbProduct.title,
      description: dbProduct.description,
      price: dbProduct.price,
      currency: 'USD',

      coverImage: dbProduct.coverImage,
      images: dbProduct.coverImage ? [dbProduct.coverImage] : [],

      type: this.mapTypeFromDb(dbProduct.type),
      status: this.mapStatusFromDb(dbProduct.status),
      inStock: true, // Native products are always in stock (no inventory tracking yet)

      hasVariants: false, // Native products don't have variants yet

      fileUrl: dbProduct.fileUrl,
      fileSize: dbProduct.fileSize,

      externalUrl: dbProduct.externalUrl,
      externalPlatform: dbProduct.externalPlatform,

      artistId: dbProduct.artistId,
      artist: {
        id: dbProduct.artistId,
        name: artistName,
        avatarUrl: dbProduct.artist?.profile?.avatarUrl,
      },

      viewCount: dbProduct.viewCount,
      purchaseCount: dbProduct.purchaseCount,

      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
      publishedAt: dbProduct.publishedAt,
    };
  }

  /**
   * Map normalized type to database enum
   */
  private mapTypeToDb(type: NormalizedProductType): ProductType {
    const map: Record<NormalizedProductType, ProductType> = {
      digital_track: ProductType.DIGITAL_TRACK,
      digital_album: ProductType.DIGITAL_ALBUM,
      merch: ProductType.MERCHANDISE_LINK,
      concert_ticket: ProductType.CONCERT_LINK,
      preset_pack: ProductType.PRESET_PACK,
      sample_pack: ProductType.SAMPLE_PACK,
    };
    return map[type];
  }

  /**
   * Map database enum to normalized type
   */
  private mapTypeFromDb(dbType: ProductType): NormalizedProductType {
    const map: Record<ProductType, NormalizedProductType> = {
      [ProductType.DIGITAL_TRACK]: 'digital_track',
      [ProductType.DIGITAL_ALBUM]: 'digital_album',
      [ProductType.MERCHANDISE_LINK]: 'merch',
      [ProductType.CONCERT_LINK]: 'concert_ticket',
      [ProductType.PRESET_PACK]: 'preset_pack',
      [ProductType.SAMPLE_PACK]: 'sample_pack',
    };
    return map[dbType];
  }

  /**
   * Map normalized status to database enum
   */
  private mapStatusToDb(
    status: 'draft' | 'published' | 'archived',
  ): ProductStatus {
    const map: Record<string, ProductStatus> = {
      draft: ProductStatus.DRAFT,
      published: ProductStatus.PUBLISHED,
      archived: ProductStatus.ARCHIVED,
    };
    return map[status];
  }

  /**
   * Map database status to normalized status
   */
  private mapStatusFromDb(
    dbStatus: ProductStatus,
  ): 'draft' | 'published' | 'archived' {
    const map: Record<ProductStatus, 'draft' | 'published' | 'archived'> = {
      [ProductStatus.DRAFT]: 'draft',
      [ProductStatus.PUBLISHED]: 'published',
      [ProductStatus.ARCHIVED]: 'archived',
    };
    return map[dbStatus];
  }
}
