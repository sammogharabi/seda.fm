import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
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
import { AboutPage } from './components/AboutPage';
import { EmailPreview } from './components/EmailPreview';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
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
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const isMobile = useIsMobile();

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
      
      // Check for existing user session
      try {
        const savedUser = localStorage.getItem('seda_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setShowAuth(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setShowAuth(true);
      } finally {
        setIsLoading(false);
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

    // Cleanup function for useEffect
    return cleanupNetwork;
  }, []);

  const handleLogin = useCallback((userData) => {
    try {
      setUser(userData);
      localStorage.setItem('seda_user', JSON.stringify(userData));
      setShowAuth(false);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      setUser(null);
      localStorage.removeItem('seda_user');
      setShowAuth(true);
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

  const handleShowAbout = useCallback(() => {
    setShowAboutPage(true);
  }, []);

  const handleCloseAbout = useCallback(() => {
    setShowAboutPage(false);
  }, []);

  const handleShowEmailPreview = useCallback(() => {
    setShowEmailPreview(true);
  }, []);

  const handleCloseEmailPreview = useCallback(() => {
    setShowEmailPreview(false);
  }, []);

  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('seda_user', JSON.stringify(updatedUser));
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
  if (isLoading) {
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

  // Show auth modal if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background dark">
        <AuthModal isOpen={showAuth} onLogin={handleLogin} />
        <motion.div 
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div 
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div 
                className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-primary-foreground font-medium text-lg">S</span>
              </motion.div>
              <h1 className="text-3xl text-foreground font-medium">
                sedā.fm
              </h1>
            </motion.div>
            <motion.p 
              className="text-muted-foreground text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Welcome to the music community
            </motion.p>
            {!hasNetwork && (
              <motion.div
                className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-destructive text-sm">
                  No internet connection. Please check your network.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
        <Toaster />
      </div>
    );
  }

  // Show About Page
  if (showAboutPage) {
    return (
      <div className="min-h-screen bg-background dark">
        <div className="fixed top-4 left-4 z-50">
          <button 
            onClick={handleCloseAbout}
            className="bg-card border border-border rounded-lg px-4 py-2 text-foreground hover:bg-secondary transition-colors duration-200"
          >
            ← Back to App
          </button>
        </div>
        <AboutPage />
      </div>
    );
  }

  // Show Email Preview
  if (showEmailPreview) {
    return (
      <div className="min-h-screen bg-background dark">
        <EmailPreview onClose={handleCloseEmailPreview} />
      </div>
    );
  }

  return (
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
          onShowAbout={handleShowAbout}
          onShowEmailPreview={handleShowEmailPreview}
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
            onShowAbout={handleShowAbout}
            onShowEmailPreview={handleShowEmailPreview}
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

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNavigation 
          currentView={currentView}
          onViewChange={handleViewChange}
          isDJMode={isDJMode}
          onCreatePost={handleComposeClick}
          onSearch={handleSearch}
        />
      )}

      {/* Persistent Now Playing Bar */}
      <div className={`${isMobile ? 'fixed bottom-16 left-0 right-0 z-30' : 'sticky bottom-0'}`}>
        <NowPlaying 
          track={nowPlaying}
          onToggleDJ={handleToggleDJ}
          isMobile={isMobile}
        />
      </div>

      {/* Mobile Floating Compose Button */}
      {isMobile && !isDJMode && (
        <ComposeButton onClick={handleComposeClick} isMobile={true} />
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
    </div>
  );
}