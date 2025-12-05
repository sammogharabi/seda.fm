import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileHeaderProps {
  user: any;
  currentChannel: string;
  currentView: string;
  onChannelSelect: (channel: string) => void;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isDJMode: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onComposeClick?: () => void;
}

export function MobileHeader({ 
  user, 
  currentChannel, 
  currentView, 
  onChannelSelect, 
  onViewChange, 
  onLogout, 
  isDJMode,
  sidebarOpen,
  setSidebarOpen,
  onComposeClick
}: MobileHeaderProps) {
  const getViewTitle = () => {
    switch (currentView) {
      case 'feed':
        return 'Feed';
      case 'discover':
        return 'Discover';
      case 'following':
        return 'Following';
      case 'listening':
        return 'Listening';
      case 'channel':
        return currentChannel;
      case 'profile':
        return 'Profile';
      case 'leaderboards':
        return 'Leaderboards';
      case 'playlists':
        return 'Playlists';
      default:
        return 'sedā.fm';
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-safe-top">
      <div className="flex h-14 items-center justify-between px-4 min-h-[44px]">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" aria-describedby="sidebar-description">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription id="sidebar-description" className="sr-only">
              Navigate through different sections of sedā.fm including your feed, discover music, and your profile.
            </SheetDescription>
            <Sidebar 
              user={user}
              currentChannel={currentChannel}
              currentView={currentView}
              onChannelSelect={(channel) => {
                onChannelSelect(channel);
                setSidebarOpen(false);
              }}
              onViewChange={(view) => {
                onViewChange(view);
                setSidebarOpen(false);
              }}
              onLogout={onLogout}
              isDJMode={isDJMode}
              isMobile={true}
              onComposeClick={onComposeClick}
            />
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">S</span>
          </div>
          <h1 className="font-medium text-lg">
            {isDJMode ? `DJ Mode - ${currentChannel}` : getViewTitle()}
          </h1>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </header>
  );
}