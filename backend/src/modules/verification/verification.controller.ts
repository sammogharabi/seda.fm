import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('verification')
@Controller('artist/verification')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request artist verification' })
  @ApiResponse({
    status: 200,
    description: 'Verification request created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or user already has pending verification',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  async requestVerification(@Request() req: any) {
    const userId = req.user.id;
    return this.verificationService.requestVerification(userId);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit verification with claim code placement' })
  @ApiResponse({
    status: 200,
    description: 'Verification submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid claim code or URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification request not found',
  })
  async submitVerification(@Request() req: any, @Body() dto: SubmitVerificationDto) {
    const userId = req.user.id;
    return this.verificationService.submitVerification(userId, dto);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get verification request status' })
  @ApiResponse({
    status: 200,
    description: 'Verification status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification request not found',
  })
  async getVerificationStatus(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.verificationService.getVerificationStatus(userId, id);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get all verification requests for current user' })
  @ApiResponse({
    status: 200,
    description: 'Verification requests retrieved successfully',
  })
  async getMyVerifications(@Request() req: any) {
    const userId = req.user.id;
    return this.verificationService.getUserVerifications(userId);
  }
}
