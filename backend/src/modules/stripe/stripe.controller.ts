import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  UseGuards,
  RawBodyRequest,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../config/prisma.service';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly marketplaceService: MarketplaceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get Stripe publishable key for frontend
   */
  @Get('config')
  getConfig() {
    return {
      publishableKey: this.stripeService.getPublishableKey(),
    };
  }

  /**
   * Create a checkout session for a product purchase
   */
  @UseGuards(AuthGuard)
  @Post('checkout/session')
  async createCheckoutSession(
    @Req() req: any,
    @Body()
    body: {
      productId: string;
      amount: number;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    const buyerId = req.user.id;
    const { productId, amount, successUrl, cancelUrl } = body;

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

    // Get artist's Stripe Connect account if they have one
    const artistStripeAccountId = product.artist.artistProfile?.stripeAccountId;

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession({
      productId: product.id,
      productName: product.title,
      productDescription: product.description || undefined,
      amount: Math.round(amount * 100), // Convert to cents
      buyerId,
      artistId: product.artistId,
      artistStripeAccountId: artistStripeAccountId || undefined,
      successUrl,
      cancelUrl,
      metadata: {
        productType: product.type,
      },
    });

    // Create a pending purchase record
    await this.marketplaceService.createPurchase(buyerId, {
      productId,
      amount,
      paymentMethod: 'stripe',
      paymentIntentId: session.payment_intent as string || session.id,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Handle Stripe webhooks
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const event = this.stripeService.constructWebhookEvent(req.rawBody, signature);

    this.logger.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(paymentIntent);
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await this.handleAccountUpdated(account);
        break;
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { productId, buyerId } = session.metadata || {};

    if (!productId || !buyerId) {
      this.logger.warn('Missing metadata in checkout session');
      return;
    }

    // Find the pending purchase by payment intent ID
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        productId,
        buyerId,
        status: 'PENDING',
        paymentIntentId: {
          in: [session.payment_intent as string, session.id],
        },
      },
    });

    if (purchase) {
      // Update the payment intent ID if it was the session ID
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          paymentIntentId: session.payment_intent as string,
        },
      });

      // Complete the purchase
      await this.marketplaceService.completePurchase(purchase.id);
      this.logger.log(`Completed purchase ${purchase.id} for product ${productId}`);
    }
  }

  /**
   * Handle payment intent succeeded
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        paymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    if (purchase) {
      await this.marketplaceService.completePurchase(purchase.id);
      this.logger.log(`Payment succeeded for purchase ${purchase.id}`);
    }
  }

  /**
   * Handle payment intent failed
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        paymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    if (purchase) {
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'FAILED',
        },
      });
      this.logger.log(`Payment failed for purchase ${purchase.id}`);
    }
  }

  /**
   * Handle Stripe Connect account updates
   */
  private async handleAccountUpdated(account: Stripe.Account) {
    const userId = account.metadata?.userId;

    if (!userId) {
      return;
    }

    // Update the artist profile with Stripe account status
    const artistProfile = await this.prisma.artistProfile.findFirst({
      where: {
        stripeAccountId: account.id,
      },
    });

    if (artistProfile) {
      await this.prisma.artistProfile.update({
        where: { id: artistProfile.id },
        data: {
          stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
        },
      });
      this.logger.log(`Updated Stripe account status for artist ${userId}`);
    }
  }

  /**
   * Create a Stripe Connect account for an artist
   */
  @UseGuards(AuthGuard)
  @Post('connect/account')
  async createConnectAccount(@Req() req: any) {
    const userId = req.user.id;

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

    // Check if artist already has a Stripe account
    if (artistProfile.stripeAccountId) {
      throw new BadRequestException('Artist already has a payment account');
    }

    // Create Stripe Connect account
    const account = await this.stripeService.createConnectAccount({
      userId,
      email: user.email,
    });

    // Save account ID to artist profile
    await this.prisma.artistProfile.update({
      where: { id: artistProfile.id },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
      },
    });

    return { accountId: account.id };
  }

  /**
   * Get onboarding link for Stripe Connect
   */
  @UseGuards(AuthGuard)
  @Post('connect/onboarding')
  async createOnboardingLink(
    @Req() req: any,
    @Body() body: { refreshUrl: string; returnUrl: string },
  ) {
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user?.artistProfile?.stripeAccountId) {
      throw new BadRequestException('No payment account found');
    }

    const link = await this.stripeService.createAccountLink(
      user.artistProfile.stripeAccountId,
      body.refreshUrl,
      body.returnUrl,
    );

    return { url: link.url };
  }

  /**
   * Get Stripe Connect account status
   */
  @UseGuards(AuthGuard)
  @Get('connect/status')
  async getConnectStatus(@Req() req: any) {
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user?.artistProfile?.stripeAccountId) {
      return {
        hasAccount: false,
        status: null,
        chargesEnabled: false,
        payoutsEnabled: false,
      };
    }

    const account = await this.stripeService.getConnectAccount(
      user.artistProfile.stripeAccountId,
    );

    return {
      hasAccount: true,
      status: user.artistProfile.stripeAccountStatus,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  }

  /**
   * Get connected account balance
   */
  @UseGuards(AuthGuard)
  @Get('connect/balance')
  async getConnectBalance(@Req() req: any) {
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user?.artistProfile?.stripeAccountId) {
      throw new BadRequestException('No payment account found');
    }

    const balance = await this.stripeService.getConnectAccountBalance(
      user.artistProfile.stripeAccountId,
    );

    return {
      available: balance.available.map((b) => ({
        amount: b.amount / 100,
        currency: b.currency,
      })),
      pending: balance.pending.map((b) => ({
        amount: b.amount / 100,
        currency: b.currency,
      })),
    };
  }

  /**
   * Request a payout
   */
  @UseGuards(AuthGuard)
  @Post('connect/payout')
  async requestPayout(
    @Req() req: any,
    @Body() body: { amount: number; currency?: string },
  ) {
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user?.artistProfile?.stripeAccountId) {
      throw new BadRequestException('No payment account found');
    }

    const payout = await this.stripeService.createPayout(
      user.artistProfile.stripeAccountId,
      Math.round(body.amount * 100), // Convert to cents
      body.currency || 'usd',
    );

    return {
      payoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: payout.status,
      arrivalDate: payout.arrival_date,
    };
  }
}
