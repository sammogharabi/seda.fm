import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ShopifyService } from './shopify.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ConfigService } from '@nestjs/config';

/**
 * Shopify integration controller.
 * Handles OAuth flow and connection management.
 */
@Controller('marketplace/shopify')
export class ShopifyController {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate OAuth install URL for Shopify.
   * Artist calls this to start connecting their store.
   *
   * POST /api/marketplace/shopify/install
   * Body: { shopDomain: "my-shop" or "my-shop.myshopify.com" }
   */
  @UseGuards(AuthGuard)
  @Post('install')
  async install(
    @Request() req: any,
    @Body() body: { shopDomain: string },
  ) {
    return this.shopifyService.generateInstallUrl(req.user.id, body.shopDomain);
  }

  /**
   * OAuth callback from Shopify.
   * Shopify redirects here after merchant approves the app.
   * We exchange the code for an access token and redirect to frontend.
   *
   * GET /api/marketplace/shopify/callback?code=xxx&state=xxx&shop=xxx
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('shop') shop: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const result = await this.shopifyService.handleCallback(code, state, shop);

      // Redirect to frontend with success
      return res.redirect(
        `${frontendUrl}/artist/merch/settings?shopify=connected`,
      );
    } catch (error) {
      // Redirect to frontend with error
      return res.redirect(
        `${frontendUrl}/artist/merch/settings?shopify=error&message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  /**
   * Get Shopify connection status.
   *
   * GET /api/marketplace/shopify/status
   */
  @UseGuards(AuthGuard)
  @Get('status')
  async status(@Request() req: any) {
    return this.shopifyService.getConnectionStatus(req.user.id);
  }

  /**
   * Disconnect Shopify store.
   *
   * DELETE /api/marketplace/shopify/disconnect
   */
  @UseGuards(AuthGuard)
  @Delete('disconnect')
  async disconnect(@Request() req: any) {
    await this.shopifyService.disconnect(req.user.id);
    return { success: true };
  }

  /**
   * Manually trigger product sync.
   * Rate limited to once per 5 minutes.
   *
   * POST /api/marketplace/shopify/sync
   */
  @UseGuards(AuthGuard)
  @Post('sync')
  async sync(@Request() req: any) {
    return this.shopifyService.triggerSync(req.user.id);
  }
}
