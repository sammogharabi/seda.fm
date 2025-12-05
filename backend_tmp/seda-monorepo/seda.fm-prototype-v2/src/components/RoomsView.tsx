import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Plus,
  Hash, 
  Crown, 
  Users,
  MapPin,
  Mic,
  Volume2,
  Star,
  Settings,
  UserPlus,
  Search,
  Filter,
  Grid,
  List,
  Loader2
} from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

// Mock data for discoverable rooms that user hasn't joined yet
const DISCOVERABLE_ROOMS = [
  {
    id: '#techno',
    name: 'Techno Underground',
    description: 'Dark, hypnotic techno from Berlin and beyond',
    memberCount: 2341,
    isActive: true,
    type: 'genre',
    region: 'Europe',
    tags: ['berlin-techno', 'industrial', 'minimal'],
    pinnedTrack: {
      title: 'Spastik',
      artist: 'Plastikman',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
    },
    isVerified: false
  },
  {
    id: '#lofi',
    name: 'Lo-Fi Study',
    description: 'Chill beats for focus, study, and late-night vibes',
    memberCount: 5672,
    isActive: true,
    type: 'genre',
    region: 'Global',
    tags: ['chill', 'study', 'beats'],
    pinnedTrack: {
      title: 'Nujabes Vibes',
      artist: 'Various Artists',
      artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    },
    isVerified: false
  },
  {
    id: '@skrillex',
    name: 'Skrillex',
    description: 'Official room for dubstep pioneer and electronic innovator',
    memberCount: 45231,
    isActive: true,
    isArtist: true,
    type: 'artist',
    region: 'Global',
    tags: ['dubstep', 'electronic', 'bass'],
    isVerified: true,
    pinnedTrack: {
      title: 'Bangarang',
      artist: 'Skrillex',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
    }
  },
  {
    id: '#indie-rock',
    name: 'Indie Rock Revival',
    description: 'Modern indie rock and alternative sounds',
    memberCount: 1876,
    isActive: false,
    type: 'genre',
    region: 'North America',
    tags: ['indie', 'alternative', 'garage'],
    pinnedTrack: {
      title: 'Reptilia',
      artist: 'The Strokes',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    },
    isVerified: false
  },
  {
    id: '#afrobeat',
    name: 'Afrobeat Global',
    description: 'African rhythms and contemporary Afrobeat sounds',
    memberCount: 3421,
    isActive: true,
    type: 'genre',
    region: 'Africa',
    tags: ['afrobeat', 'african', 'world'],
    pinnedTrack: {
      title: 'Ye',
      artist: 'Burna Boy',
      artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    },
    isVerified: false
  },
  {
    id: '@tameimpala',
    name: 'Tame Impala',
    description: 'Psychedelic rock and electronic music fusion',
    memberCount: 12874,
    isActive: false,
    isArtist: true,
    type: 'artist',
    region: 'Oceania',
    tags: ['psychedelic', 'electronic', 'indie'],
    isVerified: true,
    pinnedTrack: {
      title: 'The Less I Know The Better',
      artist: 'Tame Impala',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
    }
  }
];

