import React from 'react';
import { Button } from './ui/button';

import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { ComposeButton } from './ComposeButton';

import {
  Music,
  Hash,
  User,
  Crown,
  Home,
  Compass,
  Headphones,
  Info,
  ShoppingBag,
  LogOut,
  List,
  Search,
  MessageCircle,
  MessageSquare,
  Users,
  Rss,
  Settings
} from 'lucide-react';



const TRENDING_GENRES = [
  { id: '#rock', name: 'Rock', posts: 145, trend: '+15%' },
  { id: '#pop', name: 'Pop', posts: 210, trend: '+8%' },
  { id: '#indie', name: 'Indie', posts: 89, trend: '+22%' },
  { id: '#house', name: 'House', posts: 67, trend: '+5%' }
];

export function Sidebar({ 
  user, 
  currentRoom, 
  currentView, 
  onRoomSelect, 
  onViewChange, 
  onLogout,
  isMobile = false,
  onCreateClick,
  onShowAbout,
  onOpenSearch
}) {
  // Navigation items based on user type
  const fanNavigation = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'search', label: 'Search', icon: Search, action: onOpenSearch },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'rooms', label: 'Rooms', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Headphones },
    { id: 'crates', label: 'Crates', icon: List }
  ];

  const artistNavigation = [
    { id: 'artist-dashboard', label: 'Dashboard', icon: Home },
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'search', label: 'Search', icon: Search, action: onOpenSearch },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'rooms', label: 'Rooms', icon: Users },
    { id: 'artist-store', label: 'Store', icon: ShoppingBag },
    { id: 'artist-fans', label: 'Fans', icon: User },
    { id: 'sessions', label: 'Sessions', icon: Headphones }
  ];

  const navigation = user?.userType === 'artist' ? artistNavigation : fanNavigation;



  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} bg-card ${isMobile ? '' : 'rounded-r-xl'} border-r border-foreground/10 flex flex-col h-full`}>
      {/* Professional Header */}
      <div className={`p-6 border-b border-foreground/10 ${isMobile ? '' : 'rounded-tr-xl'}`}>
        {!isMobile && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-accent-coral flex items-center justify-center rounded-lg border border-foreground/10">
              <Music className="w-4 h-4 text-background" />
            </div>
            <div>
              <span className="text-xl font-semibold text-foreground">
                sedā.fm
              </span>
            </div>
          </div>
        )}
        
        {/* Professional User Profile - Clickable */}
        <button 
          className="flex items-center gap-3 w-full text-left p-3 -m-2 rounded-lg hover:bg-secondary/50 transition-colors group border border-transparent hover:border-foreground/10"
          onClick={() => onViewChange(user?.userType === 'artist' ? 'artist-dashboard-profile' : 'profile')}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="truncate font-medium group-hover:text-accent-coral transition-colors">{user.username}</p>
              {user.verified && <Crown className="w-4 h-4 text-accent-yellow" />}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.points?.toLocaleString() || '0'} Points
            </div>
          </div>
          <User className="w-4 h-4 text-muted-foreground group-hover:text-accent-coral transition-colors opacity-0 group-hover:opacity-100" />
        </button>
      </div>



      <ScrollArea className="flex-1">
        {/* Create Button */}
        {!isMobile && onCreateClick && (
          <div className="p-4">
            <ComposeButton onClick={onCreateClick} isMobile={false} />
          </div>
        )}

        {/* Navigation */}
        <div className="p-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-3 px-2">Navigate</h4>
          <div className="space-y-1">
            {navigation.map((item) => (
              isMobile ? (
                <button
                  key={item.id}
                  className={`w-full flex items-center justify-start h-12 min-h-[44px] px-3 text-sm font-medium transition-all rounded-lg active:scale-95 border ${
                    currentView === item.id 
                      ? 'bg-accent-coral/10 text-accent-coral border-accent-coral/20' 
                      : 'text-foreground hover:bg-secondary/50 border-transparent hover:border-foreground/10'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Mobile Sidebar navigation clicked:', item.id, 'isMobile:', isMobile);
                    console.log('🔘 Event details:', { 
                      button: e.button, 
                      type: e.type, 
                      target: e.target.tagName,
                      clientX: e.clientX,
                      clientY: e.clientY
                    });
                    if (item.action) {
                      console.log('🔘 Executing action for:', item.id);
                      item.action();
                    } else {
                      console.log('🔘 Calling onViewChange for:', item.id);
                      onViewChange(item.id);
                    }
                  }}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  type="button"
                >
                  <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  {item.label}
                </button>
              ) : (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start h-10 text-sm transition-all rounded-lg border ${
                    currentView === item.id 
                      ? 'bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20 border-accent-coral/20' 
                      : 'hover:bg-secondary/50 border-transparent hover:border-foreground/10'
                  }`}
                  onClick={() => {
                    console.log('🔘 Sidebar navigation clicked:', item.id, 'isMobile:', isMobile);
                    if (item.action) {
                      console.log('🔘 Executing action for:', item.id);
                      item.action();
                    } else {
                      console.log('🔘 Calling onViewChange for:', item.id);
                      onViewChange(item.id);
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            ))}
          </div>
        </div>

        <Separator />

        {/* Trending Genres */}
        <div className="p-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-3 px-2">Trending Rooms</h4>
          <div className="space-y-2">
            {TRENDING_GENRES.map((genre) => (
              isMobile ? (
                <button
                  key={genre.id}
                  className="w-full p-3 text-left border border-transparent hover:border-foreground/10 hover:bg-secondary/50 transition-all rounded-lg active:scale-95"
                  onClick={() => {
                    onRoomSelect(genre.id);
                  }}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium">{genre.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {genre.posts} posts • {genre.trend} this week
                  </div>
                </button>
              ) : (
                <div
                  key={genre.id}
                  className="p-3 border border-transparent hover:border-foreground/10 hover:bg-secondary/50 transition-all cursor-pointer rounded-lg"
                  onClick={() => {
                    onRoomSelect(genre.id);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{genre.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {genre.posts} posts • {genre.trend} this week
                  </div>
                </div>
              )
            ))}
          </div>
        </div>


      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-foreground/10 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-sm rounded-lg border border-transparent hover:border-foreground/10"
          onClick={onShowAbout}
        >
          <Info className="w-4 h-4 mr-3" />
          About sedā.fm
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-sm rounded-lg border border-transparent hover:border-foreground/10"
          onClick={() => window.open('https://seda.printful.me', '_blank')}
        >
          <ShoppingBag className="w-4 h-4 mr-3" />
          Merch Store
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-sm rounded-lg border border-transparent hover:border-foreground/10"
          onClick={() => onViewChange('feedback')}
        >
          <MessageSquare className="w-4 h-4 mr-3" />
          Feedback
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-sm rounded-lg border border-transparent hover:border-foreground/10"
          onClick={() => onViewChange('settings')}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-sm text-muted-foreground hover:text-destructive rounded-lg border border-transparent hover:border-destructive/20"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}