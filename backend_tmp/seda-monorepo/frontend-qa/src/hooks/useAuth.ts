import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

// Mock user for auth bypass in sandbox environment
const MOCK_SANDBOX_USER = {
  id: 'mock-sandbox-user',
  email: 'sandbox.user@sedafm.test',
  user_metadata: {
    name: 'Sandbox User',
    avatar_url: null,
  },
  app_metadata: {
    provider: 'mock',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth bypass parameter for sandbox UAT testing
    const urlParams = new URLSearchParams(window.location.search);
    const bypassAuth = urlParams.get('bypass_auth') === 'true';

    console.log('🔍 [DEBUG] useAuth: Checking auth bypass parameter:', bypassAuth);

    if (bypassAuth) {
      console.log('🚀 [DEBUG] useAuth: Auth bypass enabled, using mock user for sandbox UAT');
      setUser(MOCK_SANDBOX_USER);
      setLoading(false);
      return;
    }

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('🔍 [DEBUG] useAuth: Checking Supabase session...');
        const currentUser = await authService.getSession();
        console.log('✅ [DEBUG] useAuth: Supabase session found:', !!currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('❌ [DEBUG] useAuth: Error checking session:', error);

        // Check if this is a Supabase service error (503, network issues, etc.)
        const isServiceError = error.message?.includes('503') ||
                              error.message?.includes('Service Unavailable') ||
                              error.message?.includes('Failed to fetch') ||
                              error.name === 'TypeError';

        if (isServiceError) {
          console.log('🚨 [DEBUG] useAuth: Supabase service appears to be down');
          console.log('💡 [DEBUG] useAuth: Add ?bypass_auth=true to URL for sandbox UAT testing');
        }

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes (skip if bypassing auth)
    let cleanup = () => {};
    if (!bypassAuth) {
      try {
        const { data: authListener } = authService.onAuthStateChange((user) => {
          console.log('🔄 [DEBUG] useAuth: Auth state changed:', !!user);
          setUser(user);
          setLoading(false);
        });

        cleanup = () => {
          authListener?.subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('❌ [DEBUG] useAuth: Failed to setup auth listener:', error);
      }
    }

    return cleanup;
  }, []);

  return { user, loading };
}