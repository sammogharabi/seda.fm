import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './services/chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { ModerateUserDto } from './dto/moderate-user.dto';
import { MessageEntity } from './entities/message.entity';
import { RoomEntity } from './entities/room.entity';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Room created successfully', type: RoomEntity })
  async createRoom(@Request() req: any, @Body() createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    return this.chatService.createRoom(req.user.id, createRoomDto);
  }

  @Post('rooms/:roomId/join')
  @ApiOperation({ summary: 'Join a chat room' })
  @ApiResponse({ status: 200, description: 'Successfully joined room' })
  async joinRoom(@Request() req: any, @Param('roomId') roomId: string): Promise<{ message: string }> {
    await this.chatService.joinRoom(req.user.id, roomId);
    return { message: 'Successfully joined room' };
  }

  @Post('rooms/:roomId/leave')
  @ApiOperation({ summary: 'Leave a chat room' })
  @ApiResponse({ status: 200, description: 'Successfully left room' })
  async leaveRoom(@Request() req: any, @Param('roomId') roomId: string): Promise<{ message: string }> {
    await this.chatService.leaveRoom(req.user.id, roomId);
    return { message: 'Successfully left room' };
  }

  @Post('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Send a message to a room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: MessageEntity })
  async sendMessage(
    @Request() req: any,
    @Param('roomId') roomId: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageEntity> {
    const message = await this.chatService.sendMessage(req.user.id, roomId, sendMessageDto);
    
    // Emit via WebSocket for real-time updates
    this.chatGateway.server.to(roomId).emit('message_created', message);
    
    return message;
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get messages from a room' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully', type: [MessageEntity] })
  async getMessages(
    @Param('roomId') roomId: string,
    @Query() getMessagesDto: GetMessagesDto,
  ): Promise<MessageEntity[]> {
    return this.chatService.getMessages(roomId, getMessagesDto);
  }

  @Post('messages/:messageId/reactions')
  @ApiOperation({ summary: 'Add reaction to a message' })
  @ApiResponse({ status: 201, description: 'Reaction added successfully' })
  async addReaction(
    @Request() req: any,
    @Param('messageId') messageId: string,
    @Body() addReactionDto: AddReactionDto,
  ): Promise<{ message: string }> {
    await this.chatService.addReaction(req.user.id, messageId, addReactionDto.emoji);
    
    // Emit via WebSocket for real-time updates
    const reaction = {
      id: `${messageId}-${req.user.id}-${addReactionDto.emoji}`,
      messageId,
      userId: req.user.id,
      emoji: addReactionDto.emoji,
      createdAt: new Date(),
    };
    this.chatGateway.server.emit('reaction_added', reaction);
    
    return { message: 'Reaction added successfully' };
  }

  @Delete('messages/:messageId/reactions/:emoji')
  @ApiOperation({ summary: 'Remove reaction from a message' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  async removeReaction(
    @Request() req: any,
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
  ): Promise<{ message: string }> {
    await this.chatService.removeReaction(req.user.id, messageId, emoji);
    
    // Emit via WebSocket for real-time updates
    this.chatGateway.server.emit('reaction_removed', messageId, req.user.id, emoji);
    
    return { message: 'Reaction removed successfully' };
  }

  @Post('rooms/:roomId/moderation')
  @ApiOperation({ summary: 'Moderate a user or message' })
  @ApiResponse({ status: 200, description: 'Moderation action completed' })
  async moderateUser(
    @Request() req: any,
    @Param('roomId') roomId: string,
    @Body() moderateUserDto: ModerateUserDto,
  ): Promise<{ message: string }> {
    await this.chatService.moderateUser(req.user.id, roomId, moderateUserDto);
    
    // Emit appropriate WebSocket events based on action
    switch (moderateUserDto.action) {
      case 'DELETE_MESSAGE':
        this.chatGateway.emitMessageDeleted(moderateUserDto.targetId, roomId);
        break;
      case 'MUTE_USER':
        const mutedUntil = new Date();
        mutedUntil.setHours(mutedUntil.getHours() + 24);
        this.chatGateway.emitUserMuted(roomId, moderateUserDto.targetId, mutedUntil);
        break;
    }
    
    return { message: 'Moderation action completed' };
  }
}