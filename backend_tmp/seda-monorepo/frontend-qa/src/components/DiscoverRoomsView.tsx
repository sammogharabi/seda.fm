import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { CreateRoomModal } from './CreateRoomModal';
import { useChatService, Room } from '../hooks/useChatService';
import {
  MessageSquarePlus,
  Search,
  Users,
  Lock,
  Globe,
  MessageSquare,
  Wifi,
  WifiOff,
  Plus,
  Hash,
  Crown,
  Clock,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface DiscoverRoomsViewProps {
  user: any;
}

export function DiscoverRoomsView({ user }: DiscoverRoomsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  const {
    rooms,
    currentRoom,
    messages,
    isConnected,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
  } = useChatService();

  // Demo rooms data (in real app, this would come from backend)
  const [demoRooms] = useState<Room[]>([
    {
      id: 'room-1',
      name: 'Chill Hip-Hop Vibes',
      description: 'Laid-back beats and smooth rhymes. Share your favorite chill hip-hop tracks!',
      isPrivate: false,
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 127,
      lastMessage: {
        id: 'msg-1',
        text: 'Just dropped this new Lo-Fi playlist, check it out! 🎧',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: 'user-2',
          username: 'beatsbyalex',
        },
      },
    },
    {
      id: 'room-2',
      name: 'Electronic Underground',
      description: 'Deep cuts, unreleased gems, and the freshest electronic music discoveries.',
      isPrivate: false,
      createdBy: 'user-2',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 89,
      lastMessage: {
        id: 'msg-2',
        text: 'Anyone else obsessed with this new Burial track?',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: 'user-3',
          username: 'synthwave_sarah',
        },
      },
    },
    {
      id: 'room-3',
      name: 'Jazz Appreciation Society',
      description: 'From bebop to fusion, contemporary to classic. All jazz is welcome here.',
      isPrivate: true,
      createdBy: 'user-3',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 34,
      lastMessage: {
        id: 'msg-3',
        text: 'Miles Davis never gets old. What\'s your favorite album?',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        user: {
          id: 'user-4',
          username: 'jazz_enthusiast',
        },
      },
    },
    {
      id: 'room-4',
      name: 'Rock Legends',
      description: 'Classic rock, prog rock, indie rock - if it rocks, it belongs here!',
      isPrivate: false,
      createdBy: 'user-4',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 203,
    },
    {
      id: 'room-5',
      name: 'Producer Corner',
      description: 'Share beats, get feedback, collaborate with fellow producers.',
      isPrivate: true,
      createdBy: 'user-5',
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 56,
    },
  ]);

  // Combine actual rooms with demo rooms
  const allRooms = [...rooms, ...demoRooms];

  // Filter rooms based on search and filter type
  const filteredRooms = allRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' ||
                         (filterType === 'public' && !room.isPrivate) ||
                         (filterType === 'private' && room.isPrivate);

    return matchesSearch && matchesFilter;
  });

  const handleCreateRoom = async (roomData: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }) => {
    try {
      const newRoom = await createRoom(roomData);
      // Automatically join the newly created room
      await joinRoom(newRoom.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom(roomId);
      toast.success('Joined room successfully!');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Create Room Button */}
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'public', 'private'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type === 'all' && <Filter className="w-4 h-4 mr-1" />}
                {type === 'public' && <Globe className="w-4 h-4 mr-1" />}
                {type === 'private' && <Lock className="w-4 h-4 mr-1" />}
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Room List */}
      <div>
          {error && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

        <div className="grid gap-4">
          <AnimatePresence>
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-primary/50"
                      onClick={() => handleJoinRoom(room.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Hash className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {room.name}
                            {room.isPrivate ? (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Globe className="w-4 h-4 text-muted-foreground" />
                            )}
                            {room.createdBy === user?.id && (
                              <Crown className="w-4 h-4 text-yellow-500" title="Room Owner" />
                            )}
                          </CardTitle>
                          {room.description && (
                            <CardDescription className="mt-1 line-clamp-2">
                              {room.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {room.memberCount && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {room.memberCount}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(room.updatedAt)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Badge variant={room.isPrivate ? 'outline' : 'secondary'}>
                            {room.isPrivate ? 'Private' : 'Public'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {room.lastMessage && (
                    <CardContent className="pt-0">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-primary">
                            @{room.lastMessage.user.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(room.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {room.lastMessage.text}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No rooms found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? `No rooms match "${searchQuery}"`
                  : 'No rooms available for the selected filter'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateModal(true)} variant="outline">
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Create the first room
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}