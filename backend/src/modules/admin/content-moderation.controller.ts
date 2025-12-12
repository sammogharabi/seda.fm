import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContentModerationService } from './content-moderation.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PurchaseStatus } from '@prisma/client';

@ApiTags('admin-moderation')
@Controller('admin/moderation')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class ContentModerationController {
  constructor(private readonly contentModerationService: ContentModerationService) {}

  // ============ DASHBOARD ============
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    return this.contentModerationService.getDashboardStats();
  }

  // ============ USERS ============
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'List of users' })
  async listUsers(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Query('search') search?: string,
  ) {
    return this.contentModerationService.listUsers(+limit, +offset, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(@Param('id') id: string) {
    return this.contentModerationService.getUserDetails(id);
  }

  @Patch('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    return this.contentModerationService.deactivateUser(id, req.adminUser.sub, body.reason);
  }

  @Patch('users/:id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a user' })
  @ApiResponse({ status: 200, description: 'User reactivated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async reactivateUser(@Param('id') id: string, @Request() req: any) {
    return this.contentModerationService.reactivateUser(id, req.adminUser.sub);
  }

  // ============ COMMENTS ============
  @Get('comments')
  @ApiOperation({ summary: 'List all comments' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async listComments(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Query('search') search?: string,
  ) {
    return this.contentModerationService.listComments(+limit, +offset, search);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    return this.contentModerationService.deleteComment(id, req.adminUser.sub);
  }

  // ============ MESSAGES ============
  @Get('messages')
  @ApiOperation({ summary: 'List all messages' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'roomId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async listMessages(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Query('roomId') roomId?: string,
    @Query('search') search?: string,
  ) {
    return this.contentModerationService.listMessages(+limit, +offset, roomId, search);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(@Param('id') id: string, @Request() req: any) {
    return this.contentModerationService.deleteMessage(id, req.adminUser.sub);
  }

  // ============ ROOMS ============
  @Get('rooms')
  @ApiOperation({ summary: 'List all rooms' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  async listRooms(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Query('search') search?: string,
  ) {
    return this.contentModerationService.listRooms(+limit, +offset, search);
  }

  @Delete('rooms/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async deleteRoom(@Param('id') id: string, @Request() req: any) {
    return this.contentModerationService.deleteRoom(id, req.adminUser.sub);
  }

  // ============ PLAYLISTS (Crates) ============
  @Get('playlists')
  @ApiOperation({ summary: 'List all playlists (crates)' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'List of playlists' })
  async listPlaylists(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Query('search') search?: string,
  ) {
    return this.contentModerationService.listPlaylists(+limit, +offset, search);
  }

  @Delete('playlists/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a playlist' })
  @ApiResponse({ status: 200, description: 'Playlist deleted' })
  @ApiResponse({ status: 404, description: 'Playlist not found' })
  async deletePlaylist(@Param('id') id: string, @Request() req: any) {
    return this.contentModerationService.deletePlaylist(id, req.adminUser.sub);
  }

  // ============ PURCHASES/REFUNDS ============
  @Get('purchases')
  @ApiOperation({ summary: 'List all purchases' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiQuery({ name: 'status', enum: PurchaseStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of purchases' })
  async listPurchases(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Query('status') status?: PurchaseStatus,
  ) {
    return this.contentModerationService.listPurchases(+limit, +offset, status);
  }

  @Patch('purchases/:id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a purchase' })
  @ApiResponse({ status: 200, description: 'Purchase refunded' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async refundPurchase(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    return this.contentModerationService.refundPurchase(id, req.adminUser.sub, body.reason);
  }
}
