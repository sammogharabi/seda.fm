import { Controller, Get, Query, Request, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { DiscoverService } from './discover.service';

@ApiTags('discover')
@Controller('discover')
@UseGuards(AuthGuard, FeatureGuard)
@Feature('DISCOVER')
@ApiBearerAuth()
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('artists')
  @Public()
  @ApiOperation({ summary: 'Get verified artists' })
  @ApiResponse({ status: 200, description: 'Artists retrieved successfully' })
  async getArtists(@Query('limit') limit: number = 20) {
    return this.discoverService.getArtists(limit);
  }

  @Get('people')
  @ApiOperation({ summary: 'Get suggested people to follow' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max number of suggestions' })
  @ApiResponse({ status: 200, description: 'People suggestions retrieved successfully' })
  async getPeople(@Request() req: any, @Query('limit') limit: number = 20) {
    const userId = req.user.id;
    return this.discoverService.getPeopleSuggestions(userId, limit);
  }

  @Get('rooms')
  @Public()
  @ApiOperation({ summary: 'Get trending rooms' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max number of rooms' })
  @ApiResponse({ status: 200, description: 'Trending rooms retrieved successfully' })
  async getRooms(@Query('limit') limit: number = 20) {
    return this.discoverService.getTrendingRooms(limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending crates' })
  @ApiResponse({ status: 200, description: 'Trending crates retrieved successfully' })
  async getTrending(@Query('limit') limit: number = 20) {
    return this.discoverService.getTrendingCrates(limit);
  }

  @Get('new-releases')
  @ApiOperation({ summary: 'Get new releases' })
  @ApiResponse({ status: 200, description: 'New releases retrieved successfully' })
  async getNewReleases(@Query('limit') limit: number = 20) {
    return this.discoverService.getNewCrates(limit);
  }

  @Get('for-you')
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiResponse({ status: 200, description: 'Personalized recommendations retrieved successfully' })
  async getForYou(@Request() req: any, @Query('limit') limit: number = 20) {
    const userId = req.user.id;
    return this.discoverService.getPersonalized(userId, limit);
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: 'Get crates by genre' })
  @ApiResponse({ status: 200, description: 'Genre crates retrieved successfully' })
  async getByGenre(@Param('genre') genre: string, @Query('limit') limit: number = 20) {
    return this.discoverService.getByGenre(genre, limit);
  }
}
