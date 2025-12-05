import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
@UseGuards(AuthGuard, FeatureGuard)
@Feature('SEARCH')
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Universal search across all entities' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query() query: SearchDto) {
    return this.searchService.search(query);
  }
}
