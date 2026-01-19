import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Users, 
  Search,
  MessageSquare,
  Heart,
  Gift,
  TrendingUp,
  Calendar,
  Star,
  Crown,
  Coffee,
  Music,
  Send,
  Filter,
  SortDesc,
  UserPlus,
  Clock,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface ArtistFansManagerProps {
  user: any;
  fans: any[]; // Array of actual fan objects following this artist
  onViewChange?: (view: string) => void;
  onSendMessage?: (fanId: string, message: string) => void;
}

export function ArtistFansManager({ user, fans, onViewChange, onSendMessage }: ArtistFansManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFan, setSelectedFan] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'top-fans' | 'recent'>('top-fans');

  // Filter fans by search query
  const filteredFans = fans.filter(fan => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      fan.displayName.toLowerCase().includes(query) ||
      fan.username.toLowerCase().includes(query) ||
      fan.bio?.toLowerCase().includes(query)
    );
  });

  // Sort fans by points (engagement) to identify top supporters
  const sortedFans = [...filteredFans].sort((a, b) => (b.points || 0) - (a.points || 0));
  
  // Top fans are those with highest points
  const topFans = sortedFans;
  
  // Recent fans are sorted by join date
  const recentFans = [...filteredFans].sort((a, b) => {
    const dateA = a.joinedDate ? new Date(a.joinedDate).getTime() : 0;
    const dateB = b.joinedDate ? new Date(b.joinedDate).getTime() : 0;
    return dateB - dateA;
  });

  // Calculate tier based on fan's points/engagement
  const getFanTier = (fan: any) => {
    const points = fan.points || 0;
    if (points > 1000) return 'superfan';
    if (points > 500) return 'supporter';
    return 'new';
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'superfan':
        return <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20"><Crown className="w-3 h-3 mr-1" />Super Fan</Badge>;
      case 'supporter':
        return <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20"><Star className="w-3 h-3 mr-1" />Supporter</Badge>;
      case 'new':
        return <Badge variant="secondary"><UserPlus className="w-3 h-3 mr-1" />New Fan</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  const handleSendMessage = () => {
    if (selectedFan && messageText.trim()) {
      onSendMessage?.(selectedFan.id, messageText);
      setMessageText('');
      setSelectedFan(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="artist-fans-manager min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Header */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">Fan Community</h1>
          <p className="text-muted-foreground">Connect with your supporters</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-foreground/10">
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 text-accent-mint mx-auto mb-1" />
              <div className="text-lg font-bold">{fans.length}</div>
              <div className="text-xs text-muted-foreground">Total Fans</div>
            </CardContent>
          </Card>
          
          <Card className="border-foreground/10">
            <CardContent className="p-3 text-center">
              <Crown className="w-5 h-5 text-accent-coral mx-auto mb-1" />
              <div className="text-lg font-bold">{fans.filter(f => getFanTier(f) === 'superfan').length}</div>
              <div className="text-xs text-muted-foreground">Super Fans</div>
            </CardContent>
          </Card>
          
          <Card className="border-foreground/10">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-accent-yellow mx-auto mb-1" />
              <div className="text-lg font-bold">{fans.reduce((sum, fan) => sum + (fan.points || 0), 0)}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div 
          className="flex justify-center gap-3 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant={activeTab === 'top-fans' ? 'default' : 'outline'}
            onClick={() => setActiveTab('top-fans')}
            className={activeTab === 'top-fans' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Crown className="w-4 h-4 mr-2" />
            Top Fans
          </Button>
          <Button
            variant={activeTab === 'recent' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recent')}
            className={activeTab === 'recent' ? 'bg-accent-mint hover:bg-accent-mint/90 text-background' : ''}
          >
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </Button>
        </motion.div>

        {/* Top Fans View */}
        {activeTab === 'top-fans' && (
          <div className="space-y-4 mt-6">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search fans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>

            {/* Top Fans List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {topFans.length === 0 ? (
                <Card className="border-foreground/10">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No fans found</p>
                    {searchQuery && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                topFans.map((fan) => (
                  <Card key={fan.id} className="border-foreground/10">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Fan Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{fan.displayName}</h3>
                              {getTierBadge(getFanTier(fan))}
                            </div>
                            <p className="text-sm text-muted-foreground">@{fan.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {fan.location && `${fan.location} • `}
                              {fan.points} points
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFan(fan)}
                            className="flex-shrink-0"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Fan Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-foreground/10">
                          <div className="text-center">
                            <div className="text-sm font-medium text-accent-mint">{fan.points || 0}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm font-medium">{fan.following?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Following</div>
                          </div>
                        </div>

                        {/* Bio */}
                        {fan.bio && (
                          <div className="p-2 bg-secondary/30 rounded-lg">
                            <p className="text-sm text-muted-foreground line-clamp-2">{fan.bio}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          </div>
        )}

        {/* Recent Fans View */}
        {activeTab === 'recent' && (
          <div className="space-y-4 mt-6">
            {/* Recent Fans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {recentFans.length === 0 ? (
                <Card className="border-foreground/10">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No fans yet</p>
                  </CardContent>
                </Card>
              ) : (
                recentFans.map((fan) => (
                  <Card key={fan.id} className="border-foreground/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate text-sm">{fan.displayName}</h3>
                            {getTierBadge(getFanTier(fan))}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">@{fan.username}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {fan.joinedDate ? new Date(fan.joinedDate).toLocaleDateString() : 'New fan'} • {fan.points || 0} points
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedFan(fan)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-accent-coral hover:bg-accent-coral/90 text-background whitespace-nowrap"
                            onClick={() => {
                              const welcomeMessage = `Hey ${fan.displayName}! Thanks for following – excited to have you in the community! 🎵`;
                              // Send the message
                              if (onSendMessage) {
                                onSendMessage(fan.id, welcomeMessage);
                              }
                              toast.success('Welcome message sent!', {
                                description: `Sent to @${fan.username}`
                              });
                            }}
                          >
                            Welcome
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          </div>
        )}

        {/* Message Modal */}
        {selectedFan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-end z-[60]"
            onClick={() => setSelectedFan(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="w-full max-w-screen-sm mx-auto bg-background rounded-t-xl p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Message {selectedFan.displayName}</h3>
                <Button size="sm" variant="ghost" onClick={() => setSelectedFan(null)}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-3">
                <textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 border border-foreground/10 rounded-lg bg-background resize-none"
                  rows={3}
                />
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-accent-coral hover:bg-accent-coral/90"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Bottom Spacing for Mobile Navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
