import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Music, 
  Radio, 
  DollarSign, 
  Play, 
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Clock,
  Star,
  ShoppingBag,
  Ticket,
  Package,
  ArrowRight,
  LayoutDashboard,
  User,
  BarChart3,
  ChevronDown,
  Globe,
  X,
  List
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from './UserProfile';
import { ArtistProfile } from './ArtistProfile';
import { 
  Eye,
  MousePointerClick,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface ArtistDashboardProps {
  user: any;
  onViewChange: (view: string) => void;
  onStartLiveSession?: () => void;
  onCreateContent?: () => void;
  onCreateCrate?: () => void;
  initialTab?: 'overview' | 'profile';
  onUpdateUser?: (user: any) => void;
  onBlockUser?: (userId: string) => void;
  onUnblockUser?: (userId: string) => void;
  isBlocked?: (userId: string) => boolean;
  getBlockedUsers?: () => string[];
  mockFans?: any[];
  mockArtists?: any[];
}

export function ArtistDashboard({ 
  user, 
  onViewChange, 
  onStartLiveSession, 
  onCreateContent,
  onCreateCrate,
  initialTab = 'overview',
  onUpdateUser,
  onBlockUser,
  onUnblockUser,
  isBlocked,
  getBlockedUsers,
  mockFans = [],
  mockArtists = []
}: ArtistDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>(initialTab);
  const [profileTimeRange, setProfileTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [profileDateRange, setProfileDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  // Analytics state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('week');
  const [analyticsDateRange, setAnalyticsDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [showAnalyticsDatePicker, setShowAnalyticsDatePicker] = useState(false);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'overview' | 'tracks' | 'audience'>('overview');
  
  const getProfileTimeRangeLabel = () => {
    switch (profileTimeRange) {
      case 'day': return 'Last 24 hours';
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'year': return 'Last 12 months';
      case 'custom':
        if (profileDateRange.from && profileDateRange.to) {
          return `${format(profileDateRange.from, 'MMM dd')} - ${format(profileDateRange.to, 'MMM dd, yyyy')}`;
        }
        return 'Custom range';
      default: return 'Last 30 days';
    }
  };
  
  // Analytics helper functions
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-accent-mint" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth}%`;
  };

  const formatAnalyticsDateRange = () => {
    if (!analyticsDateRange.from) return 'Select dates';
    if (!analyticsDateRange.to) return analyticsDateRange.from.toLocaleDateString();
    return `${analyticsDateRange.from.toLocaleDateString()} - ${analyticsDateRange.to.toLocaleDateString()}`;
  };

  const handleAnalyticsDateSelect = (date: Date | undefined) => {
    if (!analyticsDateRange.from || (analyticsDateRange.from && analyticsDateRange.to)) {
      setAnalyticsDateRange({ from: date, to: undefined });
    } else {
      if (date && date < analyticsDateRange.from) {
        setAnalyticsDateRange({ from: date, to: analyticsDateRange.from });
      } else {
        setAnalyticsDateRange({ from: analyticsDateRange.from, to: date });
      }
    }
  };

  const clearAnalyticsDateRange = () => {
    setAnalyticsDateRange({ from: undefined, to: undefined });
    setAnalyticsTimeframe('week');
    setShowAnalyticsDatePicker(false);
  };

  // No mock data - analytics will be fetched from API
  const analytics = useMemo(() => {
    return {
      overview: {
        totalPlays: 0,
        totalFans: 0,
        totalTracks: 0,
        totalRevenue: 0,
        weeklyGrowth: {
          plays: 0,
          fans: 0,
          revenue: 0
        }
      },
      topTracks: [],
      demographics: {
        locations: [],
        ageGroups: []
      },
      recentSessions: []
    };
  }, [analyticsTimeframe, analyticsDateRange]);

  // No mock data - profile analytics will be fetched from API
  const MOCK_PROFILE_ANALYTICS = useMemo(() => {
    return {
      totalViews: 0,
      viewsThisWeek: 0,
      viewGrowth: 0,
      trafficSources: [],
      topViewers: []
    };
  }, [profileTimeRange, profileDateRange]);
  
  // No mock data - will be fetched from API
  const stats = {
    totalFans: 0,
    weeklyListens: 0,
    totalTracks: 0,
    revenue: 0,
    liveListeners: 0,
    isLive: false
  };

  // No mock data - will be fetched from API
  const storeStats = {
    totalStoreRevenue: 0,
    thisMonthStore: 0,
    storeGrowth: 0,
    totalItems: 0,
    breakdown: {
      tracks: 0,
      merch: 0,
      concerts: 0
    },
    topSellingItems: [],
    recentSales: []
  };

  // No mock data - will be fetched from API
  const recentActivity: any[] = [];

  // No mock data - will be fetched from API
  const upcomingEvents: any[] = [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_fan': return <Users className="w-4 h-4 text-accent-mint" />;
      case 'track_play': return <Play className="w-4 h-4 text-accent-blue" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-accent-yellow" />;
      case 'support': return <DollarSign className="w-4 h-4 text-accent-coral" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStoreItemIcon = (type: string) => {
    switch (type) {
      case 'track': return <Music className="w-3 h-3" />;
      case 'merch': return <ShoppingBag className="w-3 h-3" />;
      case 'concert': return <Ticket className="w-3 h-3" />;
      default: return <Package className="w-3 h-3" />;
    }
  };

  const getStoreItemColor = (type: string) => {
    switch (type) {
      case 'track': return 'text-accent-mint';
      case 'merch': return 'text-accent-coral';
      case 'concert': return 'text-accent-blue';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="artist-dashboard min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            size="sm"
            className={activeTab === 'overview' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            size="sm"
            className={activeTab === 'profile' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'profile' ? (
          <ArtistProfile 
            artist={user}
            currentUser={user}
            onNowPlaying={() => {}}
            onBack={() => {}}
            isFollowing={false}
            onFollowToggle={() => {}}
            onViewMarketplace={() => {}}
            onJoinRoom={() => {}}
            onPreviewRoom={() => {}}
            userRooms={[]}
            joinedRooms={[]}
            onViewFanProfile={() => {}}
            onViewArtistProfile={() => {}}
            mockArtists={mockArtists}
            mockFans={mockFans}
            onFollowUser={() => {}}
            onUnfollowUser={() => {}}
            isFollowingUser={() => false}
            onBlockUser={onBlockUser}
            isBlocked={isBlocked}
            onSendMessage={() => {}}
            editMode={true}
            onUpdateUser={onUpdateUser}
          />
        ) : (
          <>
            {/* Welcome Header */}
            <div className="text-center space-y-2">
              <motion.h1 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome back, {user?.displayName || user?.username}
              </motion.h1>
              <p className="text-muted-foreground">Track your performance and grow your audience</p>
            </div>

            {/* Analytics Time Filter */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-center">
                <div className="flex bg-secondary rounded-lg p-1">
                  {['day', 'week', 'month', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setAnalyticsTimeframe(period);
                        setShowAnalyticsDatePicker(false);
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        analyticsTimeframe === period && !showAnalyticsDatePicker
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                  
                  <Popover open={showAnalyticsDatePicker} onOpenChange={setShowAnalyticsDatePicker}>
                    <PopoverTrigger asChild>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          showAnalyticsDatePicker
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Custom
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-foreground/20" align="center">
                      <div className="p-4 border-b border-foreground/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Select Date Range</span>
                          {(analyticsDateRange.from || analyticsDateRange.to) && (
                            <button
                              onClick={clearAnalyticsDateRange}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatAnalyticsDateRange()}
                        </div>
                      </div>
                      <CalendarComponent
                        mode="single"
                        selected={analyticsDateRange.from || analyticsDateRange.to}
                        onSelect={handleAnalyticsDateSelect}
                        className="border-0"
                      />
                      {analyticsDateRange.from && analyticsDateRange.to && (
                        <div className="p-3 border-t border-foreground/10">
                          <Button
                            size="sm"
                            className="w-full bg-accent-coral hover:bg-accent-coral/90 text-background"
                            onClick={() => setShowAnalyticsDatePicker(false)}
                          >
                            Apply Date Range
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Active Date Range Display */}
              {analyticsDateRange.from && analyticsDateRange.to && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-center"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent-coral/10 border border-accent-coral/30 rounded-lg">
                    <Calendar className="w-4 h-4 text-accent-coral" />
                    <span className="text-sm font-medium">{formatAnalyticsDateRange()}</span>
                    <button
                      onClick={clearAnalyticsDateRange}
                      className="ml-1 p-0.5 hover:bg-accent-coral/20 rounded transition-colors"
                      aria-label="Clear date range"
                    >
                      <X className="w-3 h-3 text-accent-coral" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Analytics Sub-Tabs */}
            <motion.div 
              className="flex justify-center gap-3 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Button
                variant={analyticsSubTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setAnalyticsSubTab('overview')}
                size="sm"
                className={analyticsSubTab === 'overview' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={analyticsSubTab === 'tracks' ? 'default' : 'outline'}
                onClick={() => setAnalyticsSubTab('tracks')}
                size="sm"
                className={analyticsSubTab === 'tracks' ? 'bg-accent-blue hover:bg-accent-blue/90 text-background' : ''}
              >
                <Music className="w-4 h-4 mr-2" />
                Tracks
              </Button>
              <Button
                variant={analyticsSubTab === 'audience' ? 'default' : 'outline'}
                onClick={() => setAnalyticsSubTab('audience')}
                size="sm"
                className={analyticsSubTab === 'audience' ? 'bg-accent-mint hover:bg-accent-mint/90 text-background' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                Audience
              </Button>
            </motion.div>

        {/* Detailed Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Detailed Analytics</h2>
            <p className="text-muted-foreground text-sm">Deep dive into your performance metrics</p>
          </div>

          {/* Analytics Overview Sub-Tab */}
          {analyticsSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-foreground/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Play className="w-5 h-5 text-accent-blue" />
                      {getGrowthIcon(analytics.overview.weeklyGrowth.plays)}
                    </div>
                    <div className="text-2xl font-bold">{analytics.overview.totalPlays.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Plays</div>
                    <div className="text-xs font-medium text-accent-mint">
                      {formatGrowth(analytics.overview.weeklyGrowth.plays)} this week
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-foreground/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-accent-mint" />
                      {getGrowthIcon(analytics.overview.weeklyGrowth.fans)}
                    </div>
                    <div className="text-2xl font-bold">{analytics.overview.totalFans.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Fans</div>
                    <div className="text-xs font-medium text-accent-mint">
                      {formatGrowth(analytics.overview.weeklyGrowth.fans)} this week
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-foreground/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Music className="w-5 h-5 text-accent-yellow" />
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{analytics.overview.totalTracks}</div>
                    <div className="text-xs text-muted-foreground">Total Tracks</div>
                    <div className="text-xs font-medium text-muted-foreground">
                      No change
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-foreground/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-5 h-5 text-accent-coral" />
                      {getGrowthIcon(analytics.overview.weeklyGrowth.revenue)}
                    </div>
                    <div className="text-2xl font-bold">${analytics.overview.totalRevenue}</div>
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                    <div className="text-xs font-medium text-accent-mint">
                      {formatGrowth(analytics.overview.weeklyGrowth.revenue)} this week
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Live Sessions */}
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Radio className="w-5 h-5 text-accent-coral" />
                    Recent Live Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.recentSessions.map((session, index) => (
                    <div key={index} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{session.date}</span>
                        <Badge variant="outline" className="text-xs">
                          {session.duration}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Peak Listeners</div>
                          <div className="font-medium">{session.peakListeners}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Listeners</div>
                          <div className="font-medium">{session.avgListeners}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">New Fans</div>
                          <div className="font-medium">+{session.newFans}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Tips Earned</div>
                          <div className="font-medium text-accent-coral">${session.tips}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

            {/* Tracks Sub-Tab */}
            {analyticsSubTab === 'tracks' && (
              <div className="space-y-4 mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-foreground/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Top Performing Tracks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analytics.topTracks.map((track, index) => (
                        <div key={index} className="p-4 border border-foreground/10 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{track.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {track.plays.toLocaleString()} plays
                                </span>
                                <div className="flex items-center gap-1">
                                  {getGrowthIcon(track.growth)}
                                  <span className={`text-xs font-medium ${
                                    track.growth > 0 ? 'text-accent-mint' : 
                                    track.growth < 0 ? 'text-destructive' : 'text-muted-foreground'
                                  }`}>
                                    {formatGrowth(track.growth)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-accent-coral" />
                              <span>{track.likes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-accent-blue" />
                              <span>{track.comments}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Share2 className="w-4 h-4 text-accent-mint" />
                              <span>{track.shares}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Audience Sub-Tab */}
            {analyticsSubTab === 'audience' && (
              <div className="space-y-4 mt-6">
                {/* Geographic Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-foreground/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-accent-blue" />
                        Top Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analytics.demographics.locations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {location.country.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{location.country}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{location.percentage}%</div>
                            <div className="text-xs text-muted-foreground">
                              {location.fans} fans
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Age Demographics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-foreground/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent-mint" />
                        Age Groups
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analytics.demographics.ageGroups.map((group, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{group.range} years</span>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent-mint rounded-full"
                                style={{ width: `${group.percentage}%` }}
                              />
                            </div>
                            <span className="font-medium text-sm">{group.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

          {/* Tracks Sub-Tab */}
          {analyticsSubTab === 'tracks' && (
            <div className="space-y-4">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Tracks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.topTracks.map((track, index) => (
                    <div key={index} className="p-4 border border-foreground/10 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{track.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {track.plays.toLocaleString()} plays
                            </span>
                            <div className="flex items-center gap-1">
                              {getGrowthIcon(track.growth)}
                              <span className={`text-xs font-medium ${
                                track.growth > 0 ? 'text-accent-mint' : 
                                track.growth < 0 ? 'text-destructive' : 'text-muted-foreground'
                              }`}>
                                {formatGrowth(track.growth)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-accent-coral" />
                          <span>{track.likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-accent-blue" />
                          <span>{track.comments}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-accent-mint" />
                          <span>{track.shares}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audience Sub-Tab */}
          {analyticsSubTab === 'audience' && (
            <div className="space-y-4">
              {/* Geographic Distribution */}
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent-blue" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.demographics.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {location.country.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{location.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{location.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          {location.fans} fans
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Age Demographics */}
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-mint" />
                    Age Groups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{group.range} years</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent-mint rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Live Session CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-accent-coral/20 bg-gradient-to-r from-accent-coral/5 to-accent-coral/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-accent-coral" />
                    <span className="font-semibold">Go Live</span>
                    {stats.isLive && (
                      <Badge variant="secondary" className="bg-accent-coral text-background">
                        LIVE • {stats.liveListeners} listeners
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start a live DJ session and connect with your fans in real-time
                  </p>
                </div>
                <Button 
                  onClick={onStartLiveSession}
                  className="bg-accent-coral hover:bg-accent-coral/90 text-background"
                  size="sm"
                >
                  {stats.isLive ? 'Join Live' : 'Go Live'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Store Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="border-foreground/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-accent-coral" />
                  Store Performance
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewChange('artist-store')}
                  className="text-accent-coral hover:text-accent-coral/80"
                >
                  View Store <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Store Stats Mini Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-coral">${storeStats.thisMonthStore}</div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-mint">+{storeStats.storeGrowth}%</div>
                  <div className="text-xs text-muted-foreground">Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{storeStats.totalItems}</div>
                  <div className="text-xs text-muted-foreground">Items</div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Revenue Breakdown</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Music className="w-3 h-3 text-accent-mint" />
                      <span>Tracks</span>
                    </div>
                    <span className="font-medium">${storeStats.breakdown.tracks.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3 h-3 text-accent-coral" />
                      <span>Merch</span>
                    </div>
                    <span className="font-medium">${storeStats.breakdown.merch.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3 h-3 text-accent-blue" />
                      <span>Events</span>
                    </div>
                    <span className="font-medium">${storeStats.breakdown.concerts.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Top Selling Items */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Top Selling Items</div>
                <div className="space-y-2">
                  {storeStats.topSellingItems.slice(0, 3).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                        <div className={`p-1 rounded ${getStoreItemColor(item.type)}`}>
                          {getStoreItemIcon(item.type)}
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-medium">${item.revenue.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">{item.sales} sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sales */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Recent Sales</div>
                <div className="space-y-2">
                  {storeStats.recentSales.slice(0, 2).map((sale, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-secondary/30 rounded-lg p-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`p-1 rounded ${getStoreItemColor(sale.type)}`}>
                          {getStoreItemIcon(sale.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{sale.item}</div>
                          <div className="text-xs text-muted-foreground">{sale.date}</div>
                        </div>
                      </div>
                      <div className="font-medium text-accent-coral ml-2">
                        ${sale.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-foreground/10">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-accent-coral" />
                <CardTitle className="text-lg">Profile Analytics</CardTitle>
              </div>
              
              {/* Time Range Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={profileTimeRange === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfileTimeRange('day')}
                  className={profileTimeRange === 'day' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  Day
                </Button>
                <Button
                  variant={profileTimeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfileTimeRange('week')}
                  className={profileTimeRange === 'week' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  Week
                </Button>
                <Button
                  variant={profileTimeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfileTimeRange('month')}
                  className={profileTimeRange === 'month' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  Month
                </Button>
                <Button
                  variant={profileTimeRange === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfileTimeRange('year')}
                  className={profileTimeRange === 'year' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  Year
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={profileTimeRange === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className={profileTimeRange === 'custom' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Custom
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{ from: profileDateRange.from, to: profileDateRange.to }}
                      onSelect={(range: any) => {
                        setProfileDateRange({ from: range?.from, to: range?.to });
                        if (range?.from && range?.to) {
                          setProfileTimeRange('custom');
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                
                <Badge variant="outline" className="ml-auto border-accent-coral/50 text-accent-coral font-mono">
                  {getProfileTimeRangeLabel()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 border border-foreground/10 bg-accent-coral/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-accent-coral" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Views</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {MOCK_PROFILE_ANALYTICS.totalViews.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 border border-foreground/10 bg-accent-mint/5">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-accent-mint" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">This Week</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {MOCK_PROFILE_ANALYTICS.viewsThisWeek}
                  </div>
                </div>
                
                <div className="p-4 border border-foreground/10 bg-accent-blue/5 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-accent-blue" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Growth</span>
                  </div>
                  <div className="text-2xl font-semibold text-accent-mint">
                    +{MOCK_PROFILE_ANALYTICS.viewGrowth}%
                  </div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium">Where your profile views came from</h4>
                </div>
                <div className="space-y-3">
                  {MOCK_PROFILE_ANALYTICS.trafficSources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${source.color} rounded-full`}></div>
                          <span className="font-medium">{source.source}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{source.views.toLocaleString()} views</span>
                          <span className="font-medium min-w-[3rem] text-right">{source.percentage}%</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-foreground/5 h-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${source.color}`}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewer Demographics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium">Who's viewing your profile</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {MOCK_PROFILE_ANALYTICS.topViewers.map((viewer) => (
                    <div key={viewer.type} className="p-4 border border-foreground/10">
                      <div className="text-lg font-semibold text-foreground mb-1">
                        {viewer.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {viewer.type}
                      </div>
                      <div className="text-sm font-medium text-accent-coral">
                        {viewer.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="border-foreground/20 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Essential tools for managing your music</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start gap-4 h-16 bg-secondary/50 hover:bg-secondary border border-foreground/10 hover:border-accent-mint/40 text-foreground transition-all duration-200"
                onClick={onCreateContent}
              >
                <div className="w-10 h-10 bg-accent-mint/15 border border-accent-mint/25 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-accent-mint" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Upload New Track</div>
                  <div className="text-sm text-muted-foreground">Share your latest creation</div>
                </div>
              </Button>

              <Button 
                className="w-full justify-start gap-4 h-16 bg-secondary/50 hover:bg-secondary border border-foreground/10 hover:border-accent-blue/40 text-foreground transition-all duration-200"
                onClick={onCreateCrate}
              >
                <div className="w-10 h-10 bg-accent-blue/15 border border-accent-blue/25 rounded-lg flex items-center justify-center">
                  <List className="w-5 h-5 text-accent-blue" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Create Crate</div>
                  <div className="text-sm text-muted-foreground">Curate your favorite tracks</div>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start gap-4 h-16 bg-secondary/50 hover:bg-secondary border border-foreground/10 hover:border-accent-yellow/40 text-foreground transition-all duration-200"
                onClick={() => onViewChange('artist-fans')}
              >
                <div className="w-10 h-10 bg-accent-yellow/15 border border-accent-yellow/25 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-yellow" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Engage with Fans</div>
                  <div className="text-sm text-muted-foreground">Connect and grow community</div>
                </div>
              </Button>
              
              <Button 
                className="w-full justify-start gap-4 h-16 bg-secondary/50 hover:bg-secondary border border-foreground/10 hover:border-accent-coral/40 text-foreground transition-all duration-200"
                onClick={() => onViewChange('artist-store')}
              >
                <div className="w-10 h-10 bg-accent-coral/15 border border-accent-coral/25 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-accent-coral" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Manage Store</div>
                  <div className="text-sm text-muted-foreground">Update merch and pricing</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">@{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg">
                  <div className="w-12 h-12 bg-accent-mint/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent-mint" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {event.date} • {event.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

            {/* Bottom Spacing for Mobile Navigation */}
            <div className="h-20"></div>
          </>
        )}
      </div>
    </div>
  );
}