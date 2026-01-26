import {
  Controller,
  Get,
  Post,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ProgressionService } from './progression.service';

@ApiTags('progression')
@Controller('progression')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user progression stats' })
  @ApiResponse({ status: 200, description: 'Progression retrieved successfully' })
  async getMyProgression(@Request() req: any) {
    const userId = req.user.id;
    return this.progressionService.getOrCreate(userId);
  }

  @Get('users/:username')
  @ApiOperation({ summary: 'Get user progression by username' })
  @ApiResponse({ status: 200, description: 'Progression retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProgression(@Param('username') username: string) {
    return this.progressionService.getByUsername(username);
  }

  @Post('daily-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record daily login for streak' })
  @ApiResponse({ status: 200, description: 'Daily login recorded successfully' })
  async recordDailyLogin(@Request() req: any) {
    const userId = req.user.id;
    return this.progressionService.recordDailyLogin(userId);
  }
}
