import { useState, useEffect } from 'react';
import { profileService, OnboardingStatus } from '../services/profile';

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 [DEBUG] Checking onboarding status...');
      const newStatus = await profileService.getOnboardingStatus();
      console.log('🔍 [DEBUG] Onboarding status received:', newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error('❌ [DEBUG] Failed to check onboarding status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check onboarding status');
      // Fallback to showing onboarding on error
      setStatus({
        genresCompleted: false,
        genresCompletedAt: null,
        shouldShowGenresStep: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateGenres = async (genres: string[]) => {
    try {
      console.log('🎵 [DEBUG] Updating genres:', genres);
      const result = await profileService.updateGenres(genres);
      console.log('✅ [DEBUG] Genres update result:', result);

      // Update local status to reflect completion
      const newStatus = {
        genresCompleted: true,
        genresCompletedAt: new Date().toISOString(),
        shouldShowGenresStep: false,
      };

      console.log('🔄 [DEBUG] Setting new status:', newStatus);
      setStatus(prev => prev ? {
        ...prev,
        ...newStatus,
      } : newStatus);

      console.log('🎉 [DEBUG] Genres update completed successfully');
      return result;
    } catch (err) {
      console.error('❌ [DEBUG] Failed to update genres:', err);
      throw err;
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  return {
    status,
    isLoading,
    error,
    updateGenres,
    refetch: checkOnboardingStatus,
    shouldShowGenresStep: status?.shouldShowGenresStep || false,
  };
}