import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseAnonKey = this.configService.get<string>('supabase.anonKey');
    const supabaseServiceKey = this.configService.get<string>('supabase.serviceKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      this.supabaseAdmin = this.supabase;
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  async verifyToken(token: string) {
    try {
      // Validate token format
      if (!token || typeof token !== 'string' || token.length < 10) {
        throw new Error('Invalid token format');
      }

      // Remove any potential extra whitespace
      const cleanToken = token.trim();

      // Verify token with Supabase
      const { data, error } = await this.supabaseAdmin.auth.getUser(cleanToken);

      if (error) {
        throw error;
      }

      if (!data.user || !data.user.email) {
        throw new Error('Invalid user data in token');
      }

      // Check if user account is confirmed (email verification)
      if (!data.user.email_confirmed_at) {
        throw new Error('User email not verified');
      }

      return data.user;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
}
