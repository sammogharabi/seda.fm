import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { ComposeButton } from './ComposeButton';
import { FollowSuggestions } from './FollowSuggestions';
import { 
  Music, 
  Hash, 
  User, 
  Trophy, 
  List, 
  LogOut,
  Crown,
  Radio,
  Home,
  Compass,
  UserPlus,
  Headphones,
  Mic,
  Heart,
  MessageSquare
} from 'lucide-react';

const JOINED_ROOMS = [
  { id: '#hiphop', name: 'Hip Hop', memberCount: 1247, isActive: true, unreadCount: 3 },
  { id: '#electronic', name: 'Electronic', memberCount: 892, isActive: false, unreadCount: 0 },
  { id: '#ambient', name: 'Ambient', memberCount: 234, isActive: true, unreadCount: 12 },
  { id: '#jazz', name: 'Jazz', memberCount: 567, isActive: false, unreadCount: 1 },
  { id: '@diplo', name: 'Diplo', memberCount: 15643, isActive: true, unreadCount: 5, isArtist: true },
  { id: '@flume', name: 'Flume', memberCount: 8932, isActive: false, unreadCount: 0, isArtist: true }
];

const TRENDING_GENRES = [
  { id: '#rock', name: 'Rock', posts: 145, trend: '+15%' },
  { id: '#pop', name: 'Pop', posts: 210, trend: '+8%' },
  { id: '#indie', name: 'Indie', posts: 89, trend: '+22%' },
  { id: '#house', name: 'House', posts: 67, trend: '+5%' }
];

const SUGGESTED_FRIENDS = [
  { username: 'odesza', displayName: 'ODESZA', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=odesza', verified: true, mutualFriends: 15 },
  { username: 'disclosure', displayName: 'Disclosure', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=disclosure', verified: true, mutualFriends: 8 },
  { username: 'bonobo', displayName: 'Bonobo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bonobo', verified: true, mutualFriends: 12 }
];

export function Sidebar({ 
  user, 
  currentChannel, 
  currentView, 
  onChannelSelect, 
  onViewChange, 
  onLogout,
  isDJMode,
  isMobile = false,
  onComposeClick,
  onFollowUser,
  followingList = []
}) {
  const navigation = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'following', label: 'Following', icon: UserPlus },
    { id: 'listening', label: 'Listening', icon: Headphones },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'playlists', label: 'Playlists', icon: List }
  ].filter(item => {
    // On mobile, only show "Home"
    if (isMobile) {
      return item.id === 'feed';
    }
    // On desktop, show all navigation items
    return true;
  });

  return (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col shadow-sm h-full`}>
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border">
        {!isMobile && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-medium text-foreground">
              sedā.fm
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-xl">
          <Avatar className="w-10 h-10 shadow-sm">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{user.username}</p>
              {user.verified && <Crown className="w-4 h-4 text-ring" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{user.djPoints.toLocaleString()} DJ Points</p>
          </div>
        </div>
      </div>

      {/* DJ Mode Status */}
      {isDJMode && (
        <div className="p-4 bg-ring/10 border-b border-sidebar-border">
          <div className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm">
            <Radio className="w-5 h-5 text-ring animate-pulse" />
            <span className="text-sm font-medium text-ring">DJ Mode Active</span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {/* Compose Button */}
        {!isMobile && onComposeClick && (
          <div className="p-4">
            <ComposeButton onClick={onComposeClick} isMobile={false} />
          </div>
        )}

        {/* Navigation */}
        <div className="p-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-11 text-sm hover:bg-sidebar-accent transition-colors duration-150"
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Joined Rooms */}
        <div className="p-4">
          <h4 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">My Rooms</h4>
          <div className="space-y-1">
            {JOINED_ROOMS.map((room) => (
              <Button
                key={room.id}
                variant={currentChannel === room.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-10 text-sm hover:bg-sidebar-accent transition-colors duration-150 relative"
                onClick={() => {
                  onChannelSelect(room.id);
                  onViewChange('channel');
                }}
              >
                {room.isArtist ? (
                  <Crown className="w-4 h-4 mr-3 text-ring" />
                ) : (
                  <Hash className="w-4 h-4 mr-3 text-muted-foreground" />
                )}
                <span className="flex-1 text-left truncate">{room.name}</span>
                
                <div className="flex items-center gap-2">
                  {room.isActive && (
                    <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  )}
                  {room.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {room.memberCount.toLocaleString()}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="p-4">
          <h4 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</h4>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start h-10 shadow-sm bg-ring/5 border-ring/20 hover:bg-ring/10" 
              size="sm"
            >
              <Mic className="w-4 h-4 mr-2 text-ring" />
              Start DJ Session
            </Button>
            <Button variant="outline" className="w-full justify-start h-10 shadow-sm" size="sm">
              <Music className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        </div>

        <Separator />
        <div className="p-4">
          <h4 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Discover Rooms</h4>
          <div className="space-y-1">
            {TRENDING_GENRES.map((genre) => (
              <Button
                key={genre.id}
                variant="ghost"
                className="w-full justify-start h-10 text-sm hover:bg-sidebar-accent transition-colors duration-150"
                onClick={() => {
                  onChannelSelect(genre.id);
                  onViewChange('discover');
                }}
              >
                <Hash className="w-4 h-4 mr-3 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <div className="truncate">{genre.name}</div>
                  <div className="text-xs text-muted-foreground">{genre.posts} posts • {genre.trend}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Suggested Friends */}
        {onFollowUser && (
          <div className="p-4">
            <FollowSuggestions
              onFollowUser={onFollowUser}
              followingList={followingList}
              maxSuggestions={2}
              showHeader={true}
              compact={true}
            />
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}