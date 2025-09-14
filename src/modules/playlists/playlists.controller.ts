import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { GetPlaylistItemsDto } from './dto/get-playlist-items.dto';

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(AuthGuard, FeatureGuard)
@Feature('PLAYLISTS')
@ApiBearerAuth()
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

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
}