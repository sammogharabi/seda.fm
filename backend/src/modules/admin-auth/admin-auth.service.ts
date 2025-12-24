import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
  type: 'admin';
}

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secret =
      this.configService.get<string>('ADMIN_JWT_SECRET') ||
      this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('CRITICAL: JWT_SECRET or ADMIN_JWT_SECRET must be configured');
    }

    this.jwtSecret = secret;
    this.jwtExpiresIn = this.configService.get<string>('ADMIN_JWT_EXPIRES_IN') || '8h';
  }

  async login(dto: AdminLoginDto, clientIp?: string): Promise<{
    accessToken: string;
    admin: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
    };
  }> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const admin = await this.prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      this.logger.warn(`Admin login attempt with non-existent email: ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      this.logger.warn(`Admin login attempt for deactivated account: ${normalizedEmail}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Admin login failed - invalid password: ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login info
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp || null,
      },
    });

    const payload: AdminJwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    this.logger.log(`Admin logged in successfully: ${normalizedEmail}`);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async createAdmin(dto: CreateAdminDto, creatorRole?: AdminRole): Promise<{
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  }> {
    // Only SUPER_ADMIN can create other admins
    if (creatorRole && creatorRole !== AdminRole.SUPER_ADMIN) {
      throw new BadRequestException('Only SUPER_ADMIN can create new admin accounts');
    }

    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const admin = await this.prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: dto.name,
        role: dto.role || AdminRole.ADMIN,
      },
    });

    this.logger.log(`New admin created: ${normalizedEmail}`);

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  async getMe(adminId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    lastLoginAt: Date | null;
  }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return admin;
  }

  async verifyToken(token: string): Promise<AdminJwtPayload> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as AdminJwtPayload;

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify admin still exists and is active
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        select: { isActive: true },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Admin account not found or deactivated');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  async listAdmins(): Promise<
    Array<{
      id: string;
      email: string;
      name: string;
      role: AdminRole;
      isActive: boolean;
      lastLoginAt: Date | null;
      createdAt: Date;
    }>
  > {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
