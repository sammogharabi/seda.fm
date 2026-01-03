import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid initialized successfully');
    } else {
      this.logger.warn('SendGrid API key not found - email sending will be disabled');
    }
  }

  async sendVerificationEmail(
    to: string,
    username: string,
    verificationToken: string,
    userType: 'fan' | 'artist',
  ): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@seda.fm';
      const appUrl = this.configService.get<string>('APP_URL') || (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');
      const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}&type=${userType}`;

      const msg = {
        to,
        from: fromEmail,
        subject: 'Welcome to Sedā.fm - Verify Your Email',
        text: `Hi ${username},\n\nWelcome to Sedā.fm! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email.\n\nBest,\nThe Sedā.fm Team`,
        html: this.getVerificationEmailHTML(username, verificationUrl, userType),
        // Disable click tracking for local development (localhost URLs don't work with tracking)
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
        },
      };

      await sgMail.send(msg);
      this.logger.log(`Verification email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      return false;
    }
  }

  async sendPurchaseConfirmationEmail(
    to: string,
    buyerName: string,
    purchase: {
      productTitle: string;
      productType: string;
      artistName: string;
      amount: number;
      purchaseId: string;
      hasDownload: boolean;
    },
  ): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@seda.fm';
      const appUrl = this.configService.get<string>('APP_URL') || (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');
      const purchaseUrl = `${appUrl}/purchases/${purchase.purchaseId}`;

      const msg = {
        to,
        from: fromEmail,
        subject: `Purchase Confirmed - ${purchase.productTitle}`,
        text: `Hi ${buyerName},\n\nThank you for your purchase!\n\nProduct: ${purchase.productTitle}\nArtist: ${purchase.artistName}\nAmount: $${purchase.amount.toFixed(2)}\n\n${purchase.hasDownload ? `Download your purchase here: ${purchaseUrl}` : `View your purchase here: ${purchaseUrl}`}\n\nThank you for supporting independent artists on Sedā.fm!\n\nBest,\nThe Sedā.fm Team`,
        html: this.getPurchaseConfirmationEmailHTML(buyerName, purchase, purchaseUrl),
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
        },
      };

      await sgMail.send(msg);
      this.logger.log(`Purchase confirmation email sent to ${to} for purchase ${purchase.purchaseId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send purchase confirmation email to ${to}:`, error);
      return false;
    }
  }

  private getPurchaseConfirmationEmailHTML(
    buyerName: string,
    purchase: {
      productTitle: string;
      productType: string;
      artistName: string;
      amount: number;
      purchaseId: string;
      hasDownload: boolean;
    },
    purchaseUrl: string,
  ): string {
    const accentColor = '#4ECDC4';
    const productTypeLabel = this.formatProductType(purchase.productType);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmed - Sedā.fm</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #1a1a1a; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid ${accentColor};">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff;">
                sedā<span style="color: ${accentColor};">.</span>fm
              </h1>
              <p style="margin: 10px 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px;">
                Purchase Confirmed
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Thank you, ${buyerName}!
              </h2>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                Your purchase has been confirmed. Here are the details:
              </p>

              <!-- Purchase Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f0f0f; border: 1px solid #333; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                          <span style="color: #888; font-size: 14px;">Product</span><br>
                          <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${purchase.productTitle}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                          <span style="color: #888; font-size: 14px;">Type</span><br>
                          <span style="color: #ffffff; font-size: 16px;">${productTypeLabel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                          <span style="color: #888; font-size: 14px;">Artist</span><br>
                          <span style="color: ${accentColor}; font-size: 16px; font-weight: 600;">${purchase.artistName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #888; font-size: 14px;">Amount Paid</span><br>
                          <span style="color: #4ECDC4; font-size: 24px; font-weight: 700;">$${purchase.amount.toFixed(2)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${purchaseUrl}" style="display: inline-block; padding: 16px 40px; background-color: ${accentColor}; color: #000000; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      ${purchase.hasDownload ? 'Download Now' : 'View Purchase'}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #888; text-align: center;">
                Thank you for supporting independent artists!<br>
                90% of your purchase goes directly to the artist.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0f0f0f; border-top: 1px solid #333;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-align: center;">
                © ${new Date().getFullYear()} Sedā.fm - The Independent Music Collective
              </p>
              <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                Order ID: ${purchase.purchaseId}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private formatProductType(type: string): string {
    const typeMap: Record<string, string> = {
      'DIGITAL_TRACK': 'Single Track',
      'DIGITAL_ALBUM': 'Album',
      'MERCHANDISE_LINK': 'Merchandise',
      'CONCERT_LINK': 'Concert Ticket',
      'PRESET_PACK': 'Preset Pack',
      'SAMPLE_PACK': 'Sample Pack',
    };
    return typeMap[type] || type;
  }

  async sendOrderShippedEmail(
    to: string,
    buyerName: string,
    order: {
      productTitle: string;
      orderId: string;
      trackingNumber?: string;
      trackingCarrier?: string;
      shippingAddress: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    },
  ): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@seda.fm';
      const appUrl = this.configService.get<string>('APP_URL') || (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');
      const orderUrl = `${appUrl}/purchases/${order.orderId}`;

      const trackingInfo = order.trackingNumber
        ? `\n\nTracking: ${order.trackingCarrier || 'Carrier'} - ${order.trackingNumber}`
        : '';

      const addressLines = [
        order.shippingAddress.name,
        order.shippingAddress.address1,
        order.shippingAddress.address2,
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`,
        order.shippingAddress.country,
      ].filter(Boolean).join('\n');

      const msg = {
        to,
        from: fromEmail,
        subject: `Your Order Has Shipped! - ${order.productTitle}`,
        text: `Hi ${buyerName},\n\nGreat news! Your order has shipped!\n\nProduct: ${order.productTitle}${trackingInfo}\n\nShipping to:\n${addressLines}\n\nView your order: ${orderUrl}\n\nThank you for supporting independent artists on Sedā.fm!\n\nBest,\nThe Sedā.fm Team`,
        html: this.getOrderShippedEmailHTML(buyerName, order, orderUrl),
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
        },
      };

      await sgMail.send(msg);
      this.logger.log(`Order shipped email sent to ${to} for order ${order.orderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order shipped email to ${to}:`, error);
      return false;
    }
  }

  private getOrderShippedEmailHTML(
    buyerName: string,
    order: {
      productTitle: string;
      orderId: string;
      trackingNumber?: string;
      trackingCarrier?: string;
      shippingAddress: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    },
    orderUrl: string,
  ): string {
    const accentColor = '#4ECDC4';
    const trackingSection = order.trackingNumber
      ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                          <span style="color: #888; font-size: 14px;">Tracking</span><br>
                          <span style="color: ${accentColor}; font-size: 16px; font-weight: 600;">${order.trackingCarrier || 'Carrier'}: ${order.trackingNumber}</span>
                        </td>
                      </tr>`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped - Sedā.fm</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #1a1a1a; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid ${accentColor};">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff;">
                sedā<span style="color: ${accentColor};">.</span>fm
              </h1>
              <p style="margin: 10px 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px;">
                Order Shipped
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Your order is on its way, ${buyerName}!
              </h2>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                Great news! Your order has shipped and is heading your way.
              </p>

              <!-- Order Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f0f0f; border: 1px solid #333; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #333;">
                          <span style="color: #888; font-size: 14px;">Product</span><br>
                          <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${order.productTitle}</span>
                        </td>
                      </tr>${trackingSection}
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #888; font-size: 14px;">Shipping To</span><br>
                          <span style="color: #ffffff; font-size: 14px; line-height: 1.6;">
                            ${order.shippingAddress.name}<br>
                            ${order.shippingAddress.address1}<br>
                            ${order.shippingAddress.address2 ? order.shippingAddress.address2 + '<br>' : ''}
                            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                            ${order.shippingAddress.country}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${orderUrl}" style="display: inline-block; padding: 16px 40px; background-color: ${accentColor}; color: #000000; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      View Order
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #888; text-align: center;">
                Thank you for supporting independent artists!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0f0f0f; border-top: 1px solid #333;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-align: center;">
                © ${new Date().getFullYear()} Sedā.fm - The Independent Music Collective
              </p>
              <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                Order ID: ${order.orderId}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private getVerificationEmailHTML(username: string, verificationUrl: string, userType: 'fan' | 'artist'): string {
    const userTypeLabel = userType === 'artist' ? 'Artist' : 'Fan';
    const accentColor = userType === 'artist' ? '#FF6B6B' : '#4ECDC4';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Sedā.fm</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #1a1a1a; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid ${accentColor};">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff;">
                sedā<span style="color: ${accentColor};">.</span>fm
              </h1>
              <p style="margin: 10px 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px;">
                ${userTypeLabel} Account
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Welcome, ${username}!
              </h2>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                Thanks for joining Sedā.fm. We're excited to have you as part of our community where music lovers and creators connect.
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                To get started, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background-color: ${accentColor}; color: #000000; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #888;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: ${accentColor}; word-break: break-all;">${verificationUrl}</a>
              </p>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #888;">
                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0f0f0f; border-top: 1px solid #333;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-align: center;">
                © ${new Date().getFullYear()} Sedā.fm - The Independent Music Collective
              </p>
              <p style="margin: 0; font-size: 12px; color: #666; text-align: center;">
                Where 90% goes to artists, not corporate middlemen.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
