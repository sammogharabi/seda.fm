/**
 * Legacy useAuth hook - now wraps the new AuthContext
 * This file maintains backward compatibility with existing code
 * that imports from hooks/useAuth instead of contexts/AuthContext
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { progressionService } from '../utils/progressionService';
import { useAuth as useSupabaseAuth } from '../contexts/AuthContext';
import { http } from '../lib/api/http';

export interface User {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  verificationStatus: string;
  points: number;
  accentColor: string;
  bio: string;
  location: string;
  joinedDate: Date;
  genres: string[];
  connectedServices: string[];
  isArtist: boolean;
  userType: 'fan' | 'artist';
  website: string;
}

export interface AuthHook {
  // Auth State
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  showAuthModal: boolean;
  showLoginPage: boolean;
  showMainApp: boolean;
  initializationComplete: boolean;
  emailVerified: boolean;
  pendingVerificationEmail: string | null;

  // Auth Actions
  setShowAuthModal: (show: boolean) => void;
  setShowLoginPage: (show: boolean) => void;
  setShowMainApp: (show: boolean) => void;
  handleDemoLogin: (userData?: Partial<User>) => void;
  handleLogout: () => void;
  handleUpdateUser: (updatedUser: User) => void;
  setCurrentUser: (user: User | null) => void;
  switchUser: (newUser: User) => void;
  initApp: () => Promise<void>;
  setEmailVerified: (verified: boolean) => void;
  setPendingVerificationEmail: (email: string | null) => void;
}

export const useAuth = (): AuthHook => {
  const { user: supabaseUser, session, loading: supabaseLoading, signOut } = useSupabaseAuth();
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showMainApp, setShowMainApp] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true); // Default to true for demo users
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Check email verification status from our backend
  const checkEmailVerification = useCallback(async (): Promise<boolean> => {
    try {
      const response = await http.get('/profiles/me/profile', { auth: true });
      // The profile endpoint returns emailVerified status
      return response?.emailVerified === true;
    } catch (error: any) {
      // 404 means profile doesn't exist yet (user needs to complete onboarding)
      // This is expected for new signups, not an error
      if (error?.status === 404 || error?.message?.includes('not found') || error?.message?.includes('Resource not found')) {
        console.log('Profile not found - user needs to complete onboarding');
        return true; // Allow user to proceed to onboarding
      }
      console.error('Failed to check email verification status:', error);
      // If we can't check, assume verified to avoid blocking users
      return true;
    }
  }, []);

  // Sync Supabase user with local state
  useEffect(() => {
    const syncUser = async () => {
      if (supabaseUser && session) {
        // Check email verification status from our backend
        const isEmailVerified = await checkEmailVerification();
        setEmailVerified(isEmailVerified);

        const user: User = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
          displayName: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          verified: isEmailVerified,
          verificationStatus: isEmailVerified ? 'verified' : 'pending',
          points: 0,
          accentColor: supabaseUser.user_metadata?.userType === 'artist' ? 'coral' : 'blue',
          bio: '',
          location: '',
          joinedDate: new Date(supabaseUser.created_at),
          genres: [],
          connectedServices: ['Supabase'],
          isArtist: supabaseUser.user_metadata?.userType === 'artist',
          userType: supabaseUser.user_metadata?.userType || 'fan',
          website: ''
        };

        setCurrentUser(user);
        setIsAuthenticated(true);

        // Only show main app if email is verified
        if (isEmailVerified) {
          setShowMainApp(true);
          setShowLoginPage(false);
          setPendingVerificationEmail(null);
        } else {
          // Keep showing login page for verification
          setShowMainApp(false);
          setShowLoginPage(true);
          setPendingVerificationEmail(supabaseUser.email || null);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setShowMainApp(false);
        setShowLoginPage(true);
        setEmailVerified(true);
        setPendingVerificationEmail(null);
      }
      setIsLoading(supabaseLoading);
    };

    syncUser();
  }, [supabaseUser, session, supabaseLoading, checkEmailVerification]);

  const handleDemoLogin = useCallback((userData: Partial<User> = {}) => {
    const demoUser: User = {
      id: 'demo-user-1',
      username: 'music_lover',
      displayName: 'Music Lover',
      verified: false,
      verificationStatus: 'not-requested',
      points: 1247,
      accentColor: 'coral',
      bio: 'Underground music enthusiast • Vinyl collector • Live music addict',
      location: 'Brooklyn, NY',
      joinedDate: new Date('2024-01-15'),
      genres: ['Hip Hop', 'Electronic', 'Jazz'],
      connectedServices: ['Spotify', 'Apple Music'],
      isArtist: false,
      userType: 'fan',
      website: '',
      followers: ['fan-2'],
      following: ['artist-1', 'fan-1'],
      ...userData
    };

    // Initialize progression for the user
    const progression = progressionService.getProgression(demoUser.id);
    
    // Ensure user points match progression (for backwards compatibility)
    if (progression.totalXP !== demoUser.points) {
      demoUser.points = progression.totalXP;
    }
    
    setCurrentUser(demoUser);
    setIsAuthenticated(true);
    setShowMainApp(true);
    setShowAuthModal(false);
    setShowLoginPage(false);
    
    // Store demo session
    localStorage.setItem('seda_demo_user', JSON.stringify(demoUser));
    
    // Show helpful tips after login
    setTimeout(() => {
      toast.success('Welcome to sedā.fm!', {
        description: 'Press Cmd/Ctrl + K to search artists, tracks, users, and rooms anytime.',
        duration: 6000
      });
    }, 1000);
  }, []);

  const handleLogout = useCallback(async () => {
    console.log('🚪 LOGOUT INITIATED');

    try {
      // Sign out from Supabase
      await signOut();

      // Clear user state
      setCurrentUser(null);
      setIsAuthenticated(false);
      setShowMainApp(false);
      setShowLoginPage(true);

      // Clear demo session (for backward compatibility)
      localStorage.removeItem('seda_demo_user');

      console.log('🚪 LOGOUT COMPLETED');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  }, [signOut]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    // Sync user points with progression system
    const progression = progressionService.getProgression(updatedUser.id);
    updatedUser.points = progression.totalXP;
    
    setCurrentUser(updatedUser);
    // Update localStorage as well
    localStorage.setItem('seda_demo_user', JSON.stringify(updatedUser));
  }, []);

  const switchUser = useCallback((newUser: User) => {
    console.log('🔄 SWITCHING USER:', { from: currentUser?.id, to: newUser.id, userType: newUser.userType });
    
    // Clear any existing state
    localStorage.removeItem('seda_demo_user');
    
    // Ensure the user has all required fields
    const completeUser: User = {
      ...newUser,
      // Ensure required fields exist
      userType: newUser.userType || (newUser.isArtist ? 'artist' : 'fan'),
      followers: newUser.followers || [],
      following: newUser.following || [],
      verificationStatus: newUser.verificationStatus || 'not-requested'
    };
    
    // Set the new user
    setCurrentUser(completeUser);
    setIsAuthenticated(true);
    setShowMainApp(true);
    setShowLoginPage(false);
    
    // Store the new user session
    localStorage.setItem('seda_demo_user', JSON.stringify(completeUser));
    
    console.log('✅ USER SWITCH COMPLETED:', completeUser);
    
    // Show feedback
    toast.success(`Switched to ${completeUser.userType} experience`, {
      description: `Now viewing as ${completeUser.displayName}`,
      duration: 3000
    });
  }, [currentUser]);

  const initApp = useCallback(async () => {
    try {
      console.log('🚀 INIT APP STARTED');
      setIsLoading(true);
      
      // Apply dark theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#0a0a0a';
        document.body.style.color = '#fafafa';
        
        // Add viewport meta tag for PWA
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
          document.head.appendChild(meta);
        }
        
        // Add theme color meta tags for dark mode
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
          const meta = document.createElement('meta');
          meta.name = 'theme-color';
          meta.content = '#0a0a0a';
          document.head.appendChild(meta);
        } else {
          themeColorMeta.setAttribute('content', '#0a0a0a');
        }
        
        // Add apple mobile web app meta tags
        const appleMobileWebAppCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (!appleMobileWebAppCapable) {
          const meta = document.createElement('meta');
          meta.name = 'apple-mobile-web-app-capable';
          meta.content = 'yes';
          document.head.appendChild(meta);
        }
        
        const appleMobileWebAppStatusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!appleMobileWebAppStatusBarStyle) {
          const meta = document.createElement('meta');
          meta.name = 'apple-mobile-web-app-status-bar-style';
          meta.content = 'black-translucent';
          document.head.appendChild(meta);
        } else {
          appleMobileWebAppStatusBarStyle.setAttribute('content', 'black-translucent');
        }

        // Update page title
        document.title = 'sedā.fm - Music Community for Artists & Fans';
      }

      // Small delay to ensure state is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check for demo user session
      const demoUser = localStorage.getItem('seda_demo_user');
      console.log('🔍 Checking localStorage for demo user:', !!demoUser);
      
      if (demoUser) {
        try {
          const user = JSON.parse(demoUser);
          // Ensure user has points property for backwards compatibility
          if (!user.points && user.djPoints) {
            user.points = user.djPoints;
            delete user.djPoints;
          } else if (!user.points) {
            user.points = 0;
          }
          console.log('✅ Found existing user, setting authenticated state');
          
          // Set states in correct order
          setCurrentUser(user);
          setIsAuthenticated(true);
          setShowLoginPage(false);
          setShowMainApp(true);
          
        } catch (parseError) {
          console.error('❌ Error parsing stored user data:', parseError);
          // Clear invalid data and show login
          localStorage.removeItem('seda_demo_user');
          setCurrentUser(null);
          setIsAuthenticated(false);
          setShowMainApp(false);
          setShowLoginPage(true);
        }
      } else {
        // Show login page by default for new users
        console.log('👤 No existing user found, showing login page');
        setCurrentUser(null);
        setIsAuthenticated(false);
        setShowMainApp(false);
        setShowLoginPage(true);
      }
      
      setInitializationComplete(true);
      console.log('🚀 INIT APP COMPLETED');
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Fallback to login page on any error
      setShowLoginPage(true);
      setShowMainApp(false);
      setInitializationComplete(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize app on mount
  useEffect(() => {
    initApp();
  }, [initApp]);

  return {
    // Auth State
    isAuthenticated,
    currentUser,
    isLoading,
    showAuthModal,
    showLoginPage,
    showMainApp,
    initializationComplete,
    emailVerified,
    pendingVerificationEmail,

    // Auth Actions
    setShowAuthModal,
    setShowLoginPage,
    setShowMainApp,
    handleDemoLogin,
    handleLogout,
    handleUpdateUser,
    setCurrentUser,
    switchUser,
    initApp,
    setEmailVerified,
    setPendingVerificationEmail,
  };
};