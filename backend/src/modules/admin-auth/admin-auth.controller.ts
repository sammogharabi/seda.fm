import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { AdminRole } from '@prisma/client';

@ApiTags('admin-auth')
@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: AdminLoginDto, @Request() req: any) {
    const clientIp = req.ip || req.connection?.remoteAddress;
    return this.adminAuthService.login(dto, clientIp);
  }

  @Get('me')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin info' })
  @ApiResponse({ status: 200, description: 'Admin info retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req: any) {
    return this.adminAuthService.getMe(req.adminUser.sub);
  }

  @Post('create')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new admin (SUPER_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Admin created' })
  @ApiResponse({ status: 400, description: 'Only SUPER_ADMIN can create admins' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async createAdmin(@Body() dto: CreateAdminDto, @Request() req: any) {
    return this.adminAuthService.createAdmin(dto, req.adminUser.role as AdminRole);
  }

  @Get('admins')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all admins' })
  @ApiResponse({ status: 200, description: 'List of admins' })
  async listAdmins() {
    return this.adminAuthService.listAdmins();
  }
}
