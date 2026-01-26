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
import { Public } from '../../common/decorators/public.decorator';
import { SessionsService } from './sessions.service';
import { QueueService } from './queue.service';
import { VotesService } from './votes.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { VoteDto } from './dto/vote.dto';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly queueService: QueueService,
    private readonly votesService: VotesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new DJ session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Room already has active session' })
  async createSession(@Request() req: any, @Body() dto: CreateSessionDto) {
    const userId = req.user.id;
    return this.sessionsService.create(
      userId,
      dto.genre,
      dto.roomId,
      dto.sessionName,
      dto.isPrivate,
      dto.initialTrack,
      dto.tags
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active DJ sessions' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved successfully' })
  async getActiveSessions(@Query('limit') limit: number = 20) {
    return this.sessionsService.getActive(limit);
  }

  @Get('recent/ended')
  @ApiOperation({ summary: 'Get recently ended DJ sessions' })
  @ApiResponse({ status: 200, description: 'Recently ended sessions retrieved successfully' })
  async getRecentlyEndedSessions(@Query('limit') limit: number = 10) {
    return this.sessionsService.getRecentlyEnded(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details with queue' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(@Param('id') id: string) {
    return this.sessionsService.getById(id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a session (adds to room membership)' })
  @ApiResponse({ status: 200, description: 'Joined session successfully' })
  async joinSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.join(sessionId, userId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a session' })
  @ApiResponse({ status: 200, description: 'Left session successfully' })
  async leaveSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.leave(sessionId, userId);
  }

  @Post(':id/queue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add track to session queue' })
  @ApiResponse({ status: 201, description: 'Track added to queue successfully' })
  async addToQueue(
    @Param('id') sessionId: string,
    @Request() req: any,
    @Body() dto: AddToQueueDto,
  ) {
    const userId = req.user.id;
    return this.queueService.addTrack(sessionId, userId, dto.trackRef);
  }

  @Get(':id/queue')
  @ApiOperation({ summary: 'Get session queue with votes' })
  @ApiResponse({ status: 200, description: 'Queue retrieved successfully' })
  async getQueue(@Param('id') sessionId: string) {
    return this.queueService.getQueue(sessionId);
  }

  @Post(':id/queue/:queueItemId/vote')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vote on queued track' })
  @ApiResponse({ status: 201, description: 'Vote recorded successfully' })
  async vote(
    @Param('id') sessionId: string,
    @Param('queueItemId') queueItemId: string,
    @Request() req: any,
    @Body() dto: VoteDto,
  ) {
    const userId = req.user.id;
    return this.votesService.vote(userId, queueItemId, dto.voteType);
  }

  @Post(':id/skip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Skip current track (manual or auto by votes)' })
  @ApiResponse({ status: 200, description: 'Track skipped successfully' })
  async skipTrack(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.skipTrack(sessionId, userId);
  }

  @Patch(':id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End the session (host only)' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  @ApiResponse({ status: 403, description: 'Only host can end session' })
  async endSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.sessionsService.end(sessionId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a session (host only)' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only host can delete session' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.id;
    await this.sessionsService.delete(sessionId, userId);
  }
}
