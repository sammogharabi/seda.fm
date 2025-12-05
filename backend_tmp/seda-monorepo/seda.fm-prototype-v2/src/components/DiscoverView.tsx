import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { FollowSuggestions } from './FollowSuggestions';
import { SessionsView } from './SessionsView';
import { ShoppingBag, MapPin, Calendar, Users, Music, Palette, Radio } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const TRENDING_TRACKS = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    plays: 45200,
    likes: 3200,
    room: 'Pop'
  },
  {
    id: 2,
    title: 'Levitating',
    artist: 'Dua Lipa',
    artwork: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    plays: 38900,
    likes: 2800,
    room: 'Pop'
  },
  {
    id: 3,
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    artwork: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    plays: 42100,
    likes: 3500,
    room: 'Hip Hop'
  }
];

const TRENDING_ARTISTS = [
  {
    id: 1,
    username: 'theweeknd',
    displayName: 'The Weeknd',
    verified: true,
    followers: 2400000,
    monthlyListeners: 85600000,
    topRoom: 'R&B'
  },
  {
    id: 2,
    username: 'dualipa',
    displayName: 'Dua Lipa',
    verified: true,
    followers: 1800000,
    monthlyListeners: 72300000,
    topRoom: 'Pop'
  },
  {
    id: 3,
    username: 'kidlaroi',
    displayName: 'The Kid LAROI',
    verified: true,
    followers: 950000,
    monthlyListeners: 45200000,
    topRoom: 'Hip Hop'
  }
];

const TRENDING_ROOMS = [
  { name: 'Hip Hop', id: '#hiphop', posts: 12400, members: 8400, growth: '+15%', color: 'bg-accent-coral' },
  { name: 'Electronic', id: '#electronic', posts: 8900, members: 5200, growth: '+12%', color: 'bg-accent-blue' },
  { name: 'Pop', id: '#pop', posts: 21000, members: 15600, growth: '+8%', color: 'bg-accent-mint' },
  { name: 'R&B', id: '#rb', posts: 6700, members: 4100, growth: '+22%', color: 'bg-accent-yellow' },
  { name: 'Rock', id: '#rock', posts: 14500, members: 9800, growth: '+5%', color: 'bg-accent-coral' },
  { name: 'Jazz', id: '#jazz', posts: 3200, members: 2800, growth: '+18%', color: 'bg-accent-blue' }
];

const TRENDING_MERCH = [
  {
    id: 1,
    name: 'After Hours Tour Hoodie',
    artist: 'The Weeknd',
    artistUsername: 'theweeknd',
    price: 75,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    category: 'Apparel',
    inStock: true,
    sales: 342
  },
  {
    id: 2,
    name: 'Future Nostalgia Vinyl',
    artist: 'Dua Lipa',
    artistUsername: 'dualipa',
    price: 35,
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400',
    category: 'Vinyl',
    inStock: true,
    sales: 567
  },
  {
    id: 3,
    name: 'Tour 2024 T-Shirt',
    artist: 'The Kid LAROI',
    artistUsername: 'kidlaroi',
    price: 40,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
    category: 'Apparel',
    inStock: true,
    sales: 234
  },
  {
    id: 4,
    name: 'Starboy Poster Set',
    artist: 'The Weeknd',
    artistUsername: 'theweeknd',
    price: 25,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400',
    category: 'Accessories',
    inStock: true,
    sales: 189
  },
  {
    id: 5,
    name: 'Limited Edition Cap',
    artist: 'Dua Lipa',
    artistUsername: 'dualipa',
    price: 30,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    category: 'Accessories',
    inStock: false,
    sales: 423
  },
  {
    id: 6,
    name: 'Signed Album Bundle',
    artist: 'The Kid LAROI',
    artistUsername: 'kidlaroi',
    price: 85,
    image: 'https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=400',
    category: 'Bundles',
    inStock: true,
    sales: 156
  }
];

