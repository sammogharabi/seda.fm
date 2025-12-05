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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AddReactionDto } from './dto/reaction.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(
    @Req() req: AuthRequest,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomsService.createRoom(req.user.id, createRoomDto);
  }

  @Get()
  async getAllRooms(@Req() req: AuthRequest) {
    return this.roomsService.getAllRooms(req.user.id);
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.roomsService.getRoomById(id, req.user.id);
  }

  @Put(':id')
  async updateRoom(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.updateRoom(id, req.user.id, updateRoomDto);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.roomsService.deleteRoom(id, req.user.id);
  }

  @Post(':id/join')
  async joinRoom(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.roomsService.joinRoom(id, req.user.id);
  }

  @Post(':id/leave')
  async leaveRoom(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.roomsService.leaveRoom(id, req.user.id);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.roomsService.sendMessage(id, req.user.id, sendMessageDto);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Query() getMessagesDto: GetMessagesDto,
  ) {
    return this.roomsService.getMessages(
      id,
      req.user.id,
      getMessagesDto.cursor,
      getMessagesDto.limit,
    );
  }

  // Message reactions
  @Post(':roomId/messages/:messageId/reactions')
  async addReaction(
    @Param('messageId') messageId: string,
    @Req() req: AuthRequest,
    @Body() addReactionDto: AddReactionDto,
  ) {
    return this.roomsService.addReaction(
      messageId,
      req.user.id,
      addReactionDto.emoji,
    );
  }

  @Delete(':roomId/messages/:messageId/reactions/:emoji')
  async removeReaction(
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
    @Req() req: AuthRequest,
  ) {
    return this.roomsService.removeReaction(messageId, req.user.id, emoji);
  }

  // Message edit/delete
  @Put(':roomId/messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Req() req: AuthRequest,
    @Body() editMessageDto: EditMessageDto,
  ) {
    return this.roomsService.editMessage(
      messageId,
      req.user.id,
      editMessageDto.content,
    );
  }

  @Delete(':roomId/messages/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Req() req: AuthRequest,
  ) {
    return this.roomsService.deleteMessage(messageId, req.user.id);
  }
}
