import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Search,
  UserPlus,
  Loader2,
  Check,
  X,
  Users,
  Clock,
  Mail,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { roomsApi, searchApi, type RoomInvite, type Room } from '../lib/api';

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onInviteSent?: (invite: RoomInvite) => void;
}

interface SearchResult {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

export function InviteUserDialog({ isOpen, onClose, room, onInviteSent }: InviteUserDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pendingInvites, setPendingInvites] = useState<RoomInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set());
  const [cancellingInvites, setCancellingInvites] = useState<Set<string>>(new Set());

  // Fetch existing pending invites for this room
  useEffect(() => {
    if (isOpen && room?.id) {
      fetchPendingInvites();
    }
  }, [isOpen, room?.id]);

  const fetchPendingInvites = async () => {
    try {
      setLoadingInvites(true);
      const invites = await roomsApi.getRoomInvites(room.id);
      setPendingInvites(Array.isArray(invites) ? invites : []);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
    } finally {
      setLoadingInvites(false);
    }
  };

  // Search for users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchApi.search({
          q: searchQuery,
          type: 'users',
          limit: 10
        });

        // Filter out users who are already members or have pending invites
        const memberIds = new Set(room.memberships?.map(m => m.userId) || []);
        const pendingInviteUserIds = new Set(pendingInvites.map(inv => inv.inviteeId));

        const filteredResults = (results.users || []).filter((user: SearchResult) => {
          const userId = user.userId || user.id;
          return !memberIds.has(userId) && !pendingInviteUserIds.has(userId);
        });

        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, room.memberships, pendingInvites]);

  const handleInviteUser = async (user: SearchResult) => {
    const userId = user.userId || user.id;
    setInvitingUsers(prev => new Set([...prev, userId]));

    try {
      const invite = await roomsApi.inviteUser(room.id, userId);

      // Add to pending invites
      setPendingInvites(prev => [...prev, invite]);

      // Remove from search results
      setSearchResults(prev => prev.filter(u => (u.userId || u.id) !== userId));

      toast.success(`Invite sent to ${user.displayName || user.username}`);

      if (onInviteSent) {
        onInviteSent(invite);
      }
    } catch (error: any) {
      console.error('Error inviting user:', error);
      const message = error?.response?.data?.message || 'Failed to send invite';
      toast.error(message);
    } finally {
      setInvitingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleCancelInvite = async (invite: RoomInvite) => {
    setCancellingInvites(prev => new Set([...prev, invite.id]));

    try {
      await roomsApi.cancelInvite(invite.id);

      // Remove from pending invites
      setPendingInvites(prev => prev.filter(inv => inv.id !== invite.id));

      toast.success('Invite cancelled');
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast.error('Failed to cancel invite');
    } finally {
      setCancellingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(invite.id);
        return newSet;
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col" aria-describedby="invite-user-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-accent-yellow" />
            Invite to {room?.name}
          </DialogTitle>
          <DialogDescription id="invite-user-description">
            Search for users to invite to your private room. They will receive a notification and can accept or decline.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for users to invite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Search Results</span>
              </div>

              <ScrollArea className="h-[200px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((user) => {
                      const userId = user.userId || user.id;
                      const isInviting = invitingUsers.has(userId);

                      return (
                        <Card key={userId} className="hover:bg-secondary/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.displayName || user.username}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-accent-blue font-semibold">
                                    {(user.displayName || user.username || '?')[0].toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* User Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {user.displayName || user.username}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  @{user.username}
                                </p>
                              </div>

                              {/* Invite Button */}
                              <Button
                                size="sm"
                                onClick={() => handleInviteUser(user)}
                                disabled={isInviting}
                                className="bg-accent-mint text-background hover:bg-accent-mint/90"
                              >
                                {isInviting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Invite
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users found matching "{searchQuery}"</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Pending Invites Section */}
          <div className="flex-1 min-h-0 border-t border-foreground/10 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-accent-yellow" />
              <span className="text-sm font-medium">Pending Invites</span>
              {pendingInvites.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingInvites.length}
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[150px]">
              {loadingInvites ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : pendingInvites.length > 0 ? (
                <div className="space-y-2">
                  {pendingInvites.map((invite) => {
                    const isCancelling = cancellingInvites.has(invite.id);
                    const invitee = invite.invitee;

                    return (
                      <Card key={invite.id} className="border-l-2 border-l-accent-yellow">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-8 h-8 bg-accent-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                              {invitee?.profile?.avatarUrl ? (
                                <img
                                  src={invitee.profile.avatarUrl}
                                  alt={invitee.profile.displayName || invitee.profile.username}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-accent-yellow text-sm font-semibold">
                                  {(invitee?.profile?.displayName || invitee?.profile?.username || '?')[0].toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {invitee?.profile?.displayName || invitee?.profile?.username || 'Unknown User'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Sent {formatTimeAgo(invite.createdAt)}</span>
                              </div>
                            </div>

                            {/* Cancel Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelInvite(invite)}
                              disabled={isCancelling}
                              className="text-xs h-7"
                            >
                              {isCancelling ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Mail className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending invites</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-foreground/10">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