const UPCOMING_SHOWS = [
  {
    id: 1,
    artist: 'The Weeknd',
    artistUsername: 'theweeknd',
    tourName: 'After Hours Til Dawn Tour',
    venue: 'Madison Square Garden',
    city: 'New York',
    state: 'NY',
    date: new Date('2025-03-15'),
    price: 125,
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    ticketsAvailable: true,
    soldOut: false
  },
  {
    id: 2,
    artist: 'Dua Lipa',
    artistUsername: 'dualipa',
    tourName: 'Future Nostalgia Tour',
    venue: 'The Forum',
    city: 'Los Angeles',
    state: 'CA',
    date: new Date('2025-03-22'),
    price: 95,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    ticketsAvailable: true,
    soldOut: false
  },
  {
    id: 3,
    artist: 'The Kid LAROI',
    artistUsername: 'kidlaroi',
    tourName: 'End of the World Tour',
    venue: 'United Center',
    city: 'Chicago',
    state: 'IL',
    date: new Date('2025-04-05'),
    price: 75,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
    ticketsAvailable: true,
    soldOut: false
  },
  {
    id: 4,
    artist: 'The Weeknd',
    artistUsername: 'theweeknd',
    tourName: 'After Hours Til Dawn Tour',
    venue: 'TD Garden',
    city: 'Boston',
    state: 'MA',
    date: new Date('2025-04-12'),
    price: 135,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    ticketsAvailable: false,
    soldOut: true
  },
  {
    id: 5,
    artist: 'Dua Lipa',
    artistUsername: 'dualipa',
    tourName: 'Future Nostalgia Tour',
    venue: 'American Airlines Arena',
    city: 'Miami',
    state: 'FL',
    date: new Date('2025-04-20'),
    price: 110,
    image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400',
    ticketsAvailable: true,
    soldOut: false
  },
  {
    id: 6,
    artist: 'The Kid LAROI',
    artistUsername: 'kidlaroi',
    tourName: 'End of the World Tour',
    venue: 'Red Rocks Amphitheatre',
    city: 'Denver',
    state: 'CO',
    date: new Date('2025-05-01'),
    price: 89,
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400',
    ticketsAvailable: true,
    soldOut: false
  }
];

