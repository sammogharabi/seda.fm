import React, { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import FigmaAboutPage from './FigmaAboutPage';
import { ZineAboutPage } from './components/ZineAboutPage';
import { StickyEmailSignup } from './components/StickyEmailSignup';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
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
import { CreateSessionModal } from './components/CreateSessionModal';
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
import { DropDetailView } from './components/DropDetailView';
import { sendMessage, getUnreadMessageCount } from './utils/messageService';
import { mockFans, mockArtists } from './data/mockData';
import { EmailVerificationHandler } from './components/EmailVerificationHandler';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useAuth as useSupabaseAuth } from './contexts/AuthContext';
import { useAppState } from './hooks/useAppState';
import { useModals } from './hooks/useModals';
import { useDJSession } from './hooks/useDJSession';
import { useDataHandlers } from './hooks/useDataHandlers';

export default function App() {
  console.log('🔥 APP COMPONENT MOUNTING', {
    pathname: window.location.pathname,
    search: window.location.search,
    href: window.location.href
  });

  // Check if we're on the verify-email route
  const [isVerifyEmailRoute, setIsVerifyEmailRoute] = React.useState(() => {
    const pathname = window.location.pathname;
    const isVerify = pathname === '/verify-email' || pathname.startsWith('/verify-email');
    console.log('📧 VERIFY EMAIL ROUTE CHECK:', { pathname, isVerify });
    return isVerify;
  });

  // ===== CUSTOM HOOKS =====
  const auth = useAuth();
  const supabaseAuth = useSupabaseAuth();
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

  // ===== CRATE PLAYER STATE =====
  // Global crate player state with localStorage persistence
  const [cratePlayer, setCratePlayer] = React.useState(() => {
    try {
      const stored = localStorage.getItem('seda-crate-player-track');
      return {
        currentTrack: stored ? JSON.parse(stored) : null,
        isPlaying: localStorage.getItem('seda-crate-player-playing') === 'true',
        playingCrate: localStorage.getItem('seda-crate-player-crate') ? JSON.parse(localStorage.getItem('seda-crate-player-crate')) : null,
        currentTrackIndex: parseInt(localStorage.getItem('seda-crate-player-index') || '0', 10),
        isShuffled: localStorage.getItem('seda-crate-player-shuffled') === 'true',
        shuffledIndices: localStorage.getItem('seda-crate-player-shuffle-indices') ? JSON.parse(localStorage.getItem('seda-crate-player-shuffle-indices')) : [],
        isPlayerMinimized: localStorage.getItem('seda-crate-player-minimized') === 'true'
      };
    } catch (error) {
      console.error('Failed to load crate player state:', error);
      return {
        currentTrack: null,
        isPlaying: false,
        playingCrate: null,
        currentTrackIndex: 0,
        isShuffled: false,
        shuffledIndices: [],
        isPlayerMinimized: false
      };
    }
  });

  // Save crate player state to localStorage whenever it changes
  React.useEffect(() => {
    try {
      if (cratePlayer.currentTrack) {
        localStorage.setItem('seda-crate-player-track', JSON.stringify(cratePlayer.currentTrack));
      } else {
        localStorage.removeItem('seda-crate-player-track');
      }
      localStorage.setItem('seda-crate-player-playing', String(cratePlayer.isPlaying));
      if (cratePlayer.playingCrate) {
        localStorage.setItem('seda-crate-player-crate', JSON.stringify(cratePlayer.playingCrate));
      } else {
        localStorage.removeItem('seda-crate-player-crate');
      }
      localStorage.setItem('seda-crate-player-index', String(cratePlayer.currentTrackIndex));
      localStorage.setItem('seda-crate-player-shuffled', String(cratePlayer.isShuffled));
      localStorage.setItem('seda-crate-player-shuffle-indices', JSON.stringify(cratePlayer.shuffledIndices));
      localStorage.setItem('seda-crate-player-minimized', String(cratePlayer.isPlayerMinimized));
    } catch (error) {
      console.error('Failed to save crate player state:', error);
    }
  }, [cratePlayer]);

  // Crate player handlers
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handlePlayCrate = React.useCallback((crate, shuffle = false) => {
    if (!crate.tracks || crate.tracks.length === 0) {
      toast.error('This crate has no tracks yet');
      return;
    }

    if (shuffle) {
      const indices = shuffleArray([...Array(crate.tracks.length).keys()]);
      setCratePlayer({
        currentTrack: crate.tracks[indices[0]],
        isPlaying: true,
        playingCrate: crate,
        currentTrackIndex: 0,
        isShuffled: true,
        shuffledIndices: indices,
        isPlayerMinimized: false
      });
    } else {
      setCratePlayer({
        currentTrack: crate.tracks[0],
        isPlaying: true,
        playingCrate: crate,
        currentTrackIndex: 0,
        isShuffled: false,
        shuffledIndices: [],
        isPlayerMinimized: false
      });
    }

    toast.success(`${shuffle ? 'Shuffling' : 'Playing'} "${crate.name}"`);
  }, []);

  const handleNextTrack = React.useCallback(() => {
    if (!cratePlayer.playingCrate || !cratePlayer.playingCrate.tracks || cratePlayer.playingCrate.tracks.length === 0) return;

    const nextIndex = cratePlayer.currentTrackIndex + 1;
    if (nextIndex >= cratePlayer.playingCrate.tracks.length) {
      // Loop back to start
      setCratePlayer(prev => ({
        ...prev,
        currentTrackIndex: 0,
        currentTrack: prev.isShuffled ? prev.playingCrate.tracks[prev.shuffledIndices[0]] : prev.playingCrate.tracks[0]
      }));
    } else {
      setCratePlayer(prev => ({
        ...prev,
        currentTrackIndex: nextIndex,
        currentTrack: prev.isShuffled ? prev.playingCrate.tracks[prev.shuffledIndices[nextIndex]] : prev.playingCrate.tracks[nextIndex]
      }));
    }
  }, [cratePlayer.playingCrate, cratePlayer.currentTrackIndex]);

  const handlePreviousTrack = React.useCallback(() => {
    if (!cratePlayer.playingCrate || !cratePlayer.playingCrate.tracks || cratePlayer.playingCrate.tracks.length === 0) return;

    const prevIndex = cratePlayer.currentTrackIndex - 1;
    if (prevIndex < 0) {
      // Go to last track
      const lastIndex = cratePlayer.playingCrate.tracks.length - 1;
      setCratePlayer(prev => ({
        ...prev,
        currentTrackIndex: lastIndex,
        currentTrack: prev.isShuffled ? prev.playingCrate.tracks[prev.shuffledIndices[lastIndex]] : prev.playingCrate.tracks[lastIndex]
      }));
    } else {
      setCratePlayer(prev => ({
        ...prev,
        currentTrackIndex: prevIndex,
        currentTrack: prev.isShuffled ? prev.playingCrate.tracks[prev.shuffledIndices[prevIndex]] : prev.playingCrate.tracks[prevIndex]
      }));
    }
  }, [cratePlayer.playingCrate, cratePlayer.currentTrackIndex]);

  // Wrap handleViewChange to automatically minimize DJ session when navigating away
  const handleViewChangeWithDJMinimize = React.useCallback((view: string) => {
    console.log('🎵 handleViewChangeWithDJMinimize called:', {
      currentView: appState.currentView,
      targetView: view,
      hasDJSession: !!djSession.djSession
    });

    // If currently in DJ session and navigating away, minimize it instead of ending it
    if (appState.currentView === 'dj' && view !== 'dj' && djSession.djSession) {
      console.log('🎵 Navigating away from DJ session - minimizing...');
      djSession.handleMinimizeDJ();
      // Now navigate to the requested view
      appState.handleViewChange(view);
    } else {
      appState.handleViewChange(view);
    }
  }, [appState, djSession]);

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
  console.log('🎯 RENDER CONDITIONS:', {
    isVerifyEmailRoute,
    isLoading: auth.isLoading,
    initializationComplete: auth.initializationComplete,
    showLoginPage: auth.showLoginPage,
    showMainApp: auth.showMainApp,
    isAuthenticated: auth.isAuthenticated
  });

  // Handle /verify-email route first (before any other conditions)
  if (isVerifyEmailRoute) {
    console.log('✅ RENDERING EMAIL VERIFICATION HANDLER');
    return (
      <>
        <EmailVerificationHandler
          onVerificationComplete={async (session) => {
            // After email verification, auto-login if we have a session
            auth.setEmailVerified(true);
            console.log('📧 Verification complete, session:', session ? 'yes' : 'no');

            if (session?.access_token && session?.refresh_token) {
              console.log('🔑 Auto-logging in with session from verification...');
              try {
                const { user, error } = await supabaseAuth.setSessionFromToken(
                  session.access_token,
                  session.refresh_token
                );

                if (user && !error) {
                  console.log('✅ Auto-login successful!', user.email);
                  // The useAuth hook will automatically detect the Supabase session
                  // and set showMainApp=true via the useEffect that syncs Supabase user
                  // Give more time for auth state to fully propagate before clearing route
                  setTimeout(() => {
                    setIsVerifyEmailRoute(false);
                  }, 500);
                  return;
                } else {
                  console.error('❌ Auto-login failed:', error);
                }
              } catch (err) {
                console.error('❌ Auto-login error:', err);
              }
            }

            // Fallback: take user to login page if auto-login didn't work
            console.log('📝 No session or auto-login failed, redirecting to login...');
            auth.setShowMainApp(false);
            auth.setShowLoginPage(true);
            // Use setTimeout to ensure auth state changes are processed first
            setTimeout(() => {
              setIsVerifyEmailRoute(false);
            }, 0);
          }}
          onNavigateToLogin={() => {
            // Set auth state FIRST before changing route state
            auth.setShowMainApp(false);
            auth.setShowLoginPage(true);
            // Use setTimeout to ensure auth state changes are processed first
            setTimeout(() => {
              setIsVerifyEmailRoute(false);
              window.history.replaceState({}, document.title, '/');
            }, 0);
          }}
        />
        <Toaster />
      </>
    );
  }

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
              onMinimize={() => {
                djSession.handleMinimizeDJ();
                // Clear active session so the minimized player shows correctly
                if (appState.activeSession) {
                  // Transfer the active session data to djSession if not already set
                  if (!djSession.djSession) {
                    djSession.setDJSession(appState.activeSession);
                  }
                  appState.setActiveSession(null);
                }
                // Navigate back to the previous view (where user was before joining session)
                appState.setCurrentView(appState.previousView);
              }}
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
          // Find the full room data from joined rooms or user rooms
          const findRoomData = (roomId) => {
            // Check user's joined rooms first
            let roomData = appState.joinedRooms.find(r => r.id === roomId);
            if (roomData) return roomData;

            // Check user's owned rooms
            roomData = appState.userRooms.find(r => r.id === roomId);
            if (roomData) return roomData;

            // Return null if not found - RoomView will fall back to legacy room info
            return null;
          };

          const currentRoomData = findRoomData(appState.currentRoom);

          return (
            <RoomView
              roomId={appState.currentRoom}
              user={auth.currentUser}
              onNowPlaying={appState.setNowPlaying}
              viewMode={appState.roomViewMode}
              onJoinRoom={dataHandlers.handleJoinRoom}
              onBackToRooms={() => appState.setCurrentView('rooms')}
              onJoinSession={(sessionData) => {
                // Transform room session data into the format expected by SessionsView
                const transformedSession = {
                  id: sessionData.id,
                  name: currentRoomData?.name || appState.currentRoom,
                  room: {
                    id: appState.currentRoom,
                    name: currentRoomData?.name || appState.currentRoom
                  },
                  listeners: sessionData.activeListeners || 0,
                  isPlaying: sessionData.isActive || false,
                  currentTrack: sessionData.nowPlaying ? {
                    title: sessionData.nowPlaying.title,
                    artist: sessionData.nowPlaying.artist,
                    artwork: currentRoomData?.pinnedTrack?.artwork || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
                  } : null,
                  dj: {
                    displayName: sessionData.nowPlaying?.addedBy || 'Unknown DJ'
                  },
                  host: {
                    displayName: sessionData.nowPlaying?.addedBy || 'Unknown DJ'
                  }
                };

                // Store the current view before navigating to DJ Mode
                appState.setPreviousView(appState.currentView);

                // Set the active session and navigate to DJ Mode
                appState.setActiveSession(transformedSession);
                appState.setCurrentView('dj');
              }}
            />
          );
        case 'profile':
          return <UserProfile user={auth.currentUser} onUpdateUser={auth.handleUpdateUser} viewingUser={auth.currentUser} isOwnProfile={true} onViewChange={handleViewChangeWithDJMinimize} onBlockUser={dataHandlers.handleBlockUser} onUnblockUser={dataHandlers.handleUnblockUser} isBlocked={dataHandlers.isBlocked} getBlockedUsers={dataHandlers.getBlockedUsers} />;

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
              cratePlayer={cratePlayer}
              onPlayCrate={handlePlayCrate}
              onNextTrack={handleNextTrack}
              onPreviousTrack={handlePreviousTrack}
              onSetCratePlayer={setCratePlayer}
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
              onViewChange={handleViewChangeWithDJMinimize}
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
              onViewChange={handleViewChangeWithDJMinimize}
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
              onViewChange={handleViewChangeWithDJMinimize}
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
              onViewChange={handleViewChangeWithDJMinimize}
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

        case 'drop-detail':
          if (!appState.selectedDropId) {
            appState.setCurrentView('feed');
            return null;
          }
          return (
            <DropDetailView
              dropId={appState.selectedDropId}
              user={auth.currentUser}
              onBack={() => {
                appState.setSelectedDropId(null);
                appState.setCurrentView(appState.previousView || 'feed');
              }}
              onPurchase={(productId) => {
                // TODO: Handle purchase flow
                toast.success('Opening checkout...');
              }}
              onJoinScene={(sceneId) => {
                // Navigate to the scene/room
                appState.setCurrentRoom(sceneId);
                appState.setCurrentView('room');
              }}
            />
          );

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
        <div className="h-screen bg-background flex">

        {/* Desktop Sidebar */}
        {!appState.isMobile && (
          <Sidebar
            user={auth.currentUser}
            currentRoom={appState.currentRoom}
            currentView={appState.currentView}
            onRoomSelect={appState.handleRoomSelect}
            onViewChange={handleViewChangeWithDJMinimize}
            onLogout={auth.handleLogout}
            onCreateClick={() => modals.setShowCreateModal(true)}
            onShowAbout={() => auth.setShowMainApp(false)}
            onOpenSearch={appState.handleOpenSearch}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden">

          {/* Desktop Top Bar */}
          {!appState.isMobile && (
            <TopBar
              onMessagesClick={() => handleViewChangeWithDJMinimize('messages')}
              unreadMessages={getUnreadMessageCount(auth.currentUser?.id || '')}
            />
          )}

          {/* Mobile Header */}
          {appState.isMobile && (
            <>
              {/* Artist Mobile Header */}
              {auth.currentUser?.userType === 'artist' ? (
                <ArtistMobileHeader
                  user={auth.currentUser}
                  currentView={appState.currentView}
                  onViewChange={handleViewChangeWithDJMinimize}
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
                  onViewChange={handleViewChangeWithDJMinimize}
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
          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                {appState.currentView === 'sessions' ? (
                  // Sessions view without motion to prevent scroll issues
                  <div key="sessions">
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
                  onViewChange={handleViewChangeWithDJMinimize}
                  onCreateClick={() => modals.setShowCreateModal(true)}
                />
              ) : (
                /* Fan Mobile Navigation */
                <MobileNavigation
                  currentView={appState.currentView}
                  onViewChange={handleViewChangeWithDJMinimize}
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
            {console.log('🎵 MiniPlayer render check:', {
              currentView: appState.currentView,
              activeSession: !!appState.activeSession,
              isDJMinimized: djSession.isDJMinimized,
              hasDJSession: !!djSession.djSession,
              nowPlaying: !!appState.nowPlaying
            })}

            {/* Active Session Mini Player */}
            {appState.activeSession && appState.activeSession.currentTrack && (
              <MiniPlayer
                track={appState.activeSession.currentTrack}
                isPlaying={appState.activeSession.isPlaying}
                onClose={() => {
                  appState.setActiveSession(null);
                  djSession.setIsDJMinimized(false);
                  djSession.setDJSession(null);
                  toast.info('Left session');
                }}
                isDJSession={true}
                onExpand={() => {
                  appState.setCurrentView('dj');
                }}
                djSession={{
                  ...appState.activeSession,
                  listeners: appState.activeSession.listeners || []
                }}
              />
            )}

            {/* Minimized DJ Session Player */}
            {!appState.activeSession && djSession.isDJMinimized && djSession.djSession && (
              <>
                {console.log('🎵 Rendering minimized DJ session MiniPlayer')}
                <MiniPlayer
                  track={djSession.djSession.currentTrack || appState.nowPlaying}
                  isPlaying={djSession.djSession.isPlaying}
                  onClose={djSession.handleEndDJSession}
                  isDJSession={true}
                  onExpand={() => {
                    // Restore activeSession when expanding
                    appState.setActiveSession(djSession.djSession);
                    djSession.handleExpandDJ();
                  }}
                  djSession={djSession.djSession}
                />
              </>
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

        {/* Crate Player - Shows globally on ALL views when:
             1. There's a track playing AND
             2. Either minimized OR not on the crates view
             This allows the full player to show on the crates detail page when not minimized */}
        {cratePlayer.currentTrack && (cratePlayer.isPlayerMinimized || appState.currentView !== 'crates') && (
          <>
            {console.log('🎵 Rendering global Crate MiniPlayer:', {
              currentView: appState.currentView,
              currentTrack: cratePlayer.currentTrack?.title,
              isPlayerMinimized: cratePlayer.isPlayerMinimized,
              shouldShow: true
            })}
            <MiniPlayer
              track={cratePlayer.currentTrack}
              isPlaying={cratePlayer.isPlaying}
              onPlayPause={(playing) => setCratePlayer(prev => ({ ...prev, isPlaying: playing }))}
              onClose={() => {
                setCratePlayer({
                  currentTrack: null,
                  isPlaying: false,
                  playingCrate: null,
                  currentTrackIndex: 0,
                  isShuffled: false,
                  shuffledIndices: [],
                  isPlayerMinimized: false
                });
              }}
              onExpand={() => {
                if (cratePlayer.playingCrate) {
                  // Navigate to crates view and unminimize the player
                  appState.setCurrentView('crates');
                  setCratePlayer(prev => ({ ...prev, isPlayerMinimized: false }));
                }
              }}
              showControls={true}
              isDJSession={false}
            />
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

        <CreateSessionModal
          open={modals.showCreateSession}
          onOpenChange={modals.setShowCreateSession}
          onSessionCreated={(session, initialTrack) => {
            // Format session data for the DJ view
            const sessionData = {
              ...session,
              title: session.name || 'New Session',
              currentTrack: initialTrack ? {
                title: initialTrack.title,
                artist: initialTrack.artist,
                artwork: initialTrack.artwork,
                duration: initialTrack.duration || '3:30',
                platform: initialTrack.platform || 'spotify'
              } : null,
              listeners: []
            };

            // Navigate to the newly created session
            djSession.handleJoinSession(sessionData);
            modals.setShowCreateSession(false);
          }}
        />

        <CreateModal
          isOpen={modals.showCreateModal}
          onClose={() => modals.setShowCreateModal(false)}
          onCreatePost={modals.handleOpenCreatePost}
          onCreateRoom={modals.handleOpenCreateRoom}
          onCreateCrate={modals.handleOpenCreateCrate}
          onCreateSession={modals.handleOpenCreateSession}
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
          onViewChange={handleViewChangeWithDJMinimize}
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
      
      {/* Login Button - only show if auth is enabled */}
      {import.meta.env.VITE_ENABLE_AUTH !== 'false' && (
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
      )}

      {/* Quick Demo Access Button - only show if auth is enabled and on desktop */}
      {import.meta.env.VITE_ENABLE_AUTH !== 'false' && !appState.isMobile && (
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