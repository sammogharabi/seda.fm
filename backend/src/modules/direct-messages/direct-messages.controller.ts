import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DirectMessagesService } from './direct-messages.service';
import { CreateMessageDto, StartConversationDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('messages')
@UseGuards(AuthGuard)
export class DirectMessagesController {
  constructor(private readonly dmService: DirectMessagesService) {}

  @Get('conversations')
  async getConversations(@Req() req: AuthRequest) {
    return this.dmService.getConversations(req.user.id);
  }

  @Post('conversations')
  async startConversation(
    @Req() req: AuthRequest,
    @Body() dto: StartConversationDto,
  ) {
    return this.dmService.startConversation(req.user.id, dto);
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return this.dmService.getConversation(id, req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Query() dto: GetMessagesDto,
  ) {
    return this.dmService.getMessages(id, req.user.id, dto.cursor, dto.limit);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: CreateMessageDto,
  ) {
    return this.dmService.sendMessage(req.user.id, id, dto);
  }

  @Post('conversations/:id/read')
  async markAsRead(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return this.dmService.markAsRead(id, req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthRequest) {
    return this.dmService.getUnreadCount(req.user.id);
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return this.dmService.deleteConversation(id, req.user.id);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @Req() req: AuthRequest,
  ) {
    return this.dmService.deleteMessage(conversationId, messageId, req.user.id);
  }
}
