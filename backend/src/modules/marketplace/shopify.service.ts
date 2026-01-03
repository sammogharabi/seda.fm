import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { ShopifyConnectionStatus } from '@prisma/client';
import { ShopifyProvider } from './providers/shopify.provider';
import * as crypto from 'crypto';

/**
 * Shopify OAuth and connection management service.
 * Handles OAuth flow, token storage, and catalog sync.
 */
@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  // Shopify API configuration
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly scopes: string;
  private readonly redirectUri: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private shopifyProvider: ShopifyProvider,
  ) {
    this.apiKey = this.configService.get<string>('SHOPIFY_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('SHOPIFY_API_SECRET') || '';
    this.scopes = 'read_products,read_inventory';
    this.redirectUri =
      this.configService.get<string>('SHOPIFY_REDIRECT_URI') ||
      `${this.configService.get<string>('API_URL')}/api/marketplace/shopify/callback`;
  }

  /**
   * Generate OAuth install URL for Shopify.
   * Artist initiates connection by visiting this URL.
   */
  async generateInstallUrl(
    artistId: string,
    shopDomain: string,
  ): Promise<{ installUrl: string }> {
    // Validate shop domain format
    const cleanDomain = this.cleanShopDomain(shopDomain);
    if (!cleanDomain) {
      throw new BadRequestException('Invalid shop domain format');
    }

    // Generate unique state for CSRF protection
    const state = this.generateState(artistId);

    // Store pending connection
    await this.prisma.shopifyConnection.upsert({
      where: { artistId },
      update: {
        shopDomain: cleanDomain,
        status: ShopifyConnectionStatus.PENDING,
        oauthState: state,
        updatedAt: new Date(),
      },
      create: {
        artistId,
        shopDomain: cleanDomain,
        status: ShopifyConnectionStatus.PENDING,
        oauthState: state,
        accessToken: '', // Will be filled on callback
        scopes: this.scopes.split(','),
      },
    });

    // Build OAuth URL
    const installUrl = new URL(`https://${cleanDomain}/admin/oauth/authorize`);
    installUrl.searchParams.set('client_id', this.apiKey);
    installUrl.searchParams.set('scope', this.scopes);
    installUrl.searchParams.set('redirect_uri', this.redirectUri);
    installUrl.searchParams.set('state', state);

    this.logger.log(`Generated install URL for artist ${artistId}, shop ${cleanDomain}`);

    return { installUrl: installUrl.toString() };
  }

  /**
   * Handle OAuth callback from Shopify.
   * Exchanges code for access token and stores connection.
   */
  async handleCallback(
    code: string,
    state: string,
    shopDomain: string,
  ): Promise<{ success: boolean; artistId: string }> {
    // Find pending connection by state
    const connection = await this.prisma.shopifyConnection.findFirst({
      where: {
        oauthState: state,
        status: ShopifyConnectionStatus.PENDING,
      },
    });

    if (!connection) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }

    // Validate shop domain matches
    const cleanDomain = this.cleanShopDomain(shopDomain);
    if (cleanDomain !== connection.shopDomain) {
      throw new BadRequestException('Shop domain mismatch');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(
        cleanDomain,
        code,
      );

      // Update connection with access token
      await this.prisma.shopifyConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: tokenResponse.access_token,
          scopes: tokenResponse.scope.split(','),
          status: ShopifyConnectionStatus.CONNECTED,
          oauthState: null, // Clear state after successful auth
          connectedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Shopify connected for artist ${connection.artistId}, shop ${cleanDomain}`,
      );

      // Trigger initial product sync in background
      this.triggerSync(connection.artistId).catch((err) => {
        this.logger.error(`Initial sync failed: ${err.message}`);
      });

      return { success: true, artistId: connection.artistId };
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`);

      // Mark connection as failed
      await this.prisma.shopifyConnection.update({
        where: { id: connection.id },
        data: {
          status: ShopifyConnectionStatus.DISCONNECTED,
          oauthState: null,
        },
      });

      throw error;
    }
  }

  /**
   * Disconnect Shopify store.
   */
  async disconnect(artistId: string): Promise<void> {
    const connection = await this.prisma.shopifyConnection.findUnique({
      where: { artistId },
    });

    if (!connection) {
      throw new BadRequestException('No Shopify connection found');
    }

    // Delete cached products
    await this.prisma.shopifyProduct.deleteMany({
      where: { connectionId: connection.id },
    });

    // Update connection status
    await this.prisma.shopifyConnection.update({
      where: { id: connection.id },
      data: {
        status: ShopifyConnectionStatus.DISCONNECTED,
        accessToken: '',
      },
    });

    this.logger.log(`Shopify disconnected for artist ${artistId}`);
  }

  /**
   * Get connection status for an artist.
   */
  async getConnectionStatus(artistId: string): Promise<{
    connected: boolean;
    shopDomain?: string;
    lastSyncedAt?: Date | null;
    syncedProductCount?: number;
    status: string;
  }> {
    const connection = await this.prisma.shopifyConnection.findUnique({
      where: { artistId },
    });

    if (!connection) {
      return { connected: false, status: 'not_connected' };
    }

    return {
      connected: connection.status === ShopifyConnectionStatus.CONNECTED,
      shopDomain: connection.shopDomain,
      lastSyncedAt: connection.lastSyncedAt,
      syncedProductCount: connection.syncedProductCount,
      status: connection.status,
    };
  }

  /**
   * Manually trigger product sync.
   */
  async triggerSync(
    artistId: string,
  ): Promise<{ synced: number; errors: string[] }> {
    // Check rate limiting (max 1 sync per 5 minutes)
    const connection = await this.prisma.shopifyConnection.findUnique({
      where: { artistId },
    });

    if (!connection) {
      throw new BadRequestException('No Shopify connection found');
    }

    if (connection.status !== ShopifyConnectionStatus.CONNECTED) {
      throw new ForbiddenException('Shopify is not connected');
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (connection.lastSyncedAt && connection.lastSyncedAt > fiveMinutesAgo) {
      throw new BadRequestException('Sync rate limit: please wait 5 minutes between syncs');
    }

    return this.shopifyProvider.syncProducts(artistId);
  }

  /**
   * Exchange authorization code for access token.
   */
  private async exchangeCodeForToken(
    shopDomain: string,
    code: string,
  ): Promise<{ access_token: string; scope: string }> {
    const url = `https://${shopDomain}/admin/oauth/access_token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new BadRequestException(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Generate CSRF state token.
   * Includes artistId for lookup on callback.
   */
  private generateState(artistId: string): string {
    const randomPart = crypto.randomBytes(16).toString('hex');
    const hmac = crypto
      .createHmac('sha256', this.apiSecret)
      .update(`${artistId}:${randomPart}`)
      .digest('hex')
      .substring(0, 16);
    return `${randomPart}${hmac}`;
  }

  /**
   * Clean and validate shop domain.
   * Returns format: myshop.myshopify.com
   */
  private cleanShopDomain(domain: string): string | null {
    if (!domain) return null;

    // Remove protocol and trailing slashes
    let clean = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    // Handle various input formats
    // my-shop → my-shop.myshopify.com
    // my-shop.myshopify.com → my-shop.myshopify.com
    // my-shop.com → reject (custom domains not supported in this flow)

    if (!clean.includes('.')) {
      // Just shop name provided
      clean = `${clean}.myshopify.com`;
    }

    // Validate it's a myshopify.com domain
    if (!clean.endsWith('.myshopify.com')) {
      // Could be custom domain - for now, reject
      // Future: could look up the shop's myshopify.com domain
      return null;
    }

    // Validate shop name format (alphanumeric + hyphens)
    const shopName = clean.replace('.myshopify.com', '');
    if (!/^[a-z0-9-]+$/.test(shopName)) {
      return null;
    }

    return clean;
  }
}
