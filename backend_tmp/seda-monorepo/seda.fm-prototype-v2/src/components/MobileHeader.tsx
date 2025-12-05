import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MessageCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileHeaderProps {
  user: any;
  currentRoom: string;
  currentView: string;
  onRoomSelect: (room: string) => void;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onCreateClick?: () => void;
  onCreateRoomClick?: () => void;
  userRooms?: any[];
  joinedRooms?: any[];
  onShowAbout?: () => void;
  onOpenSearch?: () => void;
}

export function MobileHeader({ 
  user, 
  currentRoom, 
  currentView, 
  onRoomSelect, 
  onViewChange, 
  onLogout, 
  sidebarOpen,
  setSidebarOpen,
  onCreateClick,
  onCreateRoomClick,
  userRooms = [],
  joinedRooms = [],
  onShowAbout,
  onOpenSearch
}: MobileHeaderProps) {
  

  const getViewTitle = () => {
    switch (currentView) {
      case 'feed':
        return 'Feed';
      case 'discover':
        return 'Discover';
      case 'following':
        return 'Following';
      case 'rooms':
        return 'Rooms';
      case 'sessions':
        return 'Sessions';
      case 'room':
        return currentRoom;
      case 'profile':
        return 'Profile';
      case 'leaderboards':
        return 'Leaderboards';
      case 'crates':
        return 'Crates';
      default:
        return 'sedā.fm';
    }
  };
  
  return (
    <header className="mobile-header sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur-sm pt-safe">
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
                  currentRoom={currentRoom}
                  currentView={currentView}
                  onRoomSelect={(room) => {
                    onRoomSelect(room);
                    setSidebarOpen(false);
                  }}
                  onViewChange={(view) => {
                    onViewChange(view);
                    setSidebarOpen(false);
                  }}
                  onLogout={onLogout}
                  onCreateClick={() => {
                    onCreateClick();
                    setSidebarOpen(false);
                  }}
                  onCreateRoomClick={() => {
                    onCreateRoomClick();
                    setSidebarOpen(false);
                  }}
                  onFollowUser={() => {}}
                  followingList={[]}
                  userRooms={userRooms}
                  joinedRooms={joinedRooms}
                  onShowAbout={() => {
                    onShowAbout();
                    setSidebarOpen(false);
                  }}
                  onOpenSearch={() => {
                    onOpenSearch();
                    setSidebarOpen(false);
                  }}
                  isMobile={true}
                />
              </div>
            </div>
          </>,
          document.body
        )}

        
        {/* Center: Title - Absolutely Positioned for True Centering */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h1 className="font-semibold text-lg text-center whitespace-nowrap">
            {currentView === 'dj' ? 'Session Live' : getViewTitle()}
          </h1>
          {currentView === 'dj' && (
            <div className="text-xs text-accent-coral text-center">
              On Air • {currentRoom}
            </div>
          )}
        </div>
        
        {/* Right: Search Button + Messages */}
        <div className="ml-auto flex items-center gap-2">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center justify-center h-auto min-h-[44px] px-3 py-2 text-foreground hover:text-accent-coral transition-colors rounded-lg active:scale-95"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              type="button"
            >
              <Search className="w-4 h-4" />
              <span className="sr-only">Search</span>
            </button>
          )}

          {/* Messages Button - Far Right */}
          <button
            onClick={() => onViewChange('messages')}
            className="flex items-center justify-center h-auto min-h-[44px] px-3 py-2 text-foreground hover:text-accent-coral transition-colors rounded-lg active:scale-95"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            type="button"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="sr-only">Messages</span>
          </button>
        </div>
      </div>
    </header>
  );
}