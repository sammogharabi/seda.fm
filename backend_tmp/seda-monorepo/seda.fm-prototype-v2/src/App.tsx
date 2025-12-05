import React, { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import FigmaAboutPage from './FigmaAboutPage';
import { ZineAboutPage } from './components/ZineAboutPage';
import { StickyEmailSignup } from './components/StickyEmailSignup';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { MobileNavigation } from './components/MobileNavigation';
import { ArtistMobileHeader } from './components/ArtistMobileHeader';
import { ArtistMobileNavigation } from './components/ArtistMobileNavigation';
import { ArtistDashboard } from './components/ArtistDashboard';
import { ArtistAnalytics } from './components/ArtistAnalytics';
import { ArtistContentManager } from './components/ArtistContentManager';
import { ArtistMarketplace } from './components/ArtistMarketplace';
import { ArtistFansManager } from './components/ArtistFansManager';
import { UserTypeSwitcher } from './components/UserTypeSwitcher';
import { DebugState } from './components/DebugState';
import { ArtistExperienceGuide } from './components/ArtistExperienceGuide';
import { SocialFeed } from './components/SocialFeed';
import { DiscoverView } from './components/DiscoverView';
import { FollowingView } from './components/FollowingView';
import { SessionsView } from './components/SessionsView';
import { RoomView } from './components/RoomView';
import { RoomsView } from './components/RoomsView';
import { UserProfile } from './components/UserProfile-fixed';
import { ArtistProfile } from './components/ArtistProfile';
import { FanMarketplaceView } from './components/FanMarketplaceView';
import { MessagesView } from './components/MessagesView';
import { MobileSearchOptimized } from './components/MobileSearchOptimized';
import { DesktopSearch } from './components/DesktopSearch';
import { Leaderboards } from './components/Leaderboards';
import { Crates } from './components/Crates';
import { Feedback } from './components/Feedback';
import { DJMode } from './components/DJMode';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { CreateCrateModal } from './components/CreateCrateModal';
import { CreateModal } from './components/CreateModal';
import { TrackUploadModal } from './components/TrackUploadModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { MiniPlayer } from './components/MiniPlayer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { toast } from 'sonner@2.0.3';
import { XPNotificationSystem } from './components/XPNotificationSystem';
import { ProgressionDashboard } from './components/ProgressionDashboard';
import { AIDetectionSystemDemo } from './components/AIDetectionSystemDemo';
import { sendMessage, getUnreadMessageCount } from './utils/messageService';
import { mockFans, mockArtists } from './data/mockData';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useAppState } from './hooks/useAppState';
import { useModals } from './hooks/useModals';
import { useDJSession } from './hooks/useDJSession';
import { useDataHandlers } from './hooks/useDataHandlers';

