import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';

@ApiTags('admin-analytics')
@Controller('admin/analytics')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  // ============ OVERVIEW ============
  @Get('overview')
  @ApiOperation({ summary: 'Get overview metrics' })
  @ApiResponse({ status: 200, description: 'Overview metrics including users, content, and revenue' })
  async getOverview() {
    return this.analyticsService.getOverviewMetrics();
  }

  // ============ USER ANALYTICS ============
  @Get('users/growth')
  @ApiOperation({ summary: 'Get user growth time series' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'User growth data over time' })
  async getUserGrowth(@Query('days') days = 30) {
    return this.analyticsService.getUserGrowthTimeSeries(+days);
  }

  @Get('users/by-role')
  @ApiOperation({ summary: 'Get user count by role' })
  @ApiResponse({ status: 200, description: 'User counts grouped by role' })
  async getUsersByRole() {
    return this.analyticsService.getUsersByRole();
  }

  @Get('users/active')
  @ApiOperation({ summary: 'Get active users count' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 7)' })
  @ApiResponse({ status: 200, description: 'Active users count' })
  async getActiveUsers(@Query('days') days = 7) {
    return this.analyticsService.getActiveUsers(+days);
  }

  // ============ CONTENT ANALYTICS ============
  @Get('content/rooms/growth')
  @ApiOperation({ summary: 'Get rooms growth time series' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Rooms growth data over time' })
  async getRoomsGrowth(@Query('days') days = 30) {
    return this.analyticsService.getContentGrowthTimeSeries('rooms', +days);
  }

  @Get('content/playlists/growth')
  @ApiOperation({ summary: 'Get playlists growth time series' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Playlists growth data over time' })
  async getPlaylistsGrowth(@Query('days') days = 30) {
    return this.analyticsService.getContentGrowthTimeSeries('playlists', +days);
  }

  @Get('content/messages/growth')
  @ApiOperation({ summary: 'Get messages growth time series' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Messages growth data over time' })
  async getMessagesGrowth(@Query('days') days = 30) {
    return this.analyticsService.getContentGrowthTimeSeries('messages', +days);
  }

  @Get('content/top-rooms')
  @ApiOperation({ summary: 'Get top rooms by activity' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Top rooms by message count' })
  async getTopRooms(@Query('limit') limit = 10) {
    return this.analyticsService.getTopRooms(+limit);
  }

  @Get('content/top-playlists')
  @ApiOperation({ summary: 'Get top playlists by play count' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Top playlists by play count' })
  async getTopPlaylists(@Query('limit') limit = 10) {
    return this.analyticsService.getTopPlaylists(+limit);
  }

  // ============ REVENUE ANALYTICS ============
  @Get('revenue/time-series')
  @ApiOperation({ summary: 'Get revenue time series' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Revenue data over time' })
  async getRevenueTimeSeries(@Query('days') days = 30) {
    return this.analyticsService.getRevenueTimeSeries(+days);
  }

  @Get('revenue/by-product-type')
  @ApiOperation({ summary: 'Get revenue by product type' })
  @ApiResponse({ status: 200, description: 'Revenue breakdown by product type' })
  async getRevenueByProductType() {
    return this.analyticsService.getRevenueByProductType();
  }

  @Get('revenue/top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Top selling products' })
  async getTopProducts(@Query('limit') limit = 10) {
    return this.analyticsService.getTopSellingProducts(+limit);
  }

  // ============ ENGAGEMENT ANALYTICS ============
  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement metrics' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Number of days (default: 7)' })
  @ApiResponse({ status: 200, description: 'Engagement metrics' })
  async getEngagement(@Query('days') days = 7) {
    return this.analyticsService.getEngagementMetrics(+days);
  }

  // ============ ARTIST ANALYTICS ============
  @Get('artists/top')
  @ApiOperation({ summary: 'Get top artists by sales' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Top artists by sales' })
  async getTopArtists(@Query('limit') limit = 10) {
    return this.analyticsService.getTopArtists(+limit);
  }

  @Get('verification/stats')
  @ApiOperation({ summary: 'Get verification request statistics' })
  @ApiResponse({ status: 200, description: 'Verification request statistics by status' })
  async getVerificationStats() {
    return this.analyticsService.getVerificationStats();
  }
}
