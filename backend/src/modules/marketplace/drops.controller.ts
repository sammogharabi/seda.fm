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
import { DropsService } from './drops.service';
import { CreateDropDto } from './dto/create-drop.dto';
import { UpdateDropDto } from './dto/update-drop.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { DropStatus } from '@prisma/client';

/**
 * Controller for managing merch drops.
 */
@Controller('marketplace/drops')
export class DropsController {
  constructor(private readonly dropsService: DropsService) {}

  // ============ Artist Endpoints ============

  /**
   * Create a new drop.
   * POST /api/marketplace/drops
   */
  @UseGuards(AuthGuard)
  @Post()
  createDrop(@Request() req: any, @Body() dto: CreateDropDto) {
    return this.dropsService.createDrop(req.user.id, dto);
  }

  /**
   * Update a drop.
   * PUT /api/marketplace/drops/:id
   */
  @UseGuards(AuthGuard)
  @Put(':id')
  updateDrop(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDropDto,
  ) {
    return this.dropsService.updateDrop(req.user.id, id, dto);
  }

  /**
   * Publish a drop (set it live).
   * POST /api/marketplace/drops/:id/publish
   */
  @UseGuards(AuthGuard)
  @Post(':id/publish')
  publishDrop(@Request() req: any, @Param('id') id: string) {
    return this.dropsService.publishDrop(req.user.id, id);
  }

  /**
   * Cancel a drop.
   * POST /api/marketplace/drops/:id/cancel
   */
  @UseGuards(AuthGuard)
  @Post(':id/cancel')
  cancelDrop(@Request() req: any, @Param('id') id: string) {
    return this.dropsService.cancelDrop(req.user.id, id);
  }

  /**
   * Delete a draft drop.
   * DELETE /api/marketplace/drops/:id
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteDrop(@Request() req: any, @Param('id') id: string) {
    return this.dropsService.deleteDrop(req.user.id, id);
  }

  /**
   * Get all drops for the current artist.
   * GET /api/marketplace/drops/mine
   */
  @UseGuards(AuthGuard)
  @Get('mine')
  getMyDrops(@Request() req: any, @Query('status') status?: DropStatus) {
    return this.dropsService.getArtistDrops(req.user.id, status);
  }

  // ============ Public Endpoints ============

  /**
   * Get a single drop by ID (public view).
   * GET /api/marketplace/drops/:id
   */
  @Get(':id')
  getDropById(@Param('id') id: string, @Request() req: any) {
    // Try to get viewer ID if authenticated
    const viewerId = req.user?.id;
    return this.dropsService.getDropById(id, viewerId);
  }

  /**
   * Get live drops for an artist's public page.
   * GET /api/marketplace/drops/artist/:artistId
   */
  @Get('artist/:artistId')
  getPublicDrops(@Param('artistId') artistId: string, @Request() req: any) {
    const viewerId = req.user?.id;
    return this.dropsService.getPublicDrops(artistId, viewerId);
  }
}