export function DiscoverView({ 
  user, 
  onNowPlaying, 
  onFollowUser, 
  onUnfollowUser, 
  isFollowing, 
  followingList = [], 
  onRoomSelect,
  onViewArtistProfile,
  onViewFanProfile,
  mockArtists = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-primary mb-2">Discover</h1>
              <p className="text-muted-foreground">
                Explore trending music, artists, and rooms
              </p>
            </div>

          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
              SEARCH
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, artists, rooms..."
              className="pl-20 h-12"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-8">
          <Button
            variant={activeTab === 'people' ? 'default' : 'outline'}
            onClick={() => setActiveTab('people')}
            className={activeTab === 'people' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            People
          </Button>
          <Button
            variant={activeTab === 'tracks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tracks')}
            className={activeTab === 'tracks' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Music className="w-4 h-4 mr-2" />
            Tracks
          </Button>
          <Button
            variant={activeTab === 'artists' ? 'default' : 'outline'}
            onClick={() => setActiveTab('artists')}
            className={activeTab === 'artists' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Palette className="w-4 h-4 mr-2" />
            Artists
          </Button>
          <Button
            variant={activeTab === 'rooms' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rooms')}
            className={activeTab === 'rooms' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Radio className="w-4 h-4 mr-2" />
            Rooms
          </Button>
          <Button
            variant={activeTab === 'merch' ? 'default' : 'outline'}
            onClick={() => setActiveTab('merch')}
            className={activeTab === 'merch' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Merch
          </Button>
          <Button
            variant={activeTab === 'shows' ? 'default' : 'outline'}
            onClick={() => setActiveTab('shows')}
            className={activeTab === 'shows' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Shows
          </Button>
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
            className={activeTab === 'sessions' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Sessions
          </Button>
        </div>

        {/* People Section */}
        {activeTab === 'people' && (
          <div>
            <FollowSuggestions
              onFollowUser={onFollowUser}
              followingList={followingList}
              maxSuggestions={6}
              showHeader={true}
              compact={false}
              onViewFanProfile={onViewFanProfile}
            />
            
            {followingList.length > 0 && (
              <div className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Recently followed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followingList.slice(0, 6).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-secondary/30 border border-foreground/10 hover:border-foreground/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-coral text-background flex items-center justify-center font-semibold border border-foreground/20">
                              {(user.displayName?.[0] || user.username[0]).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => onViewFanProfile?.({
                                    id: user.id || `fan-${user.username}`,
                                    username: user.username,
                                    displayName: user.displayName || user.username,
                                    verified: user.verified || false,
                                    verificationStatus: 'not-requested',
                                    points: Math.floor(Math.random() * 2000) + 100,
                                    accentColor: user.accentColor || 'coral',
                                    bio: `Music lover and community member`,
                                    location: 'Unknown',
                                    joinedDate: new Date('2024-01-15'),
                                    genres: ['Various'],
                                    connectedServices: ['Spotify'],
                                    isArtist: false,
                                    website: ''
                                  })}
                                  className="font-medium hover:text-accent-coral transition-colors cursor-pointer text-left"
                                >
                                  {user.displayName || user.username}
                                </button>
                                {user.verified && <span className="text-xs text-accent-yellow font-semibold">VERIFIED</span>}
                              </div>
                              <button 
                                onClick={() => onViewFanProfile?.({
                                  id: user.id || `fan-${user.username}`,
                                  username: user.username,
                                  displayName: user.displayName || user.username,
                                  verified: user.verified || false,
                                  verificationStatus: 'not-requested',
                                  points: Math.floor(Math.random() * 2000) + 100,
                                  accentColor: user.accentColor || 'coral',
                                  bio: `Music lover and community member`,
                                  location: 'Unknown',
                                  joinedDate: new Date('2024-01-15'),
                                  genres: ['Various'],
                                  connectedServices: ['Spotify'],
                                  isArtist: false,
                                  website: ''
                                })}
                                className="text-sm text-muted-foreground hover:text-accent-coral transition-colors cursor-pointer text-left"
                              >
                                @{user.username}
                              </button>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onUnfollowUser(user.id);
                              toast.success(`Unfollowed @${user.username}`);
                            }}
                          >
                            Unfollow
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Tracks Section */}
        {activeTab === 'tracks' && (
          <div>
            <div className="space-y-4">
              {TRENDING_TRACKS.map((track, index) => (
                <Card key={track.id} className="hover:border-accent-coral/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-8 h-8 bg-accent-coral text-background flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      
                      {/* Artwork */}
                      <div className="relative group">
                        <img 
                          src={track.artwork}
                          alt={track.title}
                          className="w-16 h-16 object-cover border border-foreground/20"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute inset-0 bg-black/60 hover:bg-black/80 border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => onNowPlaying({ ...track, addedBy: { username: 'discover', displayName: 'Discover' } })}
                        >
                          <span className="text-white font-bold">PLAY</span>
                        </Button>
                      </div>
                      
                      {/* Track Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{track.title}</h4>
                        <p className="text-muted-foreground">{track.artist}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>▶</span>
                            {formatNumber(track.plays)} plays
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>♥</span>
                            {formatNumber(track.likes)} likes
                          </div>
                        </div>
                      </div>
                      
                      {/* Room */}
                      <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
                        {track.room}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Artists Section */}
        {activeTab === 'artists' && (
          <div>
            <div className="space-y-4">
              {[...mockArtists, ...TRENDING_ARTISTS].map((artist, index) => (
                <Card key={artist.id} className="hover:border-accent-blue/50 transition-colors">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Artist Info Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => onViewArtistProfile?.(artist)}
                            className="font-semibold text-base md:text-lg truncate hover:text-accent-coral transition-colors text-left"
                          >
                            {artist.displayName}
                          </button>
                          {artist.verified && <span className="text-xs text-accent-blue font-semibold flex-shrink-0">✓ VERIFIED</span>}
                        </div>
                        <button
                          onClick={() => onViewArtistProfile?.(artist)}
                          className="text-sm text-muted-foreground truncate mb-2 hover:text-accent-coral transition-colors text-left"
                        >
                          @{artist.username}
                        </button>
                        
                        {/* Stats - Always Visible */}
                        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                          <span>{formatNumber(artist.followers || 15000)} followers</span>
                          <span>•</span>
                          <span>{formatNumber(artist.monthlyListeners || 85000)} monthly</span>
                        </div>
                      </div>
                      
                      {/* Room & Follow */}
                      <div className="flex flex-row md:flex-col gap-3 items-start md:items-end w-full md:w-auto">
                        <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 text-xs">
                          {artist.topRoom || (artist.genres && artist.genres[0]) || 'Music'}
                        </Badge>
                        <div className="flex flex-row gap-2 w-full md:w-auto">
                          {/* View Profile Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewArtistProfile?.(artist)}
                            className="flex-1 md:flex-none border-foreground/20 hover:border-accent-coral hover:text-accent-coral min-h-[44px] md:min-h-0"
                          >
                            <span className="truncate">View Profile</span>
                          </Button>
                          
                          {/* Follow Button */}
                          {onFollowUser && onUnfollowUser && isFollowing && (
                            <div className="flex-1 md:flex-none">
                              {isFollowing(artist.id) ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full md:w-auto min-h-[44px] md:min-h-0"
                                  onClick={() => {
                                    onUnfollowUser(artist.id);
                                    toast.success(`Unfollowed @${artist.username}`);
                                  }}
                                >
                                  <span className="truncate">Unfollow</span>
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="bg-accent-coral text-background hover:bg-accent-coral/90 w-full md:w-auto min-h-[44px] md:min-h-0"
                                  onClick={() => {
                                    onFollowUser(artist);
                                    toast.success(`Now following @${artist.username}!`);
                                  }}
                                >
                                  <span className="truncate">Follow</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rooms Section */}
        {activeTab === 'rooms' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRENDING_ROOMS.map((room) => (
                <Card 
                  key={room.name} 
                  className="cursor-pointer hover:border-accent-mint/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  onClick={() => onRoomSelect && onRoomSelect(room.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${room.color} flex items-center justify-center`}>
                        <span className="text-background font-black text-lg">#</span>
                      </div>
                      <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
                        {room.growth}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{room.name}</h3>
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(room.posts)} posts this week
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(room.members)} members
                      </p>
                    </div>
                    <p className="text-xs text-accent-mint font-medium">
                      Click to enter room →
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Merch Section */}
        {activeTab === 'merch' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRENDING_MERCH.map((item) => (
                <Card key={item.id} className="hover:border-accent-coral/50 transition-colors overflow-hidden">
                  <div className="aspect-square relative bg-secondary">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-black text-lg">SOLD OUT</span>
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-accent-coral/90 text-background border-0">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h4 className="font-semibold text-base mb-1 line-clamp-1">{item.name}</h4>
                      <button
                        onClick={() => onViewArtistProfile?.({ username: item.artistUsername })}
                        className="text-sm text-muted-foreground hover:text-accent-coral transition-colors"
                      >
                        by {item.artist}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">${item.price}</div>
                        <div className="text-xs text-muted-foreground">{item.sales} sold</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-accent-coral text-background hover:bg-accent-coral/90 min-h-[44px] md:min-h-0"
                        disabled={!item.inStock}
                        onClick={() => {
                          if (item.inStock) {
                            toast.success('Added to cart!', {
                              description: `${item.name} from ${item.artist}`
                            });
                          }
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {item.inStock ? 'Buy' : 'Sold Out'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Shows Section */}
        {activeTab === 'shows' && (
          <div>
            <div className="space-y-4">
              {UPCOMING_SHOWS.map((show) => {
                const isUpcoming = show.date > new Date();
                const formattedDate = show.date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
                
                return (
                  <Card key={show.id} className="hover:border-accent-blue/50 transition-colors overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Show Image */}
                      <div className="w-full md:w-48 h-48 md:h-auto relative bg-secondary flex-shrink-0">
                        <img 
                          src={show.image} 
                          alt={show.tourName}
                          className="w-full h-full object-cover"
                        />
                        {show.soldOut && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-white font-black text-lg">SOLD OUT</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Show Details */}
                      <CardContent className="p-4 md:p-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            {/* Artist & Tour */}
                            <div className="mb-3">
                              <button
                                onClick={() => onViewArtistProfile?.({ username: show.artistUsername })}
                                className="font-semibold text-lg hover:text-accent-coral transition-colors mb-1"
                              >
                                {show.artist}
                              </button>
                              <p className="text-sm text-muted-foreground">{show.tourName}</p>
                            </div>
                            
                            {/* Venue & Location */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-accent-blue flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-medium">{show.venue}</div>
                                  <div className="text-muted-foreground">{show.city}, {show.state}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-accent-mint flex-shrink-0" />
                                <span className="font-medium">{formattedDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Price & Action */}
                          <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-2">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">From</div>
                              <div className="text-2xl font-semibold">${show.price}</div>
                            </div>
                            <Button 
                              size="sm" 
                              className={`${
                                show.soldOut 
                                  ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
                                  : 'bg-accent-blue text-background hover:bg-accent-blue/90'
                              } min-h-[44px] md:min-h-0`}
                              disabled={show.soldOut || !show.ticketsAvailable}
                              onClick={() => {
                                if (!show.soldOut && show.ticketsAvailable) {
                                  toast.success('Opening ticket page...', {
                                    description: `${show.artist} at ${show.venue}`
                                  });
                                }
                              }}
                            >
                              {show.soldOut ? 'Sold Out' : 'Get Tickets'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Sessions Section */}
        {activeTab === 'sessions' && (
          <div>
            <SessionsView 
              user={user}
              onNowPlaying={onNowPlaying}
              onJoinSession={(session) => {
                toast.success('Joining session...', {
                  description: `${session.artist} is live now!`
                });
              }}
              onStartDJ={() => {
                toast.info('Start DJ feature', {
                  description: 'Navigate to Sessions page to start a DJ session'
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}