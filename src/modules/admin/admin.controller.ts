import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ApproveVerificationDto } from './dto/approve-verification.dto';
import { DenyVerificationDto } from './dto/deny-verification.dto';
import { VerificationStatus } from '@prisma/client';

@ApiTags('admin')
@Controller('admin/verification')
@UseGuards(AdminGuard)
@ApiSecurity('admin-key')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending verification requests' })
  @ApiQuery({ name: 'status', enum: VerificationStatus, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of pending verification requests',
  })
  async getPendingVerifications(
    @Query('status') status?: VerificationStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.adminService.getVerifications(status, limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed verification request' })
  @ApiResponse({
    status: 200,
    description: 'Detailed verification request',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification request not found',
  })
  async getVerificationDetails(@Param('id') id: string) {
    return this.adminService.getVerificationDetails(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification approved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification request not found',
  })
  async approveVerification(
    @Param('id') id: string,
    @Body() dto: ApproveVerificationDto,
    @Request() req: any,
  ) {
    return this.adminService.approveVerification(id, req.admin.id, dto.notes);
  }

  @Patch(':id/deny')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deny verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification denied successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification request not found',
  })
  async denyVerification(
    @Param('id') id: string,
    @Body() dto: DenyVerificationDto,
    @Request() req: any,
  ) {
    return this.adminService.denyVerification(id, req.admin.id, dto.reason);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get verification statistics' })
  @ApiResponse({
    status: 200,
    description: 'Verification statistics',
  })
  async getVerificationStats() {
    return this.adminService.getVerificationStats();
  }
}