// Mock data for joined rooms (this would come from the sidebar)
const JOINED_ROOMS = [
  { 
    id: '#hiphop', 
    name: 'Hip Hop', 
    description: 'Underground hip hop beats, boom bap, and lyrical fire',
    memberCount: 1247, 
    isActive: true, 
    unreadCount: 3,
    type: 'genre',
    region: 'Global',
    tags: ['boom-bap', 'underground', 'freestyle'],
    pinnedTrack: {
      title: 'C.R.E.A.M.',
      artist: 'Wu-Tang Clan',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    }
  },
  { 
    id: '#electronic', 
    name: 'Electronic', 
    description: 'Electronic music from ambient to hardcore techno',
    memberCount: 892, 
    isActive: false, 
    unreadCount: 0,
    type: 'genre',
    region: 'Europe',
    tags: ['techno', 'house', 'ambient'],
    pinnedTrack: {
      title: 'Strobe',
      artist: 'Deadmau5',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
    }
  },
  { 
    id: '#ambient', 
    name: 'Ambient', 
    description: 'Atmospheric soundscapes and meditative music',
    memberCount: 234, 
    isActive: true, 
    unreadCount: 12,
    type: 'genre',
    region: 'Global',
    tags: ['meditative', 'soundscape', 'drone'],
    pinnedTrack: {
      title: 'Music for Airports',
      artist: 'Brian Eno',
      artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    }
  },
  { 
    id: '#jazz', 
    name: 'Jazz', 
    description: 'Classic and contemporary jazz for serious listeners',
    memberCount: 567, 
    isActive: false, 
    unreadCount: 1,
    type: 'genre',
    region: 'North America',
    tags: ['bebop', 'fusion', 'contemporary'],
    pinnedTrack: {
      title: 'Kind of Blue',
      artist: 'Miles Davis',
      artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    }
  },
  { 
    id: '@diplo', 
    name: 'Diplo', 
    description: 'Official artist room for Diplo and Major Lazer vibes',
    memberCount: 15643, 
    isActive: true, 
    unreadCount: 5, 
    isArtist: true,
    type: 'artist',
    region: 'Global',
    tags: ['moombahton', 'trap', 'edm'],
    isVerified: true,
    pinnedTrack: {
      title: 'Lean On',
      artist: 'Major Lazer ft. MØ',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    }
  },
  { 
    id: '@flume', 
    name: 'Flume', 
    description: 'Future bass and experimental electronic sounds',
    memberCount: 8932, 
    isActive: false, 
    unreadCount: 0, 
    isArtist: true,
    type: 'artist',
    region: 'Oceania',
    tags: ['future-bass', 'experimental', 'electronic'],
    isVerified: true,
    pinnedTrack: {
      title: 'Never Be Like You',
      artist: 'Flume ft. Kai',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
    }
  }
];

interface RoomsViewProps {
  user: any;
  userRooms: any[];  // Rooms the user owns/created
  joinedRooms?: any[];  // Rooms the user has joined as a member
  onCreateRoomClick: () => void;
  onRoomSelect: (roomId: string) => void;
  onRoomPreview?: (roomId: string) => void;
  onJoinRoom?: (room: any) => void;
  onNowPlaying?: (track: any) => void;
}

