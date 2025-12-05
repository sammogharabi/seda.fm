import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AuthGuard)
  @Post('track')
  trackEvent(
    @Request() req: any,
    @Body() body: { eventType: string; data?: Record<string, any> },
  ) {
    return this.analyticsService.trackEvent(
      req.user.id,
      body.eventType,
      body.data || {},
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  getAnalytics(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.analyticsService.getAnalytics(req.user.id, start, end);
  }

  @UseGuards(AuthGuard)
  @Get('summary')
  getAnalyticsSummary(
    @Request() req: any,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getAnalyticsSummary(req.user.id, parsedDays);
  }

  @UseGuards(AuthGuard)
  @Get('today')
  getTodayAnalytics(@Request() req: any) {
    return this.analyticsService.getTodayAnalytics(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('countries')
  getTopCountries(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.analyticsService.getTopCountries(req.user.id, parsedLimit);
  }
}
