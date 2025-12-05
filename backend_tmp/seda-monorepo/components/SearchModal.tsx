import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  User, 
  Music, 
  Hash, 
  TrendingUp, 
  Clock,
  Play,
  Users,
  Crown,
  Disc,
  Radio,
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_SEARCH_RESULTS = {
  users: [
    {
      id: 1,
      username: 'dj_nova',
      displayName: 'DJ Nova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova',
      verified: true,
      followers: 1247,
      bio: 'Electronic music producer and DJ'
    },
    {
      id: 2,
      username: 'beatmaster_99',
      displayName: 'Beat Master',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster',
      followers: 892,
      bio: 'Hip-hop beats and underground vibes'
    }
  ],
  tracks: [
    {
      id: 1,
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?w=300&h=300&fit=crop',
      duration: '4:03',
      plays: 15420
    },
    {
      id: 2,
      title: 'Strobe',
      artist: 'Deadmau5',
      artwork: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?w=300&h=300&fit=crop',
      duration: '10:36',
      plays: 28540
    }
  ],
  channels: [
    {
      id: 1,
      name: '#electronic',
      description: 'Electronic music and EDM',
      members: 2847,
      isLive: true,
      currentDJ: 'synthesizer_soul'
    },
    {
      id: 2,
      name: '#hiphop',
      description: 'Hip-hop, rap, and urban beats',
      members: 1924,
      isLive: false
    }
  ],
  trending: [
    'synthwave',
    'lofi beats',
    'underground',
    'live sessions',
    'collaboration'
  ]
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (user: any) => void;
  onSelectTrack?: (track: any) => void;
  onSelectChannel?: (channel: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectUser, onSelectTrack, onSelectChannel }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [recentSearches] = useState(['dj_nova', 'electronic beats', '#hiphop']);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return { users: [], tracks: [], channels: [] };
    
    const searchTerm = query.toLowerCase();
    
    return {
      users: MOCK_SEARCH_RESULTS.users.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.displayName.toLowerCase().includes(searchTerm) ||
        user.bio.toLowerCase().includes(searchTerm)
      ),
      tracks: MOCK_SEARCH_RESULTS.tracks.filter(track =>
        track.title.toLowerCase().includes(searchTerm) ||
        track.artist.toLowerCase().includes(searchTerm)
      ),
      channels: MOCK_SEARCH_RESULTS.channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm) ||
        channel.description.toLowerCase().includes(searchTerm)
      )
    };
  }, [query]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users, tracks, channels..."
                  className="pl-10 pr-10 h-12 bg-input-background border-border"
                  autoFocus
                />
                {query && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-hidden">
            {!query ? (
              /* Recent Searches & Trending */
              <div className="p-6 space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <motion.div
                          key={search}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearch(search)}
                            className="text-xs"
                          >
                            {search}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_SEARCH_RESULTS.trending.map((trend, index) => (
                      <motion.div
                        key={trend}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSearch(trend)}
                          className="text-xs"
                        >
                          #{trend}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Search Results */
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="tracks">Tracks</TabsTrigger>
                    <TabsTrigger value="channels">Channels</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabsContent value="all" className="mt-0 space-y-6">
                          {/* Users Section */}
                          {filteredResults.users.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Users ({filteredResults.users.length})
                              </h4>
                              <div className="space-y-2">
                                {filteredResults.users.slice(0, 3).map((user) => (
                                  <UserSearchResult 
                                    key={user.id} 
                                    user={user} 
                                    onSelect={onSelectUser}
                                    onClose={handleClose}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tracks Section */}
                          {filteredResults.tracks.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Music className="w-4 h-4" />
                                Tracks ({filteredResults.tracks.length})
                              </h4>
                              <div className="space-y-2">
                                {filteredResults.tracks.slice(0, 3).map((track) => (
                                  <TrackSearchResult 
                                    key={track.id} 
                                    track={track} 
                                    onSelect={onSelectTrack}
                                    onClose={handleClose}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Channels Section */}
                          {filteredResults.channels.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Channels ({filteredResults.channels.length})
                              </h4>
                              <div className="space-y-2">
                                {filteredResults.channels.map((channel) => (
                                  <ChannelSearchResult 
                                    key={channel.id} 
                                    channel={channel} 
                                    onSelect={onSelectChannel}
                                    onClose={handleClose}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="users" className="mt-0">
                          <div className="space-y-2">
                            {filteredResults.users.map((user) => (
                              <UserSearchResult 
                                key={user.id} 
                                user={user} 
                                onSelect={onSelectUser}
                                onClose={handleClose}
                              />
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="tracks" className="mt-0">
                          <div className="space-y-2">
                            {filteredResults.tracks.map((track) => (
                              <TrackSearchResult 
                                key={track.id} 
                                track={track} 
                                onSelect={onSelectTrack}
                                onClose={handleClose}
                              />
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="channels" className="mt-0">
                          <div className="space-y-2">
                            {filteredResults.channels.map((channel) => (
                              <ChannelSearchResult 
                                key={channel.id} 
                                channel={channel} 
                                onSelect={onSelectChannel}
                                onClose={handleClose}
                              />
                            ))}
                          </div>
                        </TabsContent>
                      </motion.div>
                    </AnimatePresence>

                    {/* No Results */}
                    {query && Object.values(filteredResults).every(arr => arr.length === 0) && (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-medium mb-2">No results found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search terms or explore trending topics
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserSearchResult({ user, onSelect, onClose }: { user: any, onSelect?: (user: any) => void, onClose: () => void }) {
  const handleClick = () => {
    onSelect?.(user);
    onClose();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.1 }}
    >
      <Card className="cursor-pointer hover:border-ring/30 transition-all duration-200" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.displayName}</span>
                {user.verified && <Crown className="w-4 h-4 text-ring" />}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.bio}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{user.followers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">followers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TrackSearchResult({ track, onSelect, onClose }: { track: any, onSelect?: (track: any) => void, onClose: () => void }) {
  const handleClick = () => {
    onSelect?.(track);
    onClose();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.1 }}
    >
      <Card className="cursor-pointer hover:border-ring/30 transition-all duration-200" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img src={track.artwork} alt={track.title} className="w-10 h-10 rounded object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{track.title}</h4>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{track.duration}</div>
              <div className="text-xs text-muted-foreground">{track.plays.toLocaleString()} plays</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChannelSearchResult({ channel, onSelect, onClose }: { channel: any, onSelect?: (channel: string) => void, onClose: () => void }) {
  const handleClick = () => {
    onSelect?.(channel.name);
    onClose();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.1 }}
    >
      <Card className="cursor-pointer hover:border-ring/30 transition-all duration-200" onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <Hash className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{channel.name}</h4>
                {channel.isLive && (
                  <Badge variant="secondary" className="bg-ring/20 text-ring text-xs">
                    <Radio className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{channel.description}</p>
              {channel.currentDJ && (
                <p className="text-xs text-muted-foreground">DJ: {channel.currentDJ}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{channel.members.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}