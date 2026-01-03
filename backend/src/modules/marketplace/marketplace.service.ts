import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SendGridService } from '../../config/sendgrid.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ProductStatus, ProductType, PurchaseStatus, OrderStatus } from '@prisma/client';

// Platform fee configuration
export const PLATFORM_FEE_PERCENT = 0.10; // 10% platform fee
export const STRIPE_PROCESSING_FEE_PERCENT = 0.029; // 2.9%
export const STRIPE_PROCESSING_FEE_FIXED = 0.30; // $0.30 per transaction
export const PAYPAL_PROCESSING_FEE_PERCENT = 0.0349; // 3.49%
export const PAYPAL_PROCESSING_FEE_FIXED = 0.49; // $0.49 per transaction

export interface RevenueBreakdown {
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  artistNet: number;
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    private prisma: PrismaService,
    private sendGridService: SendGridService,
  ) {}

  /**
   * Calculate revenue breakdown for a sale
   * Platform takes 10%, artist pays processing fees
   */
  calculateRevenueBreakdown(
    grossAmount: number,
    paymentMethod: 'stripe' | 'paypal' = 'stripe',
  ): RevenueBreakdown {
    // Platform fee: 10% of gross
    const platformFee = grossAmount * PLATFORM_FEE_PERCENT;

    // Processing fee depends on payment method
    let processingFee: number;
    if (paymentMethod === 'paypal') {
      processingFee = grossAmount * PAYPAL_PROCESSING_FEE_PERCENT + PAYPAL_PROCESSING_FEE_FIXED;
    } else {
      processingFee = grossAmount * STRIPE_PROCESSING_FEE_PERCENT + STRIPE_PROCESSING_FEE_FIXED;
    }

    // Artist receives: gross - platform fee - processing fee
    const artistNet = grossAmount - platformFee - processingFee;

    return {
      grossAmount,
      platformFee: Math.round(platformFee * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      artistNet: Math.round(artistNet * 100) / 100,
    };
  }

  // Product Management

  async createProduct(userId: string, dto: CreateProductDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user || !user.artistProfile) {
      throw new ForbiddenException('Only artists can create products');
    }

    return this.prisma.marketplaceProduct.create({
      data: {
        artistId: userId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        coverImage: dto.coverImage,
        trackRef: dto.trackRef,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        externalUrl: dto.externalUrl,
        externalPlatform: dto.externalPlatform,
        packContents: dto.packContents,
      },
      include: {
        artist: {
          include: {
            artistProfile: true,
          },
        },
      },
    });
  }

  async updateProduct(userId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.artistId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const updateData: any = { ...dto };

    // If publishing, set publishedAt timestamp
    if (dto.status === ProductStatus.PUBLISHED && product.status !== ProductStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }

    return this.prisma.marketplaceProduct.update({
      where: { id: productId },
      data: updateData,
      include: {
        artist: {
          include: {
            artistProfile: true,
          },
        },
      },
    });
  }

  async deleteProduct(userId: string, productId: string) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.artistId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    return this.prisma.marketplaceProduct.delete({
      where: { id: productId },
    });
  }

  async getProductById(productId: string) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: productId },
      include: {
        artist: {
          include: {
            artistProfile: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.prisma.marketplaceProduct.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return product;
  }

  async getArtistProducts(artistId: string, includesDrafts = false) {
    // artistId could be either the database user ID or the Supabase auth ID
    // Try to find the user by either ID
    let resolvedArtistId = artistId;

    // First check if it's a valid database user ID
    const userById = await this.prisma.user.findUnique({
      where: { id: artistId },
    });

    if (!userById) {
      // If not found by ID, try to find by supabaseId
      const userBySupabaseId = await this.prisma.user.findUnique({
        where: { supabaseId: artistId },
      });

      if (userBySupabaseId) {
        resolvedArtistId = userBySupabaseId.id;
      }
    }

    const where: any = { artistId: resolvedArtistId };

    if (!includesDrafts) {
      where.status = ProductStatus.PUBLISHED;
    }

    return this.prisma.marketplaceProduct.findMany({
      where,
      include: {
        artist: {
          include: {
            artistProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllProducts(type?: ProductType) {
    const where: any = {
      status: ProductStatus.PUBLISHED,
    };

    if (type) {
      where.type = type;
    }

    return this.prisma.marketplaceProduct.findMany({
      where,
      include: {
        artist: {
          include: {
            artistProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Purchase Management

  // Product types that require shipping address
  // Note: MERCHANDISE_LINK and CONCERT_LINK are typically external links, but if they have
  // shippingAddress provided, they're treated as direct sales requiring fulfillment
  private readonly PHYSICAL_PRODUCT_TYPES: ProductType[] = [
    ProductType.MERCHANDISE_LINK,
    ProductType.CONCERT_LINK,
  ];

  async createPurchase(userId: string, dto: CreatePurchaseDto) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatus.PUBLISHED) {
      throw new BadRequestException('Product is not available for purchase');
    }

    // Validate shipping address for physical products
    const isPhysicalProduct = this.PHYSICAL_PRODUCT_TYPES.includes(product.type);
    if (isPhysicalProduct && !dto.shippingAddress) {
      throw new BadRequestException('Shipping address is required for physical products');
    }

    // Build purchase data
    const purchaseData: any = {
      productId: dto.productId,
      buyerId: userId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      paymentIntentId: dto.paymentIntentId,
      status: PurchaseStatus.PENDING,
      productVariant: dto.productVariant,
      buyerNotes: dto.buyerNotes,
    };

    // Add shipping info for physical products
    if (dto.shippingAddress) {
      purchaseData.shippingName = dto.shippingAddress.name;
      purchaseData.shippingAddress1 = dto.shippingAddress.address1;
      purchaseData.shippingAddress2 = dto.shippingAddress.address2;
      purchaseData.shippingCity = dto.shippingAddress.city;
      purchaseData.shippingState = dto.shippingAddress.state;
      purchaseData.shippingZip = dto.shippingAddress.zip;
      purchaseData.shippingCountry = dto.shippingAddress.country;
      purchaseData.shippingPhone = dto.shippingAddress.phone;
    }

    // Create purchase record
    const purchase = await this.prisma.purchase.create({
      data: purchaseData,
      include: {
        product: true,
        buyer: true,
      },
    });

    return purchase;
  }

  /**
   * Check if a product type requires shipping
   */
  isPhysicalProduct(productType: ProductType): boolean {
    return this.PHYSICAL_PRODUCT_TYPES.includes(productType);
  }

  async completePurchase(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: {
          include: {
            artist: {
              include: {
                artistProfile: true,
                profile: true,
              },
            },
          },
        },
        buyer: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Calculate revenue breakdown
    const paymentMethod = (purchase.paymentMethod === 'paypal' ? 'paypal' : 'stripe') as 'stripe' | 'paypal';
    const breakdown = this.calculateRevenueBreakdown(purchase.amount, paymentMethod);

    // Determine if this is a physical product requiring fulfillment
    const isPhysicalProduct = this.PHYSICAL_PRODUCT_TYPES.includes(purchase.product.type);

    // Update purchase status
    const updatedPurchase = await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PurchaseStatus.COMPLETED,
        completedAt: new Date(),
        // Set order status for physical products
        ...(isPhysicalProduct && { orderStatus: OrderStatus.PENDING_FULFILLMENT }),
      },
    });

    // Update product purchase count
    await this.prisma.marketplaceProduct.update({
      where: { id: purchase.productId },
      data: {
        purchaseCount: {
          increment: 1,
        },
      },
    });

    // Update artist revenue with their NET amount (after platform fee and processing fees)
    await this.updateArtistRevenue(
      purchase.product.artistId,
      breakdown.artistNet,
    );

    // Update fan engagement (with gross amount for tracking total spending)
    await this.updateFanEngagement(
      purchase.product.artistId,
      purchase.buyerId,
      purchase.amount,
    );

    // Send purchase confirmation email (non-blocking)
    this.sendPurchaseEmail(purchase).catch((error) => {
      this.logger.error(`Failed to send purchase confirmation email: ${error.message}`);
    });

    return updatedPurchase;
  }

  private async sendPurchaseEmail(purchase: any) {
    const buyerEmail = purchase.buyer.email;
    const buyerName = purchase.buyer.profile?.displayName || purchase.buyer.profile?.username || 'Valued Customer';
    const artistName = purchase.product.artist.artistProfile?.artistName ||
                       purchase.product.artist.profile?.displayName ||
                       'Artist';

    await this.sendGridService.sendPurchaseConfirmationEmail(
      buyerEmail,
      buyerName,
      {
        productTitle: purchase.product.title,
        productType: purchase.product.type,
        artistName,
        amount: purchase.amount,
        purchaseId: purchase.id,
        hasDownload: !!purchase.product.fileUrl,
      },
    );
  }

  async getUserPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { buyerId: userId },
      include: {
        product: {
          include: {
            artist: {
              include: {
                artistProfile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async incrementDownloadCount(purchaseId: string, userId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.buyerId !== userId) {
      throw new ForbiddenException('You can only download your own purchases');
    }

    if (purchase.status !== PurchaseStatus.COMPLETED) {
      throw new BadRequestException('Purchase is not completed');
    }

    return this.prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        downloadCount: {
          increment: 1,
        },
        lastDownloadAt: new Date(),
      },
    });
  }

  /**
   * Get download link for a completed purchase
   * Validates ownership and purchase status, returns file URL
   */
  async getDownloadLink(purchaseId: string, userId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            type: true,
            fileUrl: true,
            fileSize: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.buyerId !== userId) {
      throw new ForbiddenException('You can only download your own purchases');
    }

    if (purchase.status !== PurchaseStatus.COMPLETED) {
      throw new BadRequestException('Purchase is not completed');
    }

    if (!purchase.product.fileUrl) {
      throw new BadRequestException('This product does not have a downloadable file');
    }

    // Increment download count
    await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
      },
    });

    return {
      downloadUrl: purchase.product.fileUrl,
      fileName: purchase.product.title,
      fileSize: purchase.product.fileSize,
      productType: purchase.product.type,
      downloadCount: purchase.downloadCount + 1,
    };
  }

  // Revenue Management

  async getArtistRevenue(artistId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get or create revenue record for current month
    let revenue = await this.prisma.artistRevenue.findUnique({
      where: {
        artistId_currentMonth_currentYear: {
          artistId,
          currentMonth,
          currentYear,
        },
      },
    });

    if (!revenue) {
      revenue = await this.prisma.artistRevenue.create({
        data: {
          artistId,
          currentMonth,
          currentYear,
          totalRevenue: 0,
          pendingRevenue: 0,
          withdrawnRevenue: 0,
          monthlyRevenue: 0,
          totalSales: 0,
          monthlySales: 0,
        },
      });
    }

    return revenue;
  }

  async getArtistRevenueHistory(artistId: string) {
    return this.prisma.artistRevenue.findMany({
      where: { artistId },
      orderBy: [{ currentYear: 'desc' }, { currentMonth: 'desc' }],
    });
  }

  private async updateArtistRevenue(artistId: string, amount: number) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Update or create revenue record
    await this.prisma.artistRevenue.upsert({
      where: {
        artistId_currentMonth_currentYear: {
          artistId,
          currentMonth,
          currentYear,
        },
      },
      update: {
        totalRevenue: { increment: amount },
        pendingRevenue: { increment: amount },
        monthlyRevenue: { increment: amount },
        totalSales: { increment: 1 },
        monthlySales: { increment: 1 },
      },
      create: {
        artistId,
        currentMonth,
        currentYear,
        totalRevenue: amount,
        pendingRevenue: amount,
        monthlyRevenue: amount,
        totalSales: 1,
        monthlySales: 1,
      },
    });
  }

  // Fan Engagement

  async getArtistFans(artistId: string) {
    return this.prisma.fanEngagement.findMany({
      where: { artistId },
      include: {
        fan: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        lastEngagement: 'desc',
      },
    });
  }

  async getTopFans(artistId: string, limit = 10) {
    return this.prisma.fanEngagement.findMany({
      where: { artistId },
      include: {
        fan: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        totalSpent: 'desc',
      },
      take: limit,
    });
  }

  private async updateFanEngagement(
    artistId: string,
    fanId: string,
    amount: number,
  ) {
    await this.prisma.fanEngagement.upsert({
      where: {
        artistId_fanId: {
          artistId,
          fanId,
        },
      },
      update: {
        totalPurchases: { increment: 1 },
        totalSpent: { increment: amount },
        lastEngagement: new Date(),
      },
      create: {
        artistId,
        fanId,
        totalPurchases: 1,
        totalSpent: amount,
        lastEngagement: new Date(),
      },
    });
  }

  // Order Management (for physical products)

  /**
   * Get specific order details (for artist)
   */
  async getOrderDetails(artistId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: true,
        buyer: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Order not found');
    }

    if (purchase.product.artistId !== artistId) {
      throw new ForbiddenException('You can only view orders for your own products');
    }

    return purchase;
  }

  /**
   * Get all orders for an artist (purchases of their products)
   */
  async getArtistOrders(artistId: string, status?: OrderStatus) {
    const where: any = {
      product: {
        artistId,
      },
      // Only include physical product orders
      orderStatus: status ? status : { not: null },
    };

    return this.prisma.purchase.findMany({
      where,
      include: {
        product: true,
        buyer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update order status (for artist to mark as shipped, etc.)
   */
  async updateOrderStatus(
    artistId: string,
    purchaseId: string,
    newStatus: OrderStatus,
    trackingInfo?: { trackingNumber?: string; trackingCarrier?: string },
  ) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: true,
        buyer: {
          include: { profile: true },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Order not found');
    }

    if (purchase.product.artistId !== artistId) {
      throw new ForbiddenException('You can only update orders for your own products');
    }

    if (!purchase.orderStatus) {
      throw new BadRequestException('This is not a physical product order');
    }

    const updateData: any = {
      orderStatus: newStatus,
    };

    // Add tracking info if shipping
    if (newStatus === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
      if (trackingInfo?.trackingNumber) {
        updateData.trackingNumber = trackingInfo.trackingNumber;
      }
      if (trackingInfo?.trackingCarrier) {
        updateData.trackingCarrier = trackingInfo.trackingCarrier;
      }
    }

    // Set delivered timestamp if marking as delivered
    if (newStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const updatedPurchase = await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: updateData,
      include: {
        product: true,
        buyer: {
          include: { profile: true },
        },
      },
    });

    // Send shipping notification email if just shipped
    if (newStatus === OrderStatus.SHIPPED) {
      this.sendShippingNotificationEmail(updatedPurchase).catch((error) => {
        this.logger.error(`Failed to send shipping notification: ${error.message}`);
      });
    }

    return updatedPurchase;
  }

  private async sendShippingNotificationEmail(purchase: any) {
    const buyerEmail = purchase.buyer.email;
    const buyerName = purchase.buyer.profile?.displayName || purchase.buyer.profile?.username || 'Valued Customer';

    await this.sendGridService.sendOrderShippedEmail(
      buyerEmail,
      buyerName,
      {
        productTitle: purchase.product.title,
        orderId: purchase.id,
        trackingNumber: purchase.trackingNumber,
        trackingCarrier: purchase.trackingCarrier,
        shippingAddress: {
          name: purchase.shippingName,
          address1: purchase.shippingAddress1,
          address2: purchase.shippingAddress2,
          city: purchase.shippingCity,
          state: purchase.shippingState,
          zip: purchase.shippingZip,
          country: purchase.shippingCountry,
        },
      },
    );
  }
}
