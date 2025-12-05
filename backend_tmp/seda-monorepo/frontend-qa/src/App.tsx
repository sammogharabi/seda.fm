import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { SocialFeed } from './components/SocialFeed';
import { DiscoverView } from './components/DiscoverView';
import { FollowingView } from './components/FollowingView';
import { ListeningView } from './components/ListeningView';
import { ChannelView } from './components/ChannelView';
import { UserProfile } from './components/UserProfile';
import { Leaderboards } from './components/Leaderboards';
import { Playlists } from './components/Playlists';
import { DJMode } from './components/DJMode';
import { NowPlaying } from './components/NowPlaying';
import { useIsMobile } from './components/ui/use-mobile';
import { MobileHeader } from './components/MobileHeader';
import { MobileNavigation } from './components/MobileNavigation';
import { CreatePostModal } from './components/CreatePostModal';
import { ComposeButton } from './components/ComposeButton';
import { DJNotificationSystem } from './components/DJNotificationSystem';
import { SearchModal } from './components/SearchModal';
import { PickGenres } from './components/onboarding/PickGenres';
import { useOnboarding } from './hooks/useOnboarding';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AboutPage } from './pages/about/AboutPage';
import { TestAboutPage } from './pages/TestAboutPage';
import { authService } from './services/auth';

function MainApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('feed');
  const [currentChannel, setCurrentChannel] = useState('#hiphop');
  const [isDJMode, setIsDJMode] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [djSessionConfig, setDJSessionConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNetwork, setHasNetwork] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const isMobile = useIsMobile();

  // Onboarding state
  const onboarding = useOnboarding();

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      setIsLoading(true);

      // Apply dark theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');

        // Add viewport meta tag for PWA
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
          document.head.appendChild(meta);
        }

        // Add theme color meta tags
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
          const meta = document.createElement('meta');
          meta.name = 'theme-color';
          meta.content = '#000000';
          document.head.appendChild(meta);
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
        }
      }

      // Check for existing user session from Supabase
      try {
        const user = await authService.getSession();
        setUser(user);
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    // Setup network status monitoring
    let cleanupNetwork = () => {};
    if (typeof navigator !== 'undefined') {
      setHasNetwork(navigator.onLine);

      const handleOnline = () => setHasNetwork(true);
      const handleOffline = () => setHasNetwork(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      cleanupNetwork = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    initApp();

    // Setup auth state listener
    const { data: authListener } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup function for useEffect
    return () => {
      cleanupNetwork();
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = useCallback((userData) => {
    try {
      setUser(userData);
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentView('feed');
      setCurrentChannel('#hiphop');
      setIsDJMode(false);
      setNowPlaying(null);
      setUserPosts([]);
      setShowCreatePost(false);
      setFollowingList([]);
      setFollowersList([]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel);
    setCurrentView('channel');
    // Exit DJ mode when switching channels
    if (isDJMode) {
      setIsDJMode(false);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Exit DJ mode when switching views
    if (isDJMode && view !== 'channel') {
      setIsDJMode(false);
    }
  };

  const handleStartDJ = (isJoiningSession = false, config = null) => {
    setIsDJMode(true);
    setIsJoiningSession(isJoiningSession);
    if (config) {
      // Store session config for use in DJMode
      setDJSessionConfig(config);
    }
  };

  const handleJoinSessionFromNotification = (session) => {
    // Switch to the session's channel and join
    setCurrentChannel(session.channel);
    setCurrentView('channel');
    handleStartDJ(true);
  };

  const handleToggleDJ = () => {
    setIsDJMode(!isDJMode);
  };

  const handleExitDJ = () => {
    setIsDJMode(false);
    setIsJoiningSession(false);
    setDJSessionConfig(null);
  };

  const handleNowPlaying = (track) => {
    setNowPlaying(track);
  };

  const handleCreatePost = (newPost) => {
    setUserPosts(prev => [newPost, ...prev]);
  };

  const handleComposeClick = useCallback(() => {
    setShowCreatePost(true);
  }, []);

  const handleSearch = useCallback(() => {
    setShowSearch(true);
  }, []);

  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const handleFollowUser = (userToFollow) => {
    setFollowingList(prev => {
      if (prev.find(u => u.id === userToFollow.id)) {
        return prev; // Already following
      }
      return [...prev, userToFollow];
    });
  };

  const handleUnfollowUser = (userId) => {
    setFollowingList(prev => prev.filter(u => u.id !== userId));
  };

  const isFollowing = (userId) => {
    return followingList.some(u => u.id === userId);
  };

  const handleGenresComplete = async (genres: string[]) => {
    try {
      await onboarding.updateGenres(genres);
      // Genres are now saved, user should proceed to main app
    } catch (error) {
      console.error('Failed to save genres:', error);
      throw error; // Re-throw so PickGenres can handle the error
    }
  };

  const renderMainContent = () => {
    if (isDJMode) {
      return (
        <DJMode 
          user={user}
          channel={currentChannel}
          onExit={handleExitDJ}
          onNowPlaying={handleNowPlaying}
          isJoiningSession={isJoiningSession}
          sessionConfig={djSessionConfig}
        />
      );
    }

    switch (currentView) {
      case 'feed':
        return (
          <SocialFeed 
            user={user}
            onNowPlaying={handleNowPlaying}
            onStartDJ={handleStartDJ}
            posts={userPosts}
            onFollowUser={handleFollowUser}
            onUnfollowUser={handleUnfollowUser}
            isFollowing={isFollowing}
          />
        );
      case 'discover':
        return (
          <DiscoverView 
            user={user}
            onNowPlaying={handleNowPlaying}
            onFollowUser={handleFollowUser}
            onUnfollowUser={handleUnfollowUser}
            isFollowing={isFollowing}
            followingList={followingList}
          />
        );
      case 'following':
        return (
          <FollowingView 
            user={user} 
            followingList={followingList}
            onFollowUser={handleFollowUser}
            onUnfollowUser={handleUnfollowUser}
          />
        );
      case 'listening':
        return (
          <ListeningView 
            user={user}
            onNowPlaying={handleNowPlaying}
            onStartDJ={handleStartDJ}
          />
        );
      case 'channel':
        return (
          <ChannelView 
            channel={currentChannel}
            user={user}
            onStartDJ={handleStartDJ}
            onNowPlaying={handleNowPlaying}
          />
        );
      case 'profile':
        return <UserProfile user={user} onUpdateUser={handleUpdateUser} />;
      case 'leaderboards':
        return <Leaderboards user={user} />;
      case 'playlists':
        return <Playlists user={user} />;
      default:
        return (
          <SocialFeed 
            user={user}
            onNowPlaying={handleNowPlaying}
            onStartDJ={handleStartDJ}
          />
        );
    }
  };

  // Show loading screen
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-primary to-ring rounded-xl flex items-center justify-center shadow-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-primary-foreground font-medium text-2xl">S</span>
            </motion.div>
            <h1 className="text-4xl text-foreground font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              sedā.fm
            </h1>
          </motion.div>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading your music community...
          </motion.p>
        </motion.div>
        <Toaster />
      </div>
    );
  }

  // Show onboarding if user exists but hasn't completed genres selection
  console.log('🎯 [DEBUG] App.tsx render check:', {
    user: !!user,
    onboardingLoading: onboarding.isLoading,
    shouldShowGenresStep: onboarding.shouldShowGenresStep,
    onboardingStatus: onboarding.status
  });

  if (user && !onboarding.isLoading && onboarding.shouldShowGenresStep) {
    console.log('🎵 [DEBUG] App.tsx: Showing PickGenres component');
    return <PickGenres onComplete={handleGenresComplete} isLoading={onboarding.isLoading} />;
  }

  if (user && !onboarding.isLoading && !onboarding.shouldShowGenresStep) {
    console.log('🎉 [DEBUG] App.tsx: Genres completed, showing main app');
  }

  return (
    <>
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          user={user}
          currentChannel={currentChannel}
          currentView={currentView}
          onChannelSelect={handleChannelSelect}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          isDJMode={isDJMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onComposeClick={handleComposeClick}
        />
      )}

      {/* Main App Layout */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            user={user}
            currentChannel={currentChannel}
            currentView={currentView}
            onChannelSelect={handleChannelSelect}
            onViewChange={handleViewChange}
            onLogout={handleLogout}
            isDJMode={isDJMode}
            isMobile={false}
            onComposeClick={handleComposeClick}
            onFollowUser={handleFollowUser}
            followingList={followingList}
          />
        )}

        <main className={`flex-1 flex flex-col min-w-0 ${
          isMobile ? 'pb-16' : 'pb-20' // Add bottom padding for mobile nav + music player or just music player
        }`}>
          <div className={`flex-1 ${isMobile ? 'px-4 py-4 pb-safe' : ''} ${isMobile ? 'pb-20' : 'pb-4'}`}>
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Desktop Now Playing Bar */}
      {!isMobile && (
        <div className="sticky bottom-0">
          <NowPlaying
            track={nowPlaying}
            onToggleDJ={handleToggleDJ}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile bottom navigation pinned to footer */}
      {isMobile && (
        <MobileNavigation
          currentView={currentView}
          onViewChange={handleViewChange}
          isDJMode={isDJMode}
          onCreatePost={handleComposeClick}
        />
      )}
    </div>

    {/* Mobile Now Playing Bar - Outside main container */}
    {isMobile && (
      <div
        className="fixed left-0 right-0 z-[60]"
        style={{ bottom: '64px' }}
      >
        <NowPlaying
          track={nowPlaying}
          onToggleDJ={handleToggleDJ}
          isMobile={true}
        />
      </div>
    )}

    {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
        user={user}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectChannel={handleChannelSelect}
      />

      {/* DJ Session Notifications */}
      <DJNotificationSystem
        followingList={followingList}
        onJoinSession={handleJoinSessionFromNotification}
        onChannelSwitch={handleChannelSelect}
        isEnabled={true}
      />

      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/test-about" element={<TestAboutPage />} />
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/discover" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/following" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/listening" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/channels/*" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/profile/*" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/leaderboards" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/playlists" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
        <Route path="/dj" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
