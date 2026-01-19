import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { GetPlaylistItemsDto } from './dto/get-playlist-items.dto';
import { ReorderPlaylistItemsDto } from './dto/reorder-playlist-items.dto';

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(AuthGuard, FeatureGuard)
@Feature('PLAYLISTS')
@ApiBearerAuth()
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // === CRATE SOCIAL FEATURES (PUBLIC) ===
  // NOTE: These routes must come BEFORE :id routes to avoid route conflicts

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending crates (playlists)' })
  @ApiResponse({ status: 200, description: 'Trending crates retrieved successfully' })
  async getTrendingCrates(@Query('limit') limit: number = 20) {
    return this.playlistsService.getTrending(limit);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured crates (playlists)' })
  @ApiResponse({ status: 200, description: 'Featured crates retrieved successfully' })
  async getFeaturedCrates(@Query('limit') limit: number = 20) {
    return this.playlistsService.getFeatured(limit);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get current user\'s playlists (crates)' })
  @ApiResponse({ status: 200, description: 'User playlists retrieved successfully' })
  async getMyPlaylists(@Request() req: any) {
    const userId = req.user.id;
    return this.playlistsService.getUserPlaylists(userId, true);
  }

  // === PLAYLIST CRUD ===

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({
    status: 201,
    description: 'Playlist created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'User profile not found',
  })
  async createPlaylist(@Request() req: any, @Body() dto: CreatePlaylistDto) {
    const userId = req.user.id;
    return this.playlistsService.createPlaylist(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get playlist by ID' })
  @ApiResponse({
    status: 200,
    description: 'Playlist retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  async getPlaylist(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.playlistsService.getPlaylist(id, userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update playlist' })
  @ApiResponse({
    status: 200,
    description: 'Playlist updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this playlist',
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  async updatePlaylist(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdatePlaylistDto,
  ) {
    const userId = req.user.id;
    return this.playlistsService.updatePlaylist(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete playlist' })
  @ApiResponse({
    status: 200,
    description: 'Playlist deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to delete this playlist',
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  async deletePlaylist(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.playlistsService.deletePlaylist(id, userId);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to playlist' })
  @ApiResponse({
    status: 201,
    description: 'Item added to playlist successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to modify this playlist',
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Position already taken',
  })
  async addPlaylistItem(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: AddPlaylistItemDto,
  ) {
    const userId = req.user.id;
    return this.playlistsService.addPlaylistItem(id, userId, dto);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get playlist items with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Playlist items retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        nextCursor: {
          type: 'string',
          nullable: true,
        },
        hasMore: {
          type: 'boolean',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  async getPlaylistItems(
    @Param('id') id: string,
    @Query() query: GetPlaylistItemsDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.playlistsService.getPlaylistItems(id, query, userId);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from playlist' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from playlist successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to modify this playlist',
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist or item not found',
  })
  async removePlaylistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.playlistsService.removePlaylistItem(id, itemId, userId);
  }

  @Patch(':id/items/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder playlist items' })
  @ApiResponse({
    status: 200,
    description: 'Items reordered successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to modify this playlist',
  })
  @ApiResponse({
    status: 404,
    description: 'Playlist not found',
  })
  async reorderPlaylistItems(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ReorderPlaylistItemsDto,
  ) {
    const userId = req.user.id;
    return this.playlistsService.reorderPlaylistItems(id, userId, dto.items);
  }

}
