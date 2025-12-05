import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionParams {
  productId: string;
  productName: string;
  productDescription?: string;
  amount: number; // in cents
  currency?: string;
  buyerId: string;
  artistId: string;
  artistStripeAccountId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreateConnectAccountParams {
  userId: string;
  email: string;
  country?: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      this.logger.warn('Stripe secret key not configured - payment features will be disabled');
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-11-17.clover',
      });
    }
  }

  private getStripeClient(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return this.stripe;
  }

  /**
   * Create a Stripe Checkout session for purchasing a product
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    const {
      productId,
      productName,
      productDescription,
      amount,
      currency = 'usd',
      buyerId,
      artistId,
      artistStripeAccountId,
      successUrl,
      cancelUrl,
      metadata = {},
    } = params;

    // Calculate platform fee (10% of the transaction)
    const platformFeeAmount = Math.round(amount * 0.10);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId,
        buyerId,
        artistId,
        ...metadata,
      },
    };

    // If artist has connected Stripe account, use destination charges
    if (artistStripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: artistStripeAccountId,
        },
      };
    }

    try {
      const session = await this.getStripeClient().checkout.sessions.create(sessionParams);
      this.logger.log(`Created checkout session ${session.id} for product ${productId}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`);
      throw new BadRequestException('Failed to create payment session');
    }
  }

  /**
   * Retrieve a checkout session by ID
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.getStripeClient().checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve checkout session: ${error.message}`);
      throw new BadRequestException('Failed to retrieve payment session');
    }
  }

  /**
   * Verify webhook signature and construct event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Create a Stripe Connect account for an artist
   */
  async createConnectAccount(params: CreateConnectAccountParams): Promise<Stripe.Account> {
    const { userId, email, country = 'US' } = params;

    try {
      const account = await this.getStripeClient().accounts.create({
        type: 'express',
        country,
        email,
        metadata: {
          userId,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      this.logger.log(`Created Stripe Connect account ${account.id} for user ${userId}`);
      return account;
    } catch (error) {
      this.logger.error(`Failed to create Connect account: ${error.message}`);
      throw new BadRequestException('Failed to create payment account');
    }
  }

  /**
   * Create an account link for onboarding an artist to Stripe Connect
   */
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    try {
      return await this.getStripeClient().accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
    } catch (error) {
      this.logger.error(`Failed to create account link: ${error.message}`);
      throw new BadRequestException('Failed to create onboarding link');
    }
  }

  /**
   * Get a Stripe Connect account
   */
  async getConnectAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await this.getStripeClient().accounts.retrieve(accountId);
    } catch (error) {
      this.logger.error(`Failed to retrieve Connect account: ${error.message}`);
      throw new BadRequestException('Failed to retrieve payment account');
    }
  }

  /**
   * Create a payout to an artist's bank account
   */
  async createPayout(
    accountId: string,
    amount: number,
    currency: string = 'usd',
  ): Promise<Stripe.Payout> {
    try {
      return await this.getStripeClient().payouts.create(
        {
          amount,
          currency,
        },
        {
          stripeAccount: accountId,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to create payout: ${error.message}`);
      throw new BadRequestException('Failed to create payout');
    }
  }

  /**
   * Get the balance of a connected account
   */
  async getConnectAccountBalance(accountId: string): Promise<Stripe.Balance> {
    try {
      return await this.getStripeClient().balance.retrieve({
        stripeAccount: accountId,
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve account balance: ${error.message}`);
      throw new BadRequestException('Failed to retrieve account balance');
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount;
      }

      return await this.getStripeClient().refunds.create(refundParams);
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new BadRequestException('Failed to process refund');
    }
  }

  /**
   * List transfers to a connected account
   */
  async listTransfers(accountId: string, limit: number = 10): Promise<Stripe.Transfer[]> {
    try {
      const transfers = await this.getStripeClient().transfers.list({
        destination: accountId,
        limit,
      });
      return transfers.data;
    } catch (error) {
      this.logger.error(`Failed to list transfers: ${error.message}`);
      throw new BadRequestException('Failed to retrieve transfer history');
    }
  }

  /**
   * Get Stripe publishable key for frontend
   */
  getPublishableKey(): string {
    return this.configService.get<string>('stripe.publishableKey') || '';
  }
}
