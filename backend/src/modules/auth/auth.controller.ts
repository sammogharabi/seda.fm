import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user already exists',
  })
  async signup(@Body() dto: SignupDto) {
    const result = await this.authService.signup(
      dto.email,
      dto.password,
      dto.username,
      dto.userType,
    );
    return {
      message: 'Account created successfully. Please check your email to verify your account.',
      user: result.user,
      session: result.session,
      userId: result.userId,
      emailVerified: result.emailVerified,
      requiresVerification: result.requiresVerification,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return {
      message: 'Login successful',
      user: result.user,
      session: result.session,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('send-verification-email')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification email to current user' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified or user not found',
  })
  async sendVerificationEmail(
    @Request() req: any,
    @Body() body: { userType: 'fan' | 'artist' },
  ) {
    await this.authService.sendVerificationEmail(req.user.id, body.userType);
    return {
      message: 'Verification email sent successfully',
    };
  }

  @Get('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address using token (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        userType: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return {
      message: 'Email verified successfully',
      userType: result.userType,
      userId: result.userId,
      session: result.session,
    };
  }

  @Post('resend-verification-email')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
  })
  async resendVerificationEmail(@Request() req: any) {
    await this.authService.resendVerificationEmail(req.user.id);
    return {
      message: 'Verification email resent successfully',
    };
  }
}
