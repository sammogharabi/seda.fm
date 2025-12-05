import React from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Bell, TrendingUp, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface ArtistMobileHeaderProps {
  user: any;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onCreateClick?: () => void;
  onShowAbout?: () => void;
  unreadMessages?: number;
  notifications?: number;
}

export function ArtistMobileHeader({ 
  user, 
  currentView, 
  onViewChange, 
  onLogout, 
  sidebarOpen,
  setSidebarOpen,
  onCreateClick,
  onShowAbout,
  unreadMessages = 0,
  notifications = 0
}: ArtistMobileHeaderProps) {
  
  const getViewTitle = () => {
    switch (currentView) {
      case 'feed':
        return 'Feed';
      case 'artist-dashboard':
        return 'Dashboard';
      case 'artist-analytics':
        return 'Analytics';
      case 'artist-store':
      case 'artist-store-tracks':
      case 'artist-store-analytics':
        return 'Store';
      case 'artist-fans':
        return 'Fans';
      case 'artist-revenue':
        return 'Revenue';
      case 'sessions':
        return 'Live Sessions';
      case 'messages':
        return 'Messages';
      case 'profile':
        return 'Profile';
      default:
        return 'sedā.fm';
    }
  };

  const isLiveSession = currentView === 'dj' || currentView === 'sessions';
  
  return (
    <header className="artist-mobile-header sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur-sm pt-safe">
      <div className="relative flex h-16 items-center px-4 min-h-[44px] max-w-screen-sm mx-auto">
        {/* Left: Menu Button */}
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center px-3 py-2 h-auto min-h-[44px] text-xs font-black tracking-wider uppercase text-foreground hover:text-accent-coral transition-colors rounded-lg active:scale-95"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            type="button"
          >
            MENU
            <span className="sr-only">Toggle sidebar</span>
          </button>
        </div>

        {/* Mobile Sidebar Portal */}
        {typeof document !== 'undefined' && sidebarOpen && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="mobile-sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="mobile-sidebar-panel">
              {/* Close button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-foreground/60 hover:text-foreground p-2"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  ✕
                </button>
              </div>
              
              {/* Sidebar content */}
              <div className="flex-1 overflow-y-auto p-0">
                <Sidebar
                  user={user}
                  currentRoom=""
                  currentView={currentView}
                  onRoomSelect={() => {}}
                  onViewChange={(view) => {
                    onViewChange(view);
                    setSidebarOpen(false);
                  }}
                  onLogout={onLogout}
                  onCreateClick={() => {
                    onCreateClick?.();
                    setSidebarOpen(false);
                  }}
                  onCreateRoomClick={() => {}}
                  onFollowUser={() => {}}
                  followingList={[]}
                  userRooms={[]}
                  joinedRooms={[]}
                  onShowAbout={() => {
                    onShowAbout?.();
                    setSidebarOpen(false);
                  }}
                  onOpenSearch={() => {}}
                  isMobile={true}
                />
              </div>
            </div>
          </>,
          document.body
        )}

        {/* Center: Title with Live Indicator */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2">
            {isLiveSession && (
              <div className="w-2 h-2 bg-accent-coral rounded-full animate-pulse"></div>
            )}
            <h1 className="font-semibold text-lg text-center whitespace-nowrap">
              {isLiveSession ? 'LIVE' : getViewTitle()}
            </h1>
          </div>
          {isLiveSession && (
            <div className="text-xs text-accent-coral text-center">
              Broadcasting
            </div>
          )}
        </div>
        
        {/* Right: Artist Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Analytics Quick Access */}
          <button
            onClick={() => onViewChange('artist-analytics')}
            className="flex items-center justify-center h-auto min-h-[44px] px-3 py-2 text-foreground hover:text-accent-mint transition-colors rounded-lg active:scale-95"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            type="button"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="sr-only">Analytics</span>
          </button>

          {/* Notifications */}
          <button
            className="relative flex items-center justify-center h-auto min-h-[44px] px-3 py-2 text-foreground hover:text-accent-yellow transition-colors rounded-lg active:scale-95"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            type="button"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-coral text-background text-xs rounded-full flex items-center justify-center font-medium">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </button>

          {/* Messages */}
          <button
            onClick={() => onViewChange('messages')}
            className="relative flex items-center justify-center h-auto min-h-[44px] px-3 py-2 text-foreground hover:text-accent-coral transition-colors rounded-lg active:scale-95"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            type="button"
          >
            <MessageCircle className="w-4 h-4" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-coral text-background text-xs rounded-full flex items-center justify-center font-medium">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
            <span className="sr-only">Messages</span>
          </button>
        </div>
      </div>
    </header>
  );
}