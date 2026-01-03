import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ProductType, OrderStatus } from '@prisma/client';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // Product Endpoints

  @UseGuards(AuthGuard)
  @Post('products')
  createProduct(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.marketplaceService.createProduct(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Put('products/:id')
  updateProduct(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.marketplaceService.updateProduct(req.user.id, id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('products/:id')
  deleteProduct(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.deleteProduct(req.user.id, id);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.marketplaceService.getProductById(id);
  }

  @Get('products')
  getAllProducts(@Query('type') type?: ProductType) {
    return this.marketplaceService.getAllProducts(type);
  }

  @Get('artists/:artistId/products')
  getArtistProducts(
    @Param('artistId') artistId: string,
    @Query('includeDrafts') includeDrafts?: string,
  ) {
    return this.marketplaceService.getArtistProducts(
      artistId,
      includeDrafts === 'true',
    );
  }

  // Purchase Endpoints

  @UseGuards(AuthGuard)
  @Post('purchases')
  createPurchase(@Request() req: any, @Body() dto: CreatePurchaseDto) {
    return this.marketplaceService.createPurchase(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Post('purchases/:id/complete')
  completePurchase(@Param('id') id: string) {
    return this.marketplaceService.completePurchase(id);
  }

  @UseGuards(AuthGuard)
  @Get('purchases')
  getUserPurchases(@Request() req: any) {
    return this.marketplaceService.getUserPurchases(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('purchases/:id/download')
  incrementDownloadCount(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.incrementDownloadCount(id, req.user.id);
  }

  /**
   * Get download URL for a completed purchase
   * Returns the file URL and updates download count
   */
  @UseGuards(AuthGuard)
  @Get('purchases/:id/download-link')
  getDownloadLink(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.getDownloadLink(id, req.user.id);
  }

  // Revenue Endpoints

  /**
   * Get revenue breakdown for a given amount
   * Shows how much artist receives after platform fee and processing fees
   */
  @Get('revenue/breakdown')
  getRevenueBreakdown(
    @Query('amount') amount: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    const parsedAmount = parseFloat(amount) || 0;
    const method = paymentMethod === 'paypal' ? 'paypal' : 'stripe';
    return this.marketplaceService.calculateRevenueBreakdown(parsedAmount, method);
  }

  @UseGuards(AuthGuard)
  @Get('revenue')
  getArtistRevenue(@Request() req: any) {
    return this.marketplaceService.getArtistRevenue(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('revenue/history')
  getArtistRevenueHistory(@Request() req: any) {
    return this.marketplaceService.getArtistRevenueHistory(req.user.id);
  }

  // Fan Engagement Endpoints

  @UseGuards(AuthGuard)
  @Get('fans')
  getArtistFans(@Request() req: any) {
    return this.marketplaceService.getArtistFans(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('fans/top')
  getTopFans(@Request() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.marketplaceService.getTopFans(req.user.id, parsedLimit);
  }

  // Order Management Endpoints (for physical products)

  /**
   * Get all orders for an artist (purchases of their physical products)
   * Filter by order status optionally
   */
  @UseGuards(AuthGuard)
  @Get('orders')
  getArtistOrders(
    @Request() req: any,
    @Query('status') status?: OrderStatus,
  ) {
    return this.marketplaceService.getArtistOrders(req.user.id, status);
  }

  /**
   * Get a specific order's details
   */
  @UseGuards(AuthGuard)
  @Get('orders/:id')
  getOrderDetails(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.getOrderDetails(req.user.id, id);
  }

  /**
   * Update order status (for artists to mark orders as shipped, etc.)
   * Optionally include tracking info when marking as shipped
   */
  @UseGuards(AuthGuard)
  @Put('orders/:id/status')
  updateOrderStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.marketplaceService.updateOrderStatus(
      req.user.id,
      id,
      dto.status,
      {
        trackingNumber: dto.trackingNumber,
        trackingCarrier: dto.trackingCarrier,
      },
    );
  }
}
