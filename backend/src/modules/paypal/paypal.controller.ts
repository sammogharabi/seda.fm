import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../config/prisma.service';

@Controller('paypal')
export class PayPalController {
  private readonly logger = new Logger(PayPalController.name);

  constructor(
    private readonly paypalService: PayPalService,
    private readonly marketplaceService: MarketplaceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get PayPal client ID for frontend
   */
  @Get('config')
  getConfig() {
    return {
      clientId: this.paypalService.getClientId(),
      isConfigured: this.paypalService.isConfigured(),
    };
  }

  /**
   * Create a PayPal order for a product purchase
   */
  @UseGuards(AuthGuard)
  @Post('orders')
  async createOrder(
    @Req() req: any,
    @Body()
    body: {
      productId: string;
      amount: number;
      returnUrl: string;
      cancelUrl: string;
    },
  ) {
    const buyerId = req.user.id;
    const { productId, amount, returnUrl, cancelUrl } = body;

    // Get product details
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
      throw new BadRequestException('Product not found');
    }

    // Create PayPal order
    const order = await this.paypalService.createOrder({
      productId: product.id,
      productName: product.title,
      productDescription: product.description || undefined,
      amount,
      buyerId,
      artistId: product.artistId,
      returnUrl,
      cancelUrl,
    });

    // Create a pending purchase record
    await this.marketplaceService.createPurchase(buyerId, {
      productId,
      amount,
      paymentMethod: 'paypal',
      paymentIntentId: order.orderId,
    });

    return order;
  }

  /**
   * Capture a PayPal order after user approval
   */
  @UseGuards(AuthGuard)
  @Post('orders/:orderId/capture')
  async captureOrder(@Req() req: any, @Param('orderId') orderId: string) {
    const buyerId = req.user.id;

    // Capture the payment
    const captureResult = await this.paypalService.captureOrder(orderId);

    // Find and complete the purchase
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        paymentIntentId: orderId,
        buyerId,
        status: 'PENDING',
      },
    });

    if (purchase) {
      await this.marketplaceService.completePurchase(purchase.id);
      this.logger.log(`Completed purchase ${purchase.id} via PayPal order ${orderId}`);
    }

    return {
      success: true,
      orderId: captureResult.orderId,
      status: captureResult.status,
      amount: captureResult.amount,
      currency: captureResult.currency,
    };
  }

  /**
   * Get order status (for checking payment status)
   */
  @UseGuards(AuthGuard)
  @Get('orders/:orderId')
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.paypalService.getOrder(orderId);

    return {
      orderId: order.id,
      status: order.status,
      amount: order.purchaseUnits?.[0]?.amount?.value,
      currency: order.purchaseUnits?.[0]?.amount?.currencyCode,
    };
  }

  /**
   * Handle PayPal return (after user approves payment)
   * This is called when user is redirected back from PayPal
   */
  @Get('return')
  async handleReturn(@Query('token') token: string) {
    // The token is the order ID
    // Frontend should call /orders/:orderId/capture to complete the payment
    return {
      orderId: token,
      message: 'Payment approved. Call capture endpoint to complete.',
    };
  }

  /**
   * Save PayPal email for an artist to receive payments
   */
  @UseGuards(AuthGuard)
  @Post('connect/email')
  async savePayPalEmail(
    @Req() req: any,
    @Body() body: { email: string },
  ) {
    const userId = req.user.id;
    const { email } = body;

    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email address');
    }

    // Get user with artist profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create artist profile if it doesn't exist (for users accessing artist features)
    let artistProfile = user.artistProfile;
    if (!artistProfile) {
      // Use email prefix as default artist name
      const defaultArtistName = user.email.split('@')[0] || 'Artist';
      artistProfile = await this.prisma.artistProfile.create({
        data: {
          userId,
          artistName: defaultArtistName,
          verified: false,
        },
      });
      this.logger.log(`Created artist profile for user ${userId}`);
    }

    // Update artist profile with PayPal email
    await this.prisma.artistProfile.update({
      where: { id: artistProfile.id },
      data: {
        paypalEmail: email,
      },
    });

    this.logger.log(`Saved PayPal email for artist ${userId}`);

    return {
      success: true,
      email,
    };
  }

  /**
   * Get PayPal connection status for an artist
   */
  @UseGuards(AuthGuard)
  @Get('connect/status')
  async getConnectStatus(@Req() req: any) {
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user?.artistProfile) {
      return {
        hasPayPal: false,
        email: null,
      };
    }

    return {
      hasPayPal: !!user.artistProfile.paypalEmail,
      email: user.artistProfile.paypalEmail,
    };
  }
}
