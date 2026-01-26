import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Mail,
  Check,
  X,
  Users,
  Clock,
  Loader2,
  Hash,
  Crown,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { roomsApi, type RoomInvite } from '../lib/api';

interface RoomInvitesProps {
  onAccept?: (roomId: string) => void;
  onDecline?: () => void;
  compact?: boolean;
}

export function RoomInvites({ onAccept, onDecline, compact = false }: RoomInvitesProps) {
  const [invites, setInvites] = useState<RoomInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvites, setProcessingInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const data = await roomsApi.getMyInvites();
      setInvites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load room invites');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (inviteId: string, accept: boolean) => {
    setProcessingInvites(prev => new Set([...prev, inviteId]));

    try {
      const result = await roomsApi.respondToInvite(inviteId, accept);

      // Remove the processed invite from list
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));

      if (accept) {
        toast.success('Invite accepted! You can now access the room.');
        if (onAccept && result.roomId) {
          onAccept(result.roomId);
        }
      } else {
        toast.success('Invite declined.');
        if (onDecline) {
          onDecline();
        }
      }
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast.error(`Failed to ${accept ? 'accept' : 'decline'} invite`);
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(inviteId);
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'}`}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invites.length === 0) {
    if (compact) {
      return null;
    }

    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No pending invites</p>
      </div>
    );
  }

  // Compact view for header/sidebar
  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => {/* Could open a dropdown */}}
        >
          <Bell className="w-5 h-5" />
          {invites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-coral text-background text-xs rounded-full flex items-center justify-center">
              {invites.length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-accent-coral" />
        <h3 className="font-semibold">Pending Room Invites</h3>
        <Badge variant="secondary" className="text-xs">
          {invites.length}
        </Badge>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3">
          {invites.map((invite) => (
            <Card
              key={invite.id}
              className="border-l-4 border-l-accent-yellow hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Room Icon */}
                  <div className="w-12 h-12 bg-accent-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {invite.room.coverImageUrl ? (
                      <img
                        src={invite.room.coverImageUrl}
                        alt={invite.room.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Crown className="w-6 h-6 text-accent-yellow" />
                    )}
                  </div>

                  {/* Invite Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{invite.room.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        Private
                      </Badge>
                    </div>

                    {invite.room.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {invite.room.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{invite.room._count?.memberships || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Invited {formatTimeAgo(invite.createdAt)}</span>
                      </div>
                    </div>

                    {invite.inviter?.profile && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Invited by {invite.inviter.profile.displayName || invite.inviter.profile.username}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-accent-mint text-background hover:bg-accent-mint/90"
                      onClick={() => handleRespond(invite.id, true)}
                      disabled={processingInvites.has(invite.id)}
                    >
                      {processingInvites.has(invite.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(invite.id, false)}
                      disabled={processingInvites.has(invite.id)}
                    >
                      {processingInvites.has(invite.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
