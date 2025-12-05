import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Crown, 
  Trophy, 
  Music, 
  Calendar, 
  Star,
  Medal,
  Award,
  Zap,
  TrendingUp,
  Users,
  PlayCircle,
  Settings,
  Radio,
  Share,
  Download,
  Lock,
  Unlock,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
  Flame,
  Target,
  Headphones,
  Clock,
  Plus,
  Edit3,
  Camera,
  Gift,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

const MOCK_BADGES = [
  { id: 1, name: 'First Steps', description: 'Joined sedā.fm', icon: '🎵', tier: 'bronze', date: '2024-01-15', rarity: 'common' },
  { id: 2, name: 'DJ Debut', description: 'Hosted first DJ session', icon: '🎧', tier: 'silver', date: '2024-01-20', rarity: 'uncommon' },
  { id: 3, name: 'Crowd Pleaser', description: 'Track got 50+ upvotes', icon: '👍', tier: 'gold', date: '2024-02-01', rarity: 'rare' },
  { id: 4, name: 'Genre Explorer', description: 'Active in 5+ genres', icon: '🌟', tier: 'platinum', date: '2024-02-15', rarity: 'epic' },
  { id: 5, name: 'Night Owl', description: 'DJ session at 3 AM', icon: '🦉', tier: 'diamond', date: '2024-03-01', rarity: 'legendary' },
  { id: 6, name: 'Tastemaker', description: 'Top 10 in genre leaderboard', icon: '👑', tier: 'master', date: '2024-03-10', rarity: 'mythic' }
];

const MOCK_STATS = [
  { label: 'Tracks Played', value: 1247, icon: PlayCircle },
  { label: 'Sessions Hosted', value: 89, icon: Radio },
  { label: 'Total Upvotes', value: 3521, icon: TrendingUp },
  { label: 'Followers', value: 156, icon: Users }
];

const TIER_COLORS = {
  bronze: '#86868b',
  silver: '#6d6d70',
  gold: '#48484a',
  platinum: '#3a3a3c',
  diamond: '#1d1d1f',
  master: '#1d1d1f'
};

const RARITY_GLOWS = {
  common: '#d2d2d7',
  uncommon: '#86868b',
  rare: '#6d6d70',
  epic: '#48484a',
  legendary: '#3a3a3c',
  mythic: '#1d1d1f'
};

