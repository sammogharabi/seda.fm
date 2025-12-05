import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  Environment,
  LogLevel,
  OrdersController,
  CheckoutPaymentIntent,
  PayeePaymentMethodPreference,
  PaypalExperienceLandingPage,
  PaypalExperienceUserAction,
  type Order,
} from '@paypal/paypal-server-sdk';

export interface CreatePayPalOrderParams {
  productId: string;
  productName: string;
  productDescription?: string;
  amount: number; // in dollars (not cents like Stripe)
  currency?: string;
  buyerId: string;
  artistId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CapturePayPalOrderResult {
  orderId: string;
  status: string;
  payerId?: string;
  amount: number;
  currency: string;
}

@Injectable()
export class PayPalService {
  private client: Client;
  private ordersController: OrdersController;
  private readonly logger = new Logger(PayPalService.name);

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('paypal.clientId');
    const clientSecret = this.configService.get<string>('paypal.clientSecret');
    const mode = this.configService.get<string>('paypal.mode') || 'sandbox';

    if (!clientId || !clientSecret) {
      this.logger.warn('PayPal credentials not configured - PayPal payments will be disabled');
    }

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId || '',
        oAuthClientSecret: clientSecret || '',
      },
      timeout: 0,
      environment: mode === 'live' ? Environment.Production : Environment.Sandbox,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: false },
        logResponse: { logHeaders: false },
      },
    });

    this.ordersController = new OrdersController(this.client);
  }

  /**
   * Create a PayPal order for purchasing a product
   */
  async createOrder(params: CreatePayPalOrderParams): Promise<{ orderId: string; approvalUrl: string }> {
    const {
      productId,
      productName,
      productDescription,
      amount,
      currency = 'USD',
      buyerId,
      artistId,
      returnUrl,
      cancelUrl,
    } = params;

    try {
      const { result } = await this.ordersController.createOrder({
        body: {
          intent: CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              referenceId: productId,
              description: productDescription || productName,
              customId: JSON.stringify({ productId, buyerId, artistId }),
              amount: {
                currencyCode: currency,
                value: amount.toFixed(2),
              },
            },
          ],
          paymentSource: {
            paypal: {
              experienceContext: {
                paymentMethodPreference: PayeePaymentMethodPreference.ImmediatePaymentRequired,
                brandName: 'sedā.fm',
                locale: 'en-US',
                landingPage: PaypalExperienceLandingPage.Login,
                userAction: PaypalExperienceUserAction.PayNow,
                returnUrl,
                cancelUrl,
              },
            },
          },
        },
        prefer: 'return=representation',
      });

      const order = result as Order;
      const approvalLink = order.links?.find((link) => link.rel === 'payer-action');

      if (!order.id || !approvalLink?.href) {
        throw new Error('Failed to get PayPal order approval URL');
      }

      this.logger.log(`Created PayPal order ${order.id} for product ${productId}`);

      return {
        orderId: order.id,
        approvalUrl: approvalLink.href,
      };
    } catch (error) {
      this.logger.error(`Failed to create PayPal order: ${error.message}`);
      throw new BadRequestException('Failed to create PayPal order');
    }
  }

  /**
   * Capture a PayPal order after user approval
   */
  async captureOrder(orderId: string): Promise<CapturePayPalOrderResult> {
    try {
      const { result } = await this.ordersController.captureOrder({
        id: orderId,
        prefer: 'return=representation',
      });

      const order = result as Order;
      const capture = order.purchaseUnits?.[0]?.payments?.captures?.[0];

      if (!capture) {
        throw new Error('No capture found in PayPal order');
      }

      this.logger.log(`Captured PayPal order ${orderId}, status: ${order.status}`);

      return {
        orderId: order.id!,
        status: order.status!,
        payerId: order.payer?.payerId,
        amount: parseFloat(capture.amount?.value || '0'),
        currency: capture.amount?.currencyCode || 'USD',
      };
    } catch (error) {
      this.logger.error(`Failed to capture PayPal order: ${error.message}`);
      throw new BadRequestException('Failed to capture PayPal payment');
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const { result } = await this.ordersController.getOrder({
        id: orderId,
      });

      return result as Order;
    } catch (error) {
      this.logger.error(`Failed to get PayPal order: ${error.message}`);
      throw new BadRequestException('Failed to retrieve PayPal order');
    }
  }

  /**
   * Get PayPal client ID for frontend
   */
  getClientId(): string {
    return this.configService.get<string>('paypal.clientId') || '';
  }

  /**
   * Check if PayPal is configured
   */
  isConfigured(): boolean {
    const clientId = this.configService.get<string>('paypal.clientId');
    const clientSecret = this.configService.get<string>('paypal.clientSecret');
    return !!(clientId && clientSecret);
  }
}
