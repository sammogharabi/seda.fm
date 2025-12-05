import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Music, 
  Hash, 
  User, 
  Trophy, 
  List, 
  Settings, 
  LogOut,
  Crown,
  Radio,
  Lock
} from 'lucide-react';

const PUBLIC_CHANNELS = [
  { id: '#hiphop', name: 'Hip Hop', memberCount: 1247, color: '#ff6b6b' },
  { id: '#electronic', name: 'Electronic', memberCount: 892, color: '#4ecdc4' },
  { id: '#rock', name: 'Rock', memberCount: 1456, color: '#45b7d1' },
  { id: '#pop', name: 'Pop', memberCount: 2103, color: '#f9ca24' },
  { id: '#jazz', name: 'Jazz', memberCount: 567, color: '#6c5ce7' },
  { id: '#ambient', name: 'Ambient', memberCount: 234, color: '#a29bfe' },
  { id: '#indie', name: 'Indie', memberCount: 789, color: '#fd79a8' },
  { id: '#house', name: 'House', memberCount: 445, color: '#00b894' }
];

const ARTIST_CHANNELS = [
  { id: '@diplo', name: 'Diplo', isVerified: true, memberCount: 15643 },
  { id: '@flume', name: 'Flume', isVerified: true, memberCount: 8932 },
  { id: '@odesza', name: 'ODESZA', isVerified: true, memberCount: 12456 }
];

export function Sidebar({ 
  user, 
  currentChannel, 
  currentView, 
  onChannelSelect, 
  onViewChange, 
  onLogout,
  isDJMode 
}) {
  const navigation = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'playlists', label: 'Playlists', icon: List }
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-6 h-6" style={{ color: '#00ff88' }} />
          <span className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
            sedā.fm
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate">{user.username}</p>
              {user.verified && <Crown className="w-3 h-3 text-yellow-500" />}
            </div>
            <p className="text-xs text-muted-foreground">{user.djPoints} DJ Points</p>
          </div>
        </div>
      </div>

      {/* DJ Mode Status */}
      {isDJMode && (
        <div className="p-3 bg-gradient-to-r from-[#00ff88]/20 to-[#00ccff]/20 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00ff88] animate-pulse" />
            <span className="text-sm text-[#00ff88]">DJ Mode Active</span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {/* Navigation */}
        <div className="p-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Public Channels */}
        <div className="p-3">
          <h4 className="mb-2 text-sm text-muted-foreground">Public Channels</h4>
          <div className="space-y-1">
            {PUBLIC_CHANNELS.map((channel) => (
              <Button
                key={channel.id}
                variant={currentChannel === channel.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  onChannelSelect(channel.id);
                  onViewChange('channel');
                }}
              >
                <Hash 
                  className="w-4 h-4 mr-2" 
                  style={{ color: channel.color }}
                />
                <span className="flex-1 text-left truncate">{channel.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {channel.memberCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Artist Channels */}
        <div className="p-3">
          <h4 className="mb-2 text-sm text-muted-foreground">Artist Hubs</h4>
          <div className="space-y-1">
            {ARTIST_CHANNELS.map((channel) => (
              <Button
                key={channel.id}
                variant={currentChannel === channel.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  onChannelSelect(channel.id);
                  onViewChange('channel');
                }}
              >
                <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="flex-1 text-left truncate">{channel.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {channel.memberCount}
                </Badge>
              </Button>
            ))}
          </div>

          {user.isArtist && (
            <Button variant="outline" className="w-full mt-2" size="sm">
              <Lock className="w-4 h-4 mr-2" />
              Create Private Hub
            </Button>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}