export default function App() {
  console.log('🔥 APP COMPONENT MOUNTING');
  
  // ===== CUSTOM HOOKS =====
  const auth = useAuth();
  const appState = useAppState();
  const modals = useModals();
  const djSession = useDJSession(
    appState.currentView, 
    appState.setCurrentView, 
    appState.nowPlaying, 
    appState.setNowPlaying
  );
  
  const dataHandlers = useDataHandlers(
    auth.currentUser,
    appState.followingList,
    appState.setFollowingList,
    appState.posts,
    appState.setPosts,
    appState.userRooms,
    appState.setUserRooms,
    appState.joinedRooms,
    appState.setJoinedRooms,
    appState.userCrates,
    appState.setUserCrates,
    appState.setCurrentView,
    appState.setCurrentRoom,
    appState.setRoomViewMode,
    appState.setSelectedArtist,
    appState.setSelectedArtistForMarketplace,
    appState.setSelectedFan,
    appState.selectedArtistForMarketplace,
    mockArtists,
    mockFans
  );

  // Debug state tracking
  React.useEffect(() => {
    console.log('🎯 STATE CHANGE:', { 
      showLoginPage: auth.showLoginPage, 
      showMainApp: auth.showMainApp, 
      initializationComplete: auth.initializationComplete,
      isAuthenticated: auth.isAuthenticated,
      hasCurrentUser: !!auth.currentUser,
      currentUserType: auth.currentUser?.userType,
      currentView: appState.currentView,
      isMobile: appState.isMobile
    });
  }, [auth.showLoginPage, auth.showMainApp, auth.initializationComplete, auth.isAuthenticated, auth.currentUser, appState.currentView, appState.isMobile]);

  // Initialize following list when user logs in
  React.useEffect(() => {
    if (auth.currentUser && auth.currentUser.following && appState.followingList.length === 0) {
      console.log('🔗 Initializing following list for user:', auth.currentUser.id);
      console.log('User following IDs:', auth.currentUser.following);
      
      // Convert following IDs to actual user objects
      const followingUsers = auth.currentUser.following.map(followingId => {
        // Check in mock fans first
        const fan = mockFans.find(f => f.id === followingId);
        if (fan) return fan;
        
        // Check in mock artists
        const artist = mockArtists.find(a => a.id === followingId);
        if (artist) return artist;
        
        return null;
      }).filter(Boolean); // Remove null values
      
      console.log('🔗 Setting following list:', followingUsers);
      appState.setFollowingList(followingUsers);
    }
  }, [auth.currentUser, appState.followingList.length, appState.setFollowingList]);



  // Create enhanced handlers with modal integration
  const handleCreatePost = (post) => {
    dataHandlers.handleCreatePost(post);
    modals.setShowCreatePost(false);
  };

  const handleCreateRoom = (room) => {
    dataHandlers.handleCreateRoom(room);
    modals.setShowCreateRoom(false);
  };

  const handleCreateCrate = (crate) => {
    dataHandlers.handleCreateCrate(crate);
    modals.setShowCreateCrate(false);
  };

  const handleUploadTrack = (track) => {
    // For now, just show a success message and add to the posts as a track post
    const trackPost = {
      id: Date.now().toString(),
      type: 'track',
      content: `Check out my new track: ${track.title}`,
      user: auth.currentUser,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      comments: 0,
      isLiked: false,
      isReposted: false,
      track: track
    };
    
    appState.setPosts(prevPosts => [trackPost, ...prevPosts]);
    modals.setShowTrackUpload(false);
    
    toast.success('Track uploaded successfully!', {
      description: `"${track.title}" is now available to your fans`
    });
  };



  // ===== EFFECT HOOKS =====
  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      appState.setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [appState]);

  // Add effect to manage scroll lock for sessions view
  useEffect(() => {
    if (appState.currentView === 'sessions') {
      // Add scroll lock class to document
      document.documentElement.classList.add('sessions-scroll-lock');
      document.body.classList.add('sessions-scroll-lock');
      
      // Force scroll to top
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } else {
      // Remove scroll lock class
      document.documentElement.classList.remove('sessions-scroll-lock');
      document.body.classList.remove('sessions-scroll-lock');
    }
    
    return () => {
      document.documentElement.classList.remove('sessions-scroll-lock');
      document.body.classList.remove('sessions-scroll-lock');
    };
  }, [appState.currentView]);

  // Add effect to scroll to top on view changes (especially for profile views)
  useEffect(() => {
    // Scroll to top when view changes, with a small delay to ensure content is rendered
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll for most views
    scrollToTop();

    // Additional scroll after a brief delay to ensure content is fully rendered
    const timeoutId = setTimeout(scrollToTop, 50);

    return () => clearTimeout(timeoutId);
  }, [appState.currentView, appState.selectedArtist, appState.selectedFan]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Search shortcut: Cmd/Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (auth.showMainApp && auth.isAuthenticated) {
          appState.handleOpenSearch();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [auth.showMainApp, auth.isAuthenticated, appState]);

  // Show loading screen with timeout fallback
  useEffect(() => {
    if (auth.isLoading) {
      // Auto-resolve loading after 5 seconds to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached, forcing resolution');
        // Note: We can't directly set auth.isLoading here since it's managed by the hook
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [auth.isLoading]);

  // ===== CONDITIONAL RENDERING =====
  
  // Show loading screen
  if (auth.isLoading || !auth.initializationComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
              ease: 'easeInOut'
            }}
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-accent-coral to-accent-mint rounded-xl flex items-center justify-center shadow-2xl border-2 border-foreground"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-background font-black text-2xl">S</span>
            </motion.div>
            <div>
              <h1 className="text-4xl text-foreground font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                sedā.fm
              </h1>
              <div className="w-16 h-1 bg-accent-coral mt-1"></div>
            </div>
          </motion.div>
          <motion.p 
            className="text-muted-foreground text-lg font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading the underground...
          </motion.p>
        </motion.div>
        <Toaster />
      </div>
    );
  }

  // Show Login Page when requested
  if (auth.showLoginPage) {
    console.log('🔐 RENDERING LOGIN PAGE');
    return <LoginPage onLogin={auth.handleDemoLogin} onBack={() => {
      auth.setShowLoginPage(false);
      auth.setShowMainApp(false); // This will show the About page
    }} />;
  }

  // Show Main App when authenticated and requested
  if (auth.showMainApp && auth.isAuthenticated && auth.currentUser) {
    console.log('🏠 RENDERING MAIN APP INTERFACE', {
      userType: auth.currentUser.userType,
      isArtist: auth.currentUser.isArtist,
      currentView: appState.currentView,
      isMobile: appState.isMobile
    });
    
    // Main Platform Interface with Zine Aesthetic
    const renderMainContent = () => {
      switch (appState.currentView) {
        case 'dj':
          return (
            <DJMode
              room={appState.currentRoom}
              user={auth.currentUser}
              onNowPlaying={appState.setNowPlaying}
              onExit={djSession.handleEndDJSession}
              onMinimize={djSession.handleMinimizeDJ}
              sessionConfig={djSession.djSession}
              isMobile={appState.isMobile}
            />
          );
        case 'discover':
          return (
            <DiscoverView 
              user={auth.currentUser} 
              onNowPlaying={appState.setNowPlaying}
              onFollowUser={dataHandlers.handleFollowUser}
              onUnfollowUser={dataHandlers.handleUnfollowUser}
              isFollowing={dataHandlers.isFollowing}
              followingList={appState.followingList}
              onRoomSelect={appState.handleRoomSelect}
              onViewArtistProfile={dataHandlers.handleViewArtistProfile}
              onViewFanProfile={dataHandlers.handleViewFanProfile}
              mockArtists={mockArtists}
            />
          );

        case 'messages':
          return (
            <MessagesView
              user={auth.currentUser}
              onSendMessage={(recipientId, message, messageType) => {
                try {
                  sendMessage(auth.currentUser, recipientId, message, messageType);
                } catch (error) {
                  toast.error('Failed to send message', {
                    description: 'Please try again later'
                  });
                }
              }}
              onBackToFeed={() => {
                // Navigate back to appropriate view based on user type
                if (auth.currentUser?.userType === 'artist') {
                  appState.setCurrentView('artist-dashboard');
                } else {
                  appState.setCurrentView('feed');
                }
              }}
            />
          );
        case 'rooms':
          return (
            <RoomsView 
              user={auth.currentUser} 
              userRooms={appState.userRooms}
              joinedRooms={appState.joinedRooms}
              onCreateRoomClick={() => modals.setShowCreateRoom(true)}
              onRoomSelect={appState.handleRoomSelect}
              onRoomPreview={appState.handleRoomPreview}
              onJoinRoom={dataHandlers.handleJoinRoom}
              onNowPlaying={appState.setNowPlaying}
            />
          );
        case 'sessions':
          return <SessionsView user={auth.currentUser} onNowPlaying={appState.setNowPlaying} onJoinSession={djSession.handleJoinSession} onStartDJ={djSession.handleStartDJ} activeSession={appState.activeSession} onSetActiveSession={appState.setActiveSession} />;
        case 'room':
          return (
            <RoomView 
              room={appState.currentRoom} 
              user={auth.currentUser} 
              onNowPlaying={appState.setNowPlaying}
              viewMode={appState.roomViewMode}
              onJoinRoom={dataHandlers.handleJoinRoom}
              onBackToRooms={() => appState.setCurrentView('rooms')}
            />
          );
        case 'profile':
          return <UserProfile user={auth.currentUser} onUpdateUser={auth.handleUpdateUser} viewingUser={auth.currentUser} isOwnProfile={true} onViewChange={appState.handleViewChange} onBlockUser={dataHandlers.handleBlockUser} onUnblockUser={dataHandlers.handleUnblockUser} isBlocked={dataHandlers.isBlocked} getBlockedUsers={dataHandlers.getBlockedUsers} />;

        case 'leaderboards':
          return (
            <Leaderboards 
              user={auth.currentUser}
              onViewArtistProfile={dataHandlers.handleViewArtistProfile}
              onViewFanProfile={dataHandlers.handleViewFanProfile}
              mockArtists={mockArtists}
            />
          );
        case 'crates':
          return (
            <Crates 
              user={auth.currentUser} 
              userCrates={appState.userCrates} 
              onNowPlaying={appState.setNowPlaying}
              onViewArtistProfile={dataHandlers.handleViewArtistProfile}
              onViewFanProfile={dataHandlers.handleViewFanProfile}
              mockArtists={mockArtists}
            />
          );
        case 'feedback':
          return <Feedback user={auth.currentUser} />;
        case 'artist-profile':
          return (
            <ArtistProfile
              artist={appState.selectedArtist}
              currentUser={auth.currentUser}
              onNowPlaying={appState.setNowPlaying}
              onBack={dataHandlers.handleBackFromArtistProfile}
              isFollowing={dataHandlers.isFollowing(appState.selectedArtist?.id)}
              onFollowToggle={dataHandlers.handleFollowArtist}
              onViewMarketplace={dataHandlers.handleViewArtistMarketplace}
              onJoinRoom={dataHandlers.handleJoinRoom}
              onPreviewRoom={dataHandlers.handleRoomPreview}
              userRooms={appState.userRooms}
              joinedRooms={appState.joinedRooms}
              onViewFanProfile={dataHandlers.handleViewFanProfile}
              onViewArtistProfile={dataHandlers.handleViewArtistProfile}
              mockArtists={mockArtists}
              mockFans={mockFans}
              onFollowUser={dataHandlers.handleFollowUser}
              onUnfollowUser={dataHandlers.handleUnfollowUser}
              isFollowingUser={dataHandlers.isFollowing}
              onBlockUser={dataHandlers.handleBlockUser}
              isBlocked={dataHandlers.isBlocked}
              onSendMessage={(fan, message, messageType) => {
                try {
                  sendMessage(auth.currentUser, fan.id, message, messageType);
                } catch (error) {
                  toast.error('Failed to send message', {
                    description: 'Please try again later'
                  });
                }
              }}
            />
          );
        case 'artist-marketplace':
          return (
            <FanMarketplaceView
              artist={appState.selectedArtistForMarketplace}
              currentUser={auth.currentUser}
              onBack={dataHandlers.handleBackFromMarketplace}
              onNowPlaying={appState.setNowPlaying}
            />
          );
        case 'fan-profile':
          // Ensure we have valid fan data before rendering
          if (!appState.selectedFan || !appState.selectedFan.id) {
            console.error('🚨 Fan profile view: No valid selectedFan data');
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Profile Unavailable</h2>
                  <p className="text-muted-foreground mb-4">Profile features are temporarily unavailable</p>
                  <button 
                    onClick={() => appState.setCurrentView('discover')}
                    className="bg-accent-coral text-background px-4 py-2 font-semibold hover:bg-accent-coral/90 transition-colors"
                  >
                    Back to Discover
                  </button>
                </div>
              </div>
            );
          }
          
          return (
            <UserProfile
              user={appState.selectedFan}
              onUpdateUser={null} // Can't update other users
              viewingUser={auth.currentUser}
              isOwnProfile={false}
              onBack={dataHandlers.handleBackFromFanProfile}
              onFollowToggle={dataHandlers.handleFollowFan}
              isFollowing={dataHandlers.isFollowing(appState.selectedFan.id)}
              defaultTab="activity"
              onSendMessage={(fan, message, messageType) => {
                // In a real app, this would integrate with your messaging system
                try {
                  sendMessage(auth.currentUser, fan.id, message, messageType);
                } catch (error) {
                  toast.error('Failed to send message', {
                    description: 'Please try again later'
                  });
                }
              }}
              onFollowUser={dataHandlers.handleFollowUser}
              isFollowingUser={dataHandlers.isFollowing}
              onViewChange={appState.handleViewChange}
              onBlockUser={dataHandlers.handleBlockUser}
              onUnblockUser={dataHandlers.handleUnblockUser}
              isBlocked={dataHandlers.isBlocked}
              getBlockedUsers={dataHandlers.getBlockedUsers}
            />
          );
        
        // Artist-specific views
        case 'artist-dashboard':
        case 'artist-dashboard-profile':
          return (
            <ArtistDashboard
              user={auth.currentUser}
              onViewChange={appState.handleViewChange}
              onStartLiveSession={djSession.handleStartDJ}
              onCreateContent={() => modals.setShowTrackUpload(true)}
              onCreateCrate={() => modals.setShowCreateCrate(true)}
              initialTab={appState.currentView === 'artist-dashboard-profile' ? 'profile' : 'overview'}
              onUpdateUser={auth.handleUpdateUser}
              onBlockUser={dataHandlers.handleBlockUser}
              onUnblockUser={dataHandlers.handleUnblockUser}
              isBlocked={dataHandlers.isBlocked}
              getBlockedUsers={dataHandlers.getBlockedUsers}
              mockFans={mockFans}
              mockArtists={mockArtists}
            />
          );
        
        case 'artist-analytics':
          return (
            <ArtistAnalytics
              user={auth.currentUser}
              onViewChange={appState.handleViewChange}
            />
          );
        
        case 'artist-store':
          return (
            <ArtistMarketplace
              user={auth.currentUser}
              onUpdateUser={auth.handleUpdateUser}
              onCreatePost={handleCreatePost}
            />
          );
        
        case 'artist-store-tracks':
          return (
            <ArtistMarketplace
              user={auth.currentUser}
              onUpdateUser={auth.handleUpdateUser}
              initialTab="tracks"
              onCreatePost={handleCreatePost}
            />
          );
        
        case 'artist-store-analytics':
          return (
            <ArtistMarketplace
              user={auth.currentUser}
              onUpdateUser={auth.handleUpdateUser}
              initialTab="analytics"
              onCreatePost={handleCreatePost}
            />
          );
        
        case 'artist-fans':
          // Get all fans who are following this artist
          const artistFans = mockFans.filter(fan => 
            fan.following && fan.following.includes(auth.currentUser.id)
          );
          
          return (
            <ArtistFansManager
              user={auth.currentUser}
              fans={artistFans}
              onViewChange={appState.handleViewChange}
              onSendMessage={(fanId, message) => {
                try {
                  sendMessage(auth.currentUser, fanId, message, 'general');
                  toast.success('Message sent!');
                } catch (error) {
                  toast.error('Failed to send message', {
                    description: 'Please try again later'
                  });
                }
              }}
            />
          );
        
        case 'artist-guide':
          return <ArtistExperienceGuide />;
        
        case 'ai-detection':
          return <AIDetectionSystemDemo />;
        
        default:
          return (
            <SocialFeed
              user={auth.currentUser}
              posts={appState.posts}
              onNowPlaying={appState.setNowPlaying}
              onStartDJ={djSession.handleStartDJ}
              onFollowUser={dataHandlers.handleFollowUser}
              onUnfollowUser={dataHandlers.handleUnfollowUser}
              isFollowing={dataHandlers.isFollowing}
              onViewArtistProfile={dataHandlers.handleViewArtistProfile}
              onViewFanProfile={dataHandlers.handleViewFanProfile}
              mockArtists={mockArtists}
            />
          );
      }
    };

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background flex">

        {/* Desktop Sidebar */}
        {!appState.isMobile && (
          <Sidebar
            user={auth.currentUser}
            currentRoom={appState.currentRoom}
            currentView={appState.currentView}
            onRoomSelect={appState.handleRoomSelect}
            onViewChange={appState.handleViewChange}
            onLogout={auth.handleLogout}
            onCreateClick={() => modals.setShowCreateModal(true)}
            onShowAbout={() => auth.setShowMainApp(false)}
            onOpenSearch={appState.handleOpenSearch}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

          {/* Mobile Header */}
          {appState.isMobile && (
            <>
              {/* Artist Mobile Header */}
              {auth.currentUser?.userType === 'artist' ? (
                <ArtistMobileHeader
                  user={auth.currentUser}
                  currentView={appState.currentView}
                  onViewChange={appState.handleViewChange}
                  onLogout={auth.handleLogout}
                  sidebarOpen={appState.sidebarOpen}
                  setSidebarOpen={appState.setSidebarOpen}
                  onCreateClick={() => modals.setShowCreateModal(true)}
                  onShowAbout={() => auth.setShowMainApp(false)}
                  unreadMessages={0}
                  notifications={0}
                />
              ) : (
                /* Fan Mobile Header */
                <MobileHeader
                  user={auth.currentUser}
                  currentRoom={appState.currentRoom}
                  currentView={appState.currentView}
                  onRoomSelect={appState.handleRoomSelect}
                  onViewChange={appState.handleViewChange}
                  onLogout={auth.handleLogout}
                  sidebarOpen={appState.sidebarOpen}
                  setSidebarOpen={appState.setSidebarOpen}
                  onCreateClick={() => modals.setShowCreateModal(true)}
                  onCreateRoomClick={() => modals.setShowCreateRoom(true)}
                  userRooms={appState.userRooms}
                  joinedRooms={appState.joinedRooms}
                  onShowAbout={() => auth.setShowMainApp(false)}
                  onOpenSearch={appState.handleOpenSearch}
                />
              )}
            </>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                {appState.currentView === 'sessions' ? (
                  // Sessions view without motion to prevent scroll issues
                  <div key="sessions" className="h-full">
                    {renderMainContent()}
                  </div>
                ) : (
                  // Other views with motion animation
                  <motion.div
                    key={`view-${appState.currentView}-room-${appState.currentRoom}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {renderMainContent()}
                  </motion.div>
                )}
              </AnimatePresence>
            </ErrorBoundary>
          </main>

            {/* Mobile Bottom Navigation */}
          {appState.isMobile && (
            <>
              {/* Artist Mobile Navigation */}
              {auth.currentUser?.userType === 'artist' ? (
                <ArtistMobileNavigation
                  currentView={appState.currentView}
                  onViewChange={appState.handleViewChange}
                  onCreateClick={() => modals.setShowCreateModal(true)}
                />
              ) : (
                /* Fan Mobile Navigation */
                <MobileNavigation
                  currentView={appState.currentView}
                  onViewChange={appState.handleViewChange}
                  onCreateClick={() => modals.setShowCreateModal(true)}
                  onOpenSearch={appState.handleOpenSearch}
                />
              )}
            </>
          )}

        </div>

        {/* Mini Player - Shows when music is playing */}
        {appState.currentView !== 'sessions' && appState.currentView !== 'dj' && (
          <>
            {/* Active Session Mini Player */}
            {appState.activeSession && appState.activeSession.currentTrack && (
              <MiniPlayer
                track={appState.activeSession.currentTrack}
                isPlaying={appState.activeSession.isPlaying}
                onClose={() => {
                  appState.setActiveSession(null);
                  toast.info('Left session');
                }}
                isDJSession={true}
                onExpand={() => {
                  appState.setCurrentView('sessions');
                }}
                djSession={{
                  ...appState.activeSession,
                  listeners: appState.activeSession.listeners || []
                }}
              />
            )}
            
            {/* Minimized DJ Session Player */}
            {!appState.activeSession && djSession.isDJMinimized && djSession.djSession && (
              <MiniPlayer
                track={appState.nowPlaying}
                onClose={djSession.handleEndDJSession}
                isDJSession={true}
                onExpand={djSession.handleExpandDJ}
                djSession={djSession.djSession}
              />
            )}
            
            {/* Regular Track Player */}
            {!appState.activeSession && !djSession.isDJMinimized && appState.nowPlaying && (
              <MiniPlayer
                track={appState.nowPlaying}
                onClose={() => appState.setNowPlaying(null)}
                isDJSession={false}
              />
            )}
          </>
        )}

        {/* Modals */}
        <CreatePostModal
          isOpen={modals.showCreatePost}
          onClose={() => modals.setShowCreatePost(false)}
          onCreatePost={handleCreatePost}
          user={auth.currentUser}
        />

        <CreateRoomModal
          isOpen={modals.showCreateRoom}
          onClose={() => modals.setShowCreateRoom(false)}
          onCreateRoom={handleCreateRoom}
          user={auth.currentUser}
        />

        <CreateCrateModal
          isOpen={modals.showCreateCrate}
          onClose={() => modals.setShowCreateCrate(false)}
          onCreateCrate={handleCreateCrate}
          user={auth.currentUser}
        />

        <CreateModal
          isOpen={modals.showCreateModal}
          onClose={() => modals.setShowCreateModal(false)}
          onCreatePost={modals.handleOpenCreatePost}
          onCreateRoom={modals.handleOpenCreateRoom}
          onCreateCrate={modals.handleOpenCreateCrate}
          user={auth.currentUser}
        />

        <TrackUploadModal
          isOpen={modals.showTrackUpload}
          onClose={() => modals.setShowTrackUpload(false)}
          onUploadTrack={handleUploadTrack}
          user={auth.currentUser}
        />

        {/* Search Modal - Responsive */}
        {appState.isMobile ? (
          <MobileSearchOptimized
            isOpen={appState.showGlobalSearch}
            onClose={appState.handleCloseSearch}
            onViewArtistProfile={dataHandlers.handleViewArtistProfile}
            onViewFanProfile={dataHandlers.handleViewFanProfile}
            onPlayTrack={appState.setNowPlaying}
            onFollowUser={dataHandlers.handleFollowUser}
            onUnfollowUser={dataHandlers.handleUnfollowUser}
            onJoinRoom={dataHandlers.handleJoinRoom}
            onViewCrate={(crate) => {
              appState.setCurrentView('crates');
              toast.success(`Viewing "${crate.name}" crate`);
            }}
            currentUser={auth.currentUser}
            mockArtists={mockArtists}
            mockFans={mockFans}
          />
        ) : (
          <DesktopSearch
            isOpen={appState.showGlobalSearch}
            onClose={appState.handleCloseSearch}
            onViewArtistProfile={dataHandlers.handleViewArtistProfile}
            onViewFanProfile={dataHandlers.handleViewFanProfile}
            onPlayTrack={appState.setNowPlaying}
            onFollowUser={dataHandlers.handleFollowUser}
            onUnfollowUser={dataHandlers.handleUnfollowUser}
            onJoinRoom={dataHandlers.handleJoinRoom}
            onViewCrate={(crate) => {
              appState.setCurrentView('crates');
              toast.success(`Viewing "${crate.name}" crate`);
            }}
            currentUser={auth.currentUser}
            mockArtists={mockArtists}
            mockFans={mockFans}
          />
        )}

        </div>

        {/* XP Notification System - Only for fans (artists don't have subscriptions/points) */}
        <XPNotificationSystem 
          userId={auth.currentUser.id} 
          enabled={auth.currentUser.userType !== 'artist'} 
        />

        {/* Development User Type Switcher - Show on all screen sizes for testing */}
        <UserTypeSwitcher
          currentUser={auth.currentUser}
          onSwitchUserType={(userType) => {
            // Create a mock user of the specified type
            const mockUser = userType === 'artist' 
              ? { ...mockArtists[0], id: `${userType}-demo-${Date.now()}` }
              : { ...mockFans[0], id: `${userType}-demo-${Date.now()}` };
            console.log('🔄 Switching to user type:', userType, mockUser);
            auth.switchUser(mockUser);
            
            // Reset app state for clean switch
            appState.setFollowingList([]);
            appState.setCurrentView('feed');
            appState.setNowPlaying(null);
            appState.setCurrentRoom(null);
            
            // Set appropriate default view based on user type
            setTimeout(() => {
              if (mockUser.userType === 'artist' && appState.isMobile) {
                console.log('🎨 Setting artist dashboard view');
                appState.setCurrentView('artist-dashboard');
              } else {
                console.log('🎵 Setting fan feed view');
                appState.setCurrentView('feed');
              }
            }, 200);
          }}
          onSelectUser={(user) => {
            console.log('👤 Selecting user:', user);
            console.log('Current user before switch:', auth.currentUser);
            console.log('User being selected:', user);
            
            // Use the new switchUser method for proper state management
            auth.switchUser(user);
            
            // Reset app state for clean switch
            appState.setFollowingList([]);
            appState.setCurrentView('feed');
            appState.setNowPlaying(null);
            appState.setCurrentRoom(null);
            
            // Set appropriate default view based on user type
            setTimeout(() => {
              if (user.userType === 'artist' && appState.isMobile) {
                console.log('🎨 Setting artist dashboard view');
                appState.setCurrentView('artist-dashboard');
              } else {
                console.log('🎵 Setting fan feed view');
                appState.setCurrentView('feed');
              }
            }, 200);
          }}
          onViewChange={appState.handleViewChange}
        />

        {/* Debug State - Development only */}
        <DebugState
          currentUser={auth.currentUser}
          currentView={appState.currentView}
          isMobile={appState.isMobile}
          isAuthenticated={auth.isAuthenticated}
          showMainApp={auth.showMainApp}
          showLoginPage={auth.showLoginPage}
        />

        <Toaster />
      </ErrorBoundary>
    );
  }

  // Show About Page for non-authenticated users or when main app not requested
  console.log('📄 RENDERING ABOUT PAGE');
  return (
    <div className="min-h-screen bg-background">
      
      {/* Main About Content - Responsive Layout */}
      <div className={`${!modals.emailSignupDismissed ? 'pb-20 md:pb-0' : ''}`}>
        <ErrorBoundary>
          <ZineAboutPage />
        </ErrorBoundary>
      </div>
      
      {/* Login Button - floating button */}
      <motion.button
        onClick={() => {
          console.log('Enter Platform clicked - setting showLoginPage to true');
          auth.setShowLoginPage(true);
          auth.setShowMainApp(false);
        }}
        className="fixed bottom-6 right-6 bg-accent-coral text-background px-6 py-3 font-black uppercase tracking-wider hover:bg-accent-coral/90 transition-all border-2 border-accent-coral shadow-lg z-50 md:px-8 md:py-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="hidden md:inline">Login / Sign Up</span>
        <span className="md:hidden">Login</span>
      </motion.button>

      {/* Quick Demo Access Button - Additional option for desktop */}
      {!appState.isMobile && (
        <motion.button
          onClick={() => auth.handleDemoLogin()}
          className="fixed bottom-6 left-6 bg-accent-mint text-background px-6 py-3 font-black uppercase tracking-wider hover:bg-accent-mint/90 transition-all border-2 border-accent-mint shadow-lg z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Quick Demo
        </motion.button>
      )}

      {/* Sticky Email Signup for About Page - Hidden on desktop */}
      {appState.isMobile && (
        <StickyEmailSignup
          onDismiss={modals.handleDismissEmailSignup}
          isDismissed={modals.emailSignupDismissed}
        />
      )}
      
      <Toaster />

      {/* Auth Modal - Fallback for any remaining modal calls */}
      <AuthModal
        isOpen={auth.showAuthModal}
        onClose={() => auth.setShowAuthModal(false)}
        onLogin={auth.handleDemoLogin}
      />
    </div>
  );
}