export function RoomsView({ 
  user, 
  userRooms = [], 
  joinedRooms = [],
  onCreateRoomClick, 
  onRoomSelect,
  onRoomPreview,
  onJoinRoom,
  onNowPlaying 
}: RoomsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'owned', 'joined', 'browse'
  const [joiningRooms, setJoiningRooms] = useState(new Set()); // Track rooms being joined
  const [sortBy, setSortBy] = useState('members'); // 'members', 'name', 'activity'

  // Combine and deduplicate rooms by ID
  const allJoinedRooms = [...joinedRooms, ...JOINED_ROOMS].reduce((acc, room) => {
    if (!acc.find(r => r.id === room.id)) {
      acc.push(room);
    }
    return acc;
  }, []);
  
  const myRooms = [...userRooms, ...allJoinedRooms].reduce((acc, room) => {
    if (!acc.find(r => r.id === room.id)) {
      acc.push(room);
    }
    return acc;
  }, []);
  
  const allRooms = [...myRooms, ...DISCOVERABLE_ROOMS].reduce((acc, room) => {
    if (!acc.find(r => r.id === room.id)) {
      acc.push(room);
    }
    return acc;
  }, []);

  const filteredRooms = allRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'owned' && userRooms.some(r => r.id === room.id)) ||
                         (filterType === 'joined' && (joinedRooms.some(r => r.id === room.id) || JOINED_ROOMS.some(r => r.id === room.id))) ||
                         (filterType === 'browse' && DISCOVERABLE_ROOMS.some(r => r.id === room.id));
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'members':
        return (b.memberCount || 0) - (a.memberCount || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'activity':
        // Put active rooms first, then sort by member count
        if (a.isActive !== b.isActive) {
          return b.isActive ? 1 : -1;
        }
        return (b.memberCount || 0) - (a.memberCount || 0);
      default:
        return 0;
    }
  });

  const handleRoomClick = (room) => {
    if (isUserMember(room)) {
      // Navigate to room as member
      onRoomSelect(room.id);
    } else if (onRoomPreview) {
      // Preview room as non-member
      onRoomPreview(room.id);
    }
  };

  const handleJoinRoom = async (room, e) => {
    e.stopPropagation();
    
    // Add to joining state
    setJoiningRooms(prev => new Set([...prev, room.id]));
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onJoinRoom) {
        onJoinRoom(room);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(`Failed to join ${room.name}. Please try again.`);
    } finally {
      // Remove from joining state
      setJoiningRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(room.id);
        return newSet;
      });
    }
  };

  const handlePlayPinnedTrack = (track, e) => {
    e.stopPropagation();
    if (onNowPlaying) {
      onNowPlaying(track);
    }
  };

  const isUserMember = (room) => {
    return userRooms.some(r => r.id === room.id) || joinedRooms.some(r => r.id === room.id) || JOINED_ROOMS.some(r => r.id === room.id);
  };

  const isUserOwner = (room) => {
    return userRooms.some(r => r.id === room.id);
  };

  const getRoomIcon = (room) => {
    if (room.type === 'artist' || room.isArtist) {
      return <Crown className="w-5 h-5 text-accent-yellow" />;
    }
    return <Hash className="w-5 h-5 text-muted-foreground" />;
  };

  const getRoomTypeColor = (room) => {
    if (userRooms.includes(room)) return 'accent-coral';
    if (room.type === 'artist' || room.isArtist) return 'accent-yellow';
    return 'accent-mint';
  };

  const RoomCard = ({ room }) => (
    <Card 
      className={`transition-all hover:shadow-lg border-l-4 border-l-${getRoomTypeColor(room)} hover:border-l-${getRoomTypeColor(room)}/80 cursor-pointer`}
      onClick={() => handleRoomClick(room)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getRoomIcon(room)}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {room.name}
                {room.isVerified && <Crown className="w-4 h-4 text-accent-yellow" />}
                {room.isActive && (
                  <div className={`w-2 h-2 bg-${getRoomTypeColor(room)} rounded-full`}></div>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {room.type || 'public'}
                </Badge>
                {room.region && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {room.region}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {room.memberCount?.toLocaleString() || '1'}
            </div>
            {room.unreadCount > 0 && (
              <Badge className={`bg-${getRoomTypeColor(room)} text-background text-xs mt-1`}>
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {room.description}
        </p>
        
        {/* Tags */}
        {room.tags && room.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {room.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {room.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{room.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Pinned Track */}
        {room.pinnedTrack && (
          <div className="flex items-center gap-3 p-2 bg-secondary/30 border border-foreground/10 rounded-lg">
            <img
              src={room.pinnedTrack.artwork}
              alt={room.pinnedTrack.title}
              className="w-8 h-8 object-cover border border-foreground/20 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{room.pinnedTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{room.pinnedTrack.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent-mint/10"
              onClick={(e) => handlePlayPinnedTrack(room.pinnedTrack, e)}
            >
              <Volume2 className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Room Status and Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10">
          <div className="flex items-center gap-2">
            {isUserOwner(room) ? (
              <Badge className="bg-accent-coral/20 text-accent-coral text-xs">
                Owner
              </Badge>
            ) : isUserMember(room) ? (
              <Badge variant="secondary" className="text-xs">
                Member
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                {room.memberCount?.toLocaleString() || '0'} members
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isUserMember(room) ? (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                {isUserOwner(room) ? 'Manage' : 'Settings'}
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="h-6 px-3 text-xs bg-accent-mint text-background hover:bg-accent-mint/90"
                onClick={(e) => handleJoinRoom(room, e)}
                disabled={joiningRooms.has(room.id)}
              >
                {joiningRooms.has(room.id) ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <UserPlus className="w-3 h-3 mr-1" />
                )}
                {joiningRooms.has(room.id) ? 'Joining...' : 'Join'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RoomListItem = ({ room }) => (
    <div 
      className={`p-4 transition-all hover:bg-secondary/50 border-l-4 border-l-${getRoomTypeColor(room)} hover:border-l-${getRoomTypeColor(room)}/80 cursor-pointer`}
      onClick={() => handleRoomClick(room)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getRoomIcon(room)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{room.name}</h3>
              {room.isVerified && <Crown className="w-4 h-4 text-accent-yellow" />}
              {room.isActive && (
                <div className={`w-2 h-2 bg-${getRoomTypeColor(room)} rounded-full`}></div>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-1">{room.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {room.memberCount?.toLocaleString() || '1'}
              </div>
              {room.region && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {room.region}
                </div>
              )}
              <Badge variant="secondary" className="text-xs">
                {room.type || 'public'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {room.unreadCount > 0 && isUserMember(room) && (
            <Badge className={`bg-${getRoomTypeColor(room)} text-background text-xs`}>
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </Badge>
          )}
          {isUserOwner(room) ? (
            <Badge className="bg-accent-coral/20 text-accent-coral text-xs">
              Owner
            </Badge>
          ) : isUserMember(room) ? (
            <Badge variant="secondary" className="text-xs">
              Member
            </Badge>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="h-6 px-3 text-xs bg-accent-mint text-background hover:bg-accent-mint/90"
              onClick={(e) => handleJoinRoom(room, e)}
              disabled={joiningRooms.has(room.id)}
            >
              {joiningRooms.has(room.id) ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <UserPlus className="w-3 h-3 mr-1" />
              )}
              {joiningRooms.has(room.id) ? 'Joining...' : 'Join'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-foreground/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              {filterType === 'browse' ? 'Discover Rooms' : 
               filterType === 'owned' ? 'My Rooms' :
               filterType === 'joined' ? 'Joined Rooms' : 'All Rooms'}
            </h1>
            <p className="text-muted-foreground">
              {filterType === 'browse' ? 'Find new music communities to join' :
               filterType === 'owned' ? 'Manage the rooms you created' :
               filterType === 'joined' ? 'Rooms you are a member of' :
               'Manage your music communities and discover new spaces'}
            </p>
          </div>
          <Button 
            onClick={onCreateRoomClick}
            className="bg-accent-coral text-background hover:bg-accent-coral/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'owned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('owned')}
            >
              Owned
            </Button>
            <Button
              variant={filterType === 'joined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('joined')}
            >
              Joined
            </Button>
            <Button
              variant={filterType === 'browse' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('browse')}
            >
              Browse
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Button
              variant={sortBy === 'members' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('members')}
            >
              Members
            </Button>
            <Button
              variant={sortBy === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('activity')}
            >
              Activity
            </Button>
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
            >
              Name
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-6">
          {/* Empty State */}
          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No rooms found' : 
                 filterType === 'owned' ? 'No rooms created yet' :
                 filterType === 'joined' ? 'No rooms joined yet' :
                 filterType === 'browse' ? 'No new rooms to discover' :
                 'No rooms yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `No rooms match "${searchQuery}". Try adjusting your search.`
                  : filterType === 'owned'
                    ? 'Start building your music community by creating your first room.'
                    : filterType === 'joined'
                      ? 'Discover and join rooms that match your musical interests.'
                      : filterType === 'browse' 
                        ? 'No new rooms to discover right now. Check back later for fresh communities!'
                        : 'Create your first room to start building a music community, or browse available rooms to join.'
                }
              </p>
              {!searchQuery && (
                <div className="flex gap-3 justify-center">
                  {filterType !== 'browse' && (
                    <Button 
                      onClick={onCreateRoomClick}
                      className="bg-accent-coral text-background hover:bg-accent-coral/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {filterType === 'owned' ? 'Create Your First Room' : 'Create Room'}
                    </Button>
                  )}
                  {filterType !== 'browse' && (
                    <Button 
                      onClick={() => setFilterType('browse')}
                      variant="outline"
                    >
                      Browse Rooms
                    </Button>
                  )}
                  {filterType === 'browse' && (
                    <Button 
                      onClick={() => setFilterType('all')}
                      variant="outline"
                    >
                      View All Rooms
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rooms Grid/List */}
          {filteredRooms.length > 0 && (
            <>
              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div className="text-sm text-muted-foreground">
                  {filteredRooms.length} rooms
                </div>
                <div className="text-sm text-muted-foreground">
                  {userRooms.length} owned
                </div>
                <div className="text-sm text-muted-foreground">
                  {allJoinedRooms.length} joined
                </div>
                <div className="text-sm text-muted-foreground">
                  {DISCOVERABLE_ROOMS.length} available
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              ) : (
                <div className="space-y-1 border border-foreground/10 rounded-lg overflow-hidden">
                  {filteredRooms.map((room, index) => (
                    <div key={room.id}>
                      <RoomListItem room={room} />
                      {index < filteredRooms.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}