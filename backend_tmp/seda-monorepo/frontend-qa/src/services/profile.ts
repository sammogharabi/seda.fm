import { supabase } from './auth';

export interface OnboardingStatus {
  genresCompleted: boolean;
  genresCompletedAt: string | null;
  shouldShowGenresStep: boolean;
}

export interface UpdateGenresResponse {
  profile: any;
  isFirstTimeCompletion: boolean;
  statusCode: number;
}

class ProfileService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      apiUrl,
    };
  }

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    // Check for auth bypass mode (sandbox UAT testing)
    const urlParams = new URLSearchParams(window.location.search);
    const bypassAuth = urlParams.get('bypass_auth') === 'true';

    if (bypassAuth) {
      console.log('🚀 [DEBUG] ProfileService: Auth bypass mode - using sandbox UAT onboarding status');
      // For auth bypass, check different localStorage key to avoid conflicts
      const genresCompleted = localStorage.getItem('seda_sandbox_genres_completed') === 'true';
      const genresCompletedAt = localStorage.getItem('seda_sandbox_genres_completed_at');

      const result = {
        genresCompleted,
        genresCompletedAt,
        shouldShowGenresStep: !genresCompleted,
      };

      console.log('🔍 [DEBUG] ProfileService: Sandbox onboarding status:', result);
      return result;
    }

    // TEMPORARY: Return mock data for development/testing
    // Check localStorage for completed onboarding
    console.log('🔍 [DEBUG] ProfileService: Checking localStorage...');
    const genresCompleted = localStorage.getItem('seda_genres_completed') === 'true';
    const genresCompletedAt = localStorage.getItem('seda_genres_completed_at');
    console.log('🔍 [DEBUG] ProfileService: genresCompleted from localStorage:', genresCompleted);
    console.log('🔍 [DEBUG] ProfileService: genresCompletedAt from localStorage:', genresCompletedAt);

    const result = {
      genresCompleted,
      genresCompletedAt,
      shouldShowGenresStep: !genresCompleted,
    };

    console.log('🔍 [DEBUG] ProfileService: Returning onboarding status:', result);
    return result;

    /* ORIGINAL API CODE - uncomment when backend is available
    try {
      const { apiUrl, ...headers } = await this.getAuthHeaders();

      const response = await fetch(`${apiUrl}/profiles/me/onboarding-status`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get onboarding status: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      // Fallback: assume user needs to complete onboarding
      return {
        genresCompleted: false,
        genresCompletedAt: null,
        shouldShowGenresStep: true,
      };
    }
    */
  }

  async updateGenres(genres: string[]): Promise<UpdateGenresResponse> {
    // Check for auth bypass mode (sandbox UAT testing)
    const urlParams = new URLSearchParams(window.location.search);
    const bypassAuth = urlParams.get('bypass_auth') === 'true';

    if (bypassAuth) {
      console.log('🚀 [DEBUG] ProfileService: Auth bypass mode - saving sandbox UAT genres');
      const completedAt = new Date().toISOString();

      try {
        // Use sandbox-specific localStorage keys
        localStorage.setItem('seda_sandbox_genres_completed', 'true');
        localStorage.setItem('seda_sandbox_genres_completed_at', completedAt);
        localStorage.setItem('seda_sandbox_user_genres', JSON.stringify(genres));

        console.log('✅ [DEBUG] ProfileService: Successfully saved sandbox genres to localStorage');
        console.log('✅ [DEBUG] ProfileService: Verification - sandbox genresCompleted:', localStorage.getItem('seda_sandbox_genres_completed'));
      } catch (error) {
        console.error('❌ [DEBUG] ProfileService: Failed to save sandbox genres to localStorage:', error);
        throw error;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = {
        profile: { genres },
        isFirstTimeCompletion: true,
        statusCode: 200,
      };

      console.log('✅ [DEBUG] ProfileService: Returning sandbox update result:', result);
      return result;
    }

    // TEMPORARY: Store in localStorage for development/testing
    console.log('💾 [DEBUG] ProfileService: Saving genres to localStorage:', genres);
    const completedAt = new Date().toISOString();

    try {
      localStorage.setItem('seda_genres_completed', 'true');
      localStorage.setItem('seda_genres_completed_at', completedAt);
      localStorage.setItem('seda_user_genres', JSON.stringify(genres));

      console.log('✅ [DEBUG] ProfileService: Successfully saved to localStorage');
      console.log('✅ [DEBUG] ProfileService: Verification - genresCompleted:', localStorage.getItem('seda_genres_completed'));
    } catch (error) {
      console.error('❌ [DEBUG] ProfileService: Failed to save to localStorage:', error);
      throw error;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = {
      profile: { genres },
      isFirstTimeCompletion: true,
      statusCode: 200,
    };

    console.log('✅ [DEBUG] ProfileService: Returning update result:', result);
    return result;

    /* ORIGINAL API CODE - uncomment when backend is available
    const { apiUrl, ...headers } = await this.getAuthHeaders();

    const response = await fetch(`${apiUrl}/profiles/me/genres`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ genres }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update genres: ${response.statusText}`);
    }

    return response.json();
    */
  }

  // Utility function that components can use to check if onboarding should be shown
  async shouldShowGenresStep(): Promise<boolean> {
    try {
      const status = await this.getOnboardingStatus();
      return status.shouldShowGenresStep;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Err on the side of showing onboarding if we can't determine status
      return true;
    }
  }

  // DEVELOPMENT/TESTING: Reset onboarding to test the flow
  resetOnboarding(): void {
    // Check for auth bypass mode
    const urlParams = new URLSearchParams(window.location.search);
    const bypassAuth = urlParams.get('bypass_auth') === 'true';

    if (bypassAuth) {
      console.log('🔄 Resetting sandbox onboarding for UAT testing');
      localStorage.removeItem('seda_sandbox_genres_completed');
      localStorage.removeItem('seda_sandbox_genres_completed_at');
      localStorage.removeItem('seda_sandbox_user_genres');
      console.log('🔄 Sandbox onboarding reset - refresh page to test genre selection');
    } else {
      localStorage.removeItem('seda_genres_completed');
      localStorage.removeItem('seda_genres_completed_at');
      localStorage.removeItem('seda_user_genres');
      console.log('🔄 Onboarding reset - refresh page to test genre selection');
    }
  }
}

export const profileService = new ProfileService();

// DEVELOPMENT: Expose to window for testing
if (typeof window !== 'undefined') {
  (window as any).profileService = profileService;
}