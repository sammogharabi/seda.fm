import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  Req,
  Res,
  UseGuards,
  RawBodyRequest,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PrismaService } from '../../config/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly marketplaceService: MarketplaceService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
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

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        await this.handlePayoutCompleted(payout, 'PAID');
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        await this.handlePayoutCompleted(payout, 'FAILED');
        break;
      }

      case 'payout.canceled': {
        const payout = event.data.object as Stripe.Payout;
        await this.handlePayoutCompleted(payout, 'CANCELED');
        break;
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle payout status updates
   */
  private async handlePayoutCompleted(
    payout: Stripe.Payout,
    status: 'PAID' | 'FAILED' | 'CANCELED',
  ) {
    try {
      const artistPayout = await this.prisma.artistPayout.findUnique({
        where: { stripePayoutId: payout.id },
      });

      if (artistPayout) {
        await this.prisma.artistPayout.update({
          where: { id: artistPayout.id },
          data: {
            status,
            completedAt: new Date(),
            failureMessage: status === 'FAILED' ? (payout as any).failure_message : null,
          },
        });
        this.logger.log(`Updated payout ${payout.id} to status ${status}`);

        // If payout failed or was canceled, restore pending revenue
        if (status === 'FAILED' || status === 'CANCELED') {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();

          await this.prisma.artistRevenue.updateMany({
            where: {
              artistId: artistPayout.artistId,
              currentMonth,
              currentYear,
            },
            data: {
              pendingRevenue: { increment: artistPayout.amount },
              withdrawnRevenue: { decrement: artistPayout.amount },
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(`Failed to update payout status: ${err.message}`);
    }
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

    // Record payout in history
    await this.prisma.artistPayout.create({
      data: {
        artistId: userId,
        stripePayoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: this.mapPayoutStatus(payout.status),
        arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000) : null,
      },
    });

    // Update artist revenue (reduce pending revenue)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await this.prisma.artistRevenue.updateMany({
      where: {
        artistId: userId,
        currentMonth,
        currentYear,
      },
      data: {
        pendingRevenue: { decrement: payout.amount / 100 },
        withdrawnRevenue: { increment: payout.amount / 100 },
      },
    });

    return {
      payoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: payout.status,
      arrivalDate: payout.arrival_date,
    };
  }

  /**
   * Get payout history
   */
  @UseGuards(AuthGuard)
  @Get('connect/payouts')
  async getPayoutHistory(
    @Req() req: any,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    const userId = req.user.id;

    const payouts = await this.prisma.artistPayout.findMany({
      where: { artistId: userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await this.prisma.artistPayout.count({
      where: { artistId: userId },
    });

    return {
      payouts,
      total,
      hasMore: parseInt(offset) + payouts.length < total,
    };
  }

  /**
   * Get transfer history (incoming payments from customers)
   */
  @UseGuards(AuthGuard)
  @Get('connect/transfers')
  async getTransferHistory(
    @Req() req: any,
    @Query('limit') limit = '20',
  ) {
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true },
    });

    if (!user?.artistProfile?.stripeAccountId) {
      throw new BadRequestException('No payment account found');
    }

    const transfers = await this.stripeService.listTransfers(
      user.artistProfile.stripeAccountId,
      parseInt(limit),
    );

    return {
      transfers: transfers.map((t) => ({
        id: t.id,
        amount: t.amount / 100,
        currency: t.currency,
        created: new Date(t.created * 1000),
        description: t.description,
        metadata: t.metadata,
      })),
    };
  }

  /**
   * Stripe Connect OAuth callback
   * This is the endpoint artists are redirected to after completing onboarding
   */
  @Get('connect/callback')
  async handleConnectCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ||
      (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');

    if (error) {
      this.logger.warn(`Connect OAuth error: ${error} - ${errorDescription}`);
      return res.redirect(`${frontendUrl}/artist/settings?connect_error=${encodeURIComponent(error)}`);
    }

    // For Express accounts, the code exchange happens automatically
    // The return_url is typically where the user lands after completing onboarding
    // We just redirect to the frontend settings page with a success indicator
    return res.redirect(`${frontendUrl}/artist/settings?connect_success=true`);
  }

  /**
   * Handle Connect account return (after onboarding completes)
   */
  @Get('connect/return')
  async handleConnectReturn(
    @Query('account_id') accountId: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ||
      (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');

    if (accountId) {
      // Verify the account status
      try {
        const account = await this.stripeService.getConnectAccount(accountId);

        // Update artist profile
        const artistProfile = await this.prisma.artistProfile.findFirst({
          where: { stripeAccountId: accountId },
        });

        if (artistProfile) {
          await this.prisma.artistProfile.update({
            where: { id: artistProfile.id },
            data: {
              stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
            },
          });
        }

        if (account.charges_enabled) {
          return res.redirect(`${frontendUrl}/artist/settings?connect_success=true&payouts_enabled=true`);
        }
      } catch (err) {
        this.logger.error(`Failed to verify Connect account: ${err.message}`);
      }
    }

    return res.redirect(`${frontendUrl}/artist/settings?connect_return=true`);
  }

  /**
   * Handle Connect account refresh (when user needs to re-authenticate)
   */
  @Get('connect/refresh')
  async handleConnectRefresh(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ||
      (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');

    // Redirect back to artist settings where they can restart onboarding
    return res.redirect(`${frontendUrl}/artist/settings?connect_refresh=true`);
  }

  /**
   * Map Stripe payout status to our PayoutStatus enum
   */
  private mapPayoutStatus(stripeStatus: string): 'PENDING' | 'IN_TRANSIT' | 'PAID' | 'FAILED' | 'CANCELED' {
    switch (stripeStatus) {
      case 'pending':
        return 'PENDING';
      case 'in_transit':
        return 'IN_TRANSIT';
      case 'paid':
        return 'PAID';
      case 'failed':
        return 'FAILED';
      case 'canceled':
        return 'CANCELED';
      default:
        return 'PENDING';
    }
  }
}
