import { Injectable, BadRequestException, UnauthorizedException, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { SendGridService } from '../../config/sendgrid.service';
import { SupabaseService } from '../../config/supabase.service';
import { randomBytes, randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwtSecret: string;

  constructor(
    private prisma: PrismaService,
    private sendGridService: SendGridService,
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'super-secret-jwt-token-with-at-least-32-characters-long';
  }

  /**
   * Generate Supabase-compatible JWT tokens for a user
   */
  private generateSupabaseSession(supabaseId: string, email: string, userMetadata: any = {}): { access_token: string; refresh_token: string; expires_in: number; expires_at: number } {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour
    const expiresAt = now + expiresIn;

    // Create access token with Supabase-compatible claims
    const accessTokenPayload = {
      aud: 'authenticated',
      exp: expiresAt,
      iat: now,
      iss: this.configService.get<string>('SUPABASE_URL') || 'http://127.0.0.1:54321',
      sub: supabaseId,
      email: email,
      phone: '',
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: userMetadata,
      role: 'authenticated',
      aal: 'aal1',
      amr: [{ method: 'password', timestamp: now }],
      session_id: randomUUID(),
    };

    const accessToken = jwt.sign(accessTokenPayload, this.jwtSecret, { algorithm: 'HS256' });

    // Create refresh token (simpler payload)
    const refreshTokenPayload = {
      iat: now,
      exp: now + 604800, // 7 days
      session_id: accessTokenPayload.session_id,
      sub: supabaseId,
    };

    const refreshToken = jwt.sign(refreshTokenPayload, this.jwtSecret, { algorithm: 'HS256' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      expires_at: expiresAt,
    };
  }

  async sendVerificationEmail(userId: string, userType: 'fan' | 'artist'): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const username = user.profile?.username || user.email.split('@')[0];
    await this.sendVerificationEmailInternal(userId, user.email, username, userType);
  }

  // Internal method to send verification email (used by signup when we already have user data)
  private async sendVerificationEmailInternal(
    userId: string,
    email: string,
    username: string,
    userType: 'fan' | 'artist',
  ): Promise<void> {
    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Update user with verification token
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: expiresAt,
        userType,
      },
    });

    // Send email
    await this.sendGridService.sendVerificationEmail(
      email,
      username,
      verificationToken,
      userType,
    );
  }

  async verifyEmail(token: string): Promise<{ userType: string; userId: string; session?: any }> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
      include: { profile: true, artistProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Verification token has expired');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const userType = user.userType || 'fan';
    const emailPrefix = user.email.split('@')[0];

    // Use a transaction to ensure all records are created atomically
    await this.prisma.$transaction(async (tx) => {
      // Mark email as verified
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
        },
      });

      // Create Profile if it doesn't exist
      if (!user.profile) {
        // Generate a unique username from email prefix
        let baseUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (baseUsername.length < 3) {
          baseUsername = baseUsername + 'user';
        }

        // Check if username exists and append numbers if needed
        let username = baseUsername;
        let counter = 1;
        while (await tx.profile.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        await tx.profile.create({
          data: {
            userId: user.id,
            username,
            displayName: emailPrefix,
          },
        });
      }

      // Create ArtistProfile if user is an artist and doesn't have one
      if (userType === 'artist' && !user.artistProfile) {
        await tx.artistProfile.create({
          data: {
            userId: user.id,
            artistName: emailPrefix,
            verified: false,
          },
        });
      }
    });

    // Generate a session for the user using Supabase Admin API
    let session = null;
    this.logger.log(`Attempting to generate session for user: ${user.email}`);

    if (user.supabaseId) {
      try {
        this.logger.log('Creating Supabase session via Admin API...');

        // Use the admin client to generate a magic link and then verify it
        // This creates a real Supabase session
        const { data: linkData, error: linkError } = await this.supabase.getAdminClient().auth.admin.generateLink({
          type: 'magiclink',
          email: user.email,
        });

        if (linkError) {
          this.logger.error('Failed to generate magic link', { error: linkError.message });
        } else if (linkData?.properties?.hashed_token) {
          this.logger.log('Magic link generated, verifying OTP...');

          // Extract the token from the magic link and verify it
          const { data: sessionData, error: verifyError } = await this.supabase.getAdminClient().auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: 'magiclink',
          });

          if (verifyError) {
            this.logger.error('Failed to verify OTP', { error: verifyError.message });
          } else if (sessionData?.session) {
            this.logger.log('Session created successfully');
            session = {
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
              expires_in: sessionData.session.expires_in,
              expires_at: sessionData.session.expires_at,
            };
          } else {
            this.logger.warn('No session returned from verifyOtp');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error('Failed to create session', { error: errorMessage });
      }
    } else {
      this.logger.warn('No supabaseId found for user, skipping session generation');
    }

    return {
      userType,
      userId: user.id,
      session,
    };
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const userType = (user.userType as 'fan' | 'artist') || 'fan';
    await this.sendVerificationEmail(userId, userType);
  }

  async signup(email: string, password: string, username?: string, userType?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Check if user already exists in our database first
      const existingUser = await this.prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        this.logger.warn(`Signup attempt with existing email: ${normalizedEmail}`);
        throw new ConflictException('An account with this email already exists');
      }

      // Create user in Supabase Auth
      const { data, error } = await this.supabase.getAdminClient().auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true, // Auto-confirm email for development
        user_metadata: {
          username,
          userType: userType || 'fan',
        },
      });

      if (error) {
        // Check for duplicate email error from Supabase
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('already') || errorMessage.includes('exists') || errorMessage.includes('duplicate')) {
          this.logger.warn(`Supabase duplicate email error: ${normalizedEmail}`);
          throw new ConflictException('An account with this email already exists');
        }
        this.logger.error('Supabase user creation failed', { error: error.message, email: normalizedEmail });
        throw new BadRequestException(error.message);
      }

      if (!data.user) {
        this.logger.error('Supabase returned no user data', { email: normalizedEmail });
        throw new InternalServerErrorException('Failed to create user account');
      }

      // Create User record in our database
      const user = await this.prisma.user.create({
        data: {
          email: data.user.email!,
          supabaseId: data.user.id,
          emailVerified: false,
          userType: userType || 'fan',
        },
      });

      // Create Profile (always - using provided username or generating from email)
      const emailPrefix = email.split('@')[0];
      let canonicalUsername: string;
      let displayName: string;

      if (username) {
        // Canonicalize username: trim and lowercase for consistency
        canonicalUsername = username.trim().toLowerCase();
        displayName = username; // Keep original case for display

        // Check if username is already taken (case-insensitive)
        const existingUsername = await this.prisma.profile.findFirst({
          where: { username: canonicalUsername },
        });

        if (existingUsername) {
          throw new BadRequestException('Username already taken');
        }
      } else {
        // Generate username from email prefix
        let baseUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (baseUsername.length < 3) {
          baseUsername = baseUsername + 'user';
        }

        // Check if username exists and append numbers if needed
        canonicalUsername = baseUsername;
        let counter = 1;
        while (await this.prisma.profile.findUnique({ where: { username: canonicalUsername } })) {
          canonicalUsername = `${baseUsername}${counter}`;
          counter++;
        }
        displayName = emailPrefix;
      }

      await this.prisma.profile.create({
        data: {
          userId: user.id,
          username: canonicalUsername,
          displayName,
        },
      });

      // Create ArtistProfile if user is an artist
      if (userType === 'artist') {
        await this.prisma.artistProfile.create({
          data: {
            userId: user.id,
            artistName: displayName,
            verified: false,
          },
        });
      }

      // Send verification email automatically
      const verificationUserType = (userType as 'fan' | 'artist') || 'fan';
      await this.sendVerificationEmailInternal(user.id, user.email, canonicalUsername, verificationUserType);

      // Return user info with emailVerified status
      return {
        user: data.user,
        session: null,
        userId: user.id,
        emailVerified: false,
        requiresVerification: true,
      };
    } catch (error) {
      // Re-throw known HTTP exceptions
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Signup failed unexpectedly', { error: errorMessage, email: normalizedEmail });
      throw new InternalServerErrorException('Failed to create account. Please try again.');
    }
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        this.logger.warn(`Login failed for ${normalizedEmail}: ${error.message}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      this.logger.log(`User logged in: ${normalizedEmail}`);
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Login failed unexpectedly', { error: errorMessage, email: normalizedEmail });
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async logout(accessToken: string) {
    try {
      await this.supabase.getClient().auth.admin.signOut(accessToken);
      this.logger.log('User logged out successfully');
      return { message: 'Logged out successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Logout failed', { error: errorMessage });
      throw new BadRequestException('Logout failed. Please try again.');
    }
  }
}
