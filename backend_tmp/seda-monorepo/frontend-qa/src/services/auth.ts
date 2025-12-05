// Authentication Service for sedā.fm
import { createClient } from '@supabase/supabase-js';

// Real Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  userType: 'fan' | 'artist';
  avatar?: string;
  djPoints: number;
  badges: string[];
  connectedServices: string[];
  joinedDate: string;
  genres: string[];
  verified?: boolean;
  bio?: string;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

class AuthService {
  // Sign up with email
  async signUpWithEmail(email: string, password: string, username: string, userType: 'fan' | 'artist' = 'fan'): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            userType,
            djPoints: 0,
            badges: [],
            connectedServices: ['Email'],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            genres: []
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username,
          userType: data.user.user_metadata.userType,
          djPoints: data.user.user_metadata.djPoints,
          badges: data.user.user_metadata.badges,
          connectedServices: data.user.user_metadata.connectedServices,
          avatar: data.user.user_metadata.avatar,
          joinedDate: data.user.created_at,
          genres: data.user.user_metadata.genres,
          verified: data.user.user_metadata.verified || false
        };

        return { user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Sign in with email
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username || email.split('@')[0],
          userType: data.user.user_metadata.userType || 'fan',
          djPoints: data.user.user_metadata.djPoints || 0,
          badges: data.user.user_metadata.badges || [],
          connectedServices: data.user.user_metadata.connectedServices || ['Email'],
          avatar: data.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
          joinedDate: data.user.created_at,
          genres: data.user.user_metadata.genres || [],
          verified: data.user.user_metadata.verified || false
        };

        return { user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Sign in with OAuth provider
  async signInWithProvider(provider: 'spotify' | 'google' | 'apple'): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
      throw error;
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username || session.user.email!.split('@')[0],
          userType: session.user.user_metadata.userType || 'fan',
          djPoints: session.user.user_metadata.djPoints || 0,
          badges: session.user.user_metadata.badges || [],
          connectedServices: session.user.user_metadata.connectedServices || ['Email'],
          avatar: session.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          joinedDate: session.user.created_at,
          genres: session.user.user_metadata.genres || [],
          verified: session.user.user_metadata.verified || false
        };

        return user;
      }

      return null;
    } catch (error) {
      console.error('Session error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username,
          userType: data.user.user_metadata.userType,
          djPoints: data.user.user_metadata.djPoints,
          badges: data.user.user_metadata.badges,
          connectedServices: data.user.user_metadata.connectedServices,
          avatar: data.user.user_metadata.avatar,
          joinedDate: data.user.created_at,
          genres: data.user.user_metadata.genres,
          verified: data.user.user_metadata.verified || false,
          bio: data.user.user_metadata.bio
        };

        return { user, error: null };
      }

      return { user: null, error: new Error('No user returned from update') };
    } catch (error) {
      console.error('Update profile error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }

  // Set up auth state listener
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getSession();
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Request artist verification - now connects to real backend
  async requestArtistVerification(artistData: {
    artistName: string;
    bio: string;
    genres: string[];
    socialLinks?: string[];
  }): Promise<{ claimCode?: string; error?: Error }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { error: new Error('Not authenticated') };
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/artist/verification/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(artistData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification request failed');
      }

      const result = await response.json();
      return { claimCode: result.claimCode };
    } catch (error) {
      console.error('Verification request error:', error);
      return { error: error as Error };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();