export function UserProfile({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: user.bio || '',
    displayName: user.displayName || user.username,
    location: user.location || '',
    website: user.website || ''
  });
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const currentLevel = Math.floor(user.djPoints / 100) + 1;
  const nextLevelPoints = currentLevel * 100;
  const progressToNext = ((user.djPoints % 100) / 100) * 100;

  const topGenres = user.genres.slice(0, 3);
  const joinDate = new Date(user.joinedDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleSaveProfile = useCallback(() => {
    if (onUpdateUser) {
      onUpdateUser({ ...user, ...profileData });
    }
    setIsEditingProfile(false);
    toast.success('Profile updated successfully!');
  }, [user, profileData, onUpdateUser]);

  const shareProfile = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${user.username} on sedā.fm`,
        text: `Check out ${user.username}'s music profile on sedā.fm!`,
        url: `https://seda.fm/user/${user.username}`
      });
    } else {
      navigator.clipboard.writeText(`https://seda.fm/user/${user.username}`);
      toast.success('Profile link copied to clipboard!');
    }
  }, [user.username]);

  const downloadProfileData = useCallback(() => {
    const data = {
      username: user.username,
      djPoints: user.djPoints,
      level: currentLevel,
      badges: MOCK_BADGES,
      stats: MOCK_STATS,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seda-fm-profile-${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile data downloaded!');
  }, [user, currentLevel]);

  return (
    <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto">
      {/* Enhanced Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ring/10 via-transparent to-ring/5" />
          <CardContent className="p-8 relative">
            <div className="flex items-start gap-8">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="w-32 h-32 shadow-2xl ring-4 ring-ring/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/80">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-ring rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-4 h-4 text-ring-foreground" />
                </motion.div>
                {currentLevel >= 10 && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                      <Crown className="w-3 h-3 mr-1" />
                      Elite
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {profileData.displayName}
                  </h1>
                  {user.verified && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Crown className="w-7 h-7 text-ring" />
                    </motion.div>
                  )}
                  {user.isArtist && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Artist
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-ring/30 text-ring">
                    Level {currentLevel}
                  </Badge>
                </div>
                
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  {profileData.bio || 'Music enthusiast and DJ'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-medium text-ring">{user.djPoints.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">DJ Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium">{MOCK_STATS[1].value}</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium">{MOCK_STATS[3].value}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium">{MOCK_BADGES.length}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                  {user.connectedServices?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span>{user.connectedServices.join(', ')}</span>
                    </div>
                  )}
                  {profileData.location && (
                    <div className="flex items-center gap-2">
                      <span>📍 {profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="shadow-lg hover:shadow-xl transition-all duration-200">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Display Name</label>
                        <Input
                          value={profileData.displayName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Your display name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Your location"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <Input
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://your-website.com"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveProfile} className="flex-1">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={shareProfile} className="shadow-lg hover:shadow-xl transition-all duration-200">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="outline" onClick={downloadProfileData} className="shadow-lg hover:shadow-xl transition-all duration-200">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            {/* Level Progress Bar */}
            <div className="mt-6 p-4 bg-card/50 rounded-xl border border-ring/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Level {currentLevel} Progress</span>
                <span className="text-sm text-muted-foreground">
                  {100 - (user.djPoints % 100)} points to Level {currentLevel + 1}
                </span>
              </div>
              <Progress value={progressToNext} className="h-3 bg-secondary" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trophies">Trophy Case</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DJ Points & Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                  DJ Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-1">{user.djPoints.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">DJ Points</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {currentLevel}</span>
                      <span>Level {currentLevel + 1}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {100 - (user.djPoints % 100)} points to next level
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Genres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-muted-foreground" />
                  Top Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGenres.map((genre, index) => (
                    <div key={genre} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-foreground' : 
                          index === 1 ? 'bg-muted-foreground' : 
                          'bg-border'
                        }`} />
                        <span>{genre}</span>
                      </div>
                      <Badge variant="outline">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {MOCK_BADGES.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-muted-foreground transition-colors cursor-pointer"
                    style={{
                      boxShadow: `0 0 20px ${RARITY_GLOWS[badge.rarity]}20`
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                      style={{ 
                        backgroundColor: TIER_COLORS[badge.tier] + '20',
                        border: `2px solid ${TIER_COLORS[badge.tier]}`
                      }}
                    >
                      {badge.icon}
                    </div>
                    <h4 className="text-xs text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground text-center">
                      {new Date(badge.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trophies" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-ring/5 via-transparent to-ring/10" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Trophy className="w-6 h-6 text-ring" />
                    </motion.div>
                    Trophy Case ({MOCK_BADGES.length} badges)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-ring/30 text-ring">
                      {MOCK_BADGES.filter(b => b.rarity === 'legendary' || b.rarity === 'mythic').length} Rare
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  <AnimatePresence>
                    {MOCK_BADGES.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex flex-col items-center p-4 rounded-xl border border-border hover:border-ring/30 transition-all duration-300 cursor-pointer group relative"
                        style={{
                          boxShadow: `0 0 30px ${RARITY_GLOWS[badge.rarity]}20`
                        }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        onClick={() => setSelectedBadge(badge)}
                      >
                        <motion.div 
                          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 relative"
                          style={{ 
                            backgroundColor: TIER_COLORS[badge.tier] + '15',
                            border: `3px solid ${TIER_COLORS[badge.tier]}`,
                            boxShadow: `0 0 25px ${RARITY_GLOWS[badge.rarity]}40`
                          }}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          {badge.icon}
                          {(badge.rarity === 'legendary' || badge.rarity === 'mythic') && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `conic-gradient(from 0deg, ${RARITY_GLOWS[badge.rarity]}, transparent, ${RARITY_GLOWS[badge.rarity]})`
                              }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                        </motion.div>
                        <h4 className="font-medium text-center mb-1">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">
                          {badge.description}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize"
                          style={{ 
                            borderColor: RARITY_GLOWS[badge.rarity],
                            color: RARITY_GLOWS[badge.rarity]
                          }}
                        >
                          {badge.rarity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(badge.date).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badge Detail Modal */}
          <Dialog open={selectedBadge !== null} onOpenChange={() => setSelectedBadge(null)}>
            <DialogContent className="max-w-md">
              {selectedBadge && (
                <div className="text-center space-y-4">
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto"
                    style={{ 
                      backgroundColor: TIER_COLORS[selectedBadge.tier] + '20',
                      border: `4px solid ${TIER_COLORS[selectedBadge.tier]}`,
                      boxShadow: `0 0 30px ${RARITY_GLOWS[selectedBadge.rarity]}50`
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    {selectedBadge.icon}
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{selectedBadge.name}</h3>
                    <p className="text-muted-foreground mb-4">{selectedBadge.description}</p>
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge 
                        variant="outline"
                        style={{ borderColor: RARITY_GLOWS[selectedBadge.rarity] }}
                      >
                        {selectedBadge.rarity}
                      </Badge>
                      <Badge variant="secondary">{selectedBadge.tier}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Earned on {new Date(selectedBadge.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={shareProfile}>
                      <Share className="w-4 h-4 mr-2" />
                      Share Badge
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedBadge(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_STATS.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl mb-1">{stat.value.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">Earned "Tastemaker" badge</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">Hosted DJ session in #electronic</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="flex-1">
                    <p className="text-sm">Track "Midnight City" got 25 upvotes</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playlists">
          <Card>
            <CardHeader>
              <CardTitle>Your Playlists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No playlists yet</p>
                <Button className="mt-4">Create Your First Playlist</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}