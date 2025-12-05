import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
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
  BarChart3,
  Globe,
  Clock,
  Download,
  Repeat,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface ArtistAnalyticsProps {
  user: any;
  onViewChange?: (view: string) => void;
}

export function ArtistAnalytics({ user, onViewChange }: ArtistAnalyticsProps) {
  const [timeframe, setTimeframe] = useState('week');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'audience'>('overview');

  // Generate analytics data based on selected timeframe
  const analytics = useMemo(() => {
    // Base multipliers for different timeframes
    const multipliers = {
      day: 0.15,
      week: 1,
      month: 4.2,
      year: 52,
      custom: dateRange.from && dateRange.to 
        ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24 * 7)))
        : 1
    };

    const activeTimeframe = (dateRange.from && dateRange.to) ? 'custom' : timeframe;
    const multiplier = multipliers[activeTimeframe as keyof typeof multipliers];

    return {
    overview: {
      totalPlays: Math.round(45620 * multiplier),
      totalFans: Math.round(2847 * (multiplier * 0.3 + 0.7)), // Fans grow slower
      totalTracks: 47, // Tracks don't change with timeframe
      totalRevenue: parseFloat((1240.50 * multiplier).toFixed(2)),
      weeklyGrowth: {
        plays: 12.5,
        fans: 8.3,
        revenue: 15.2
      }
    },
    topTracks: [
      {
        title: "Midnight Vibes",
        plays: Math.round(8520 * multiplier),
        likes: Math.round(342 * multiplier),
        comments: Math.round(89 * multiplier),
        shares: Math.round(45 * multiplier),
        growth: 15.2
      },
      {
        title: "City Lights",
        plays: Math.round(6750 * multiplier),
        likes: Math.round(298 * multiplier),
        comments: Math.round(67 * multiplier),
        shares: Math.round(32 * multiplier),
        growth: 8.7
      },
      {
        title: "Ocean Dreams",
        plays: Math.round(4890 * multiplier),
        likes: Math.round(187 * multiplier),
        comments: Math.round(34 * multiplier),
        shares: Math.round(21 * multiplier),
        growth: -2.1
      },
      {
        title: "Neon Nights",
        plays: Math.round(3420 * multiplier),
        likes: Math.round(156 * multiplier),
        comments: Math.round(28 * multiplier),
        shares: Math.round(18 * multiplier),
        growth: 22.4
      }
    ],
    demographics: {
      locations: [
        { country: 'United States', percentage: 35, fans: Math.round(996 * (multiplier * 0.3 + 0.7)) },
        { country: 'United Kingdom', percentage: 18, fans: Math.round(512 * (multiplier * 0.3 + 0.7)) },
        { country: 'Canada', percentage: 12, fans: Math.round(341 * (multiplier * 0.3 + 0.7)) },
        { country: 'Australia', percentage: 8, fans: Math.round(228 * (multiplier * 0.3 + 0.7)) },
        { country: 'Germany', percentage: 7, fans: Math.round(199 * (multiplier * 0.3 + 0.7)) }
      ],
      ageGroups: [
        { range: '18-24', percentage: 28 },
        { range: '25-34', percentage: 42 },
        { range: '35-44', percentage: 20 },
        { range: '45+', percentage: 10 }
      ]
    },
    recentSessions: [
      {
        date: '2024-10-06',
        duration: '2h 15m',
        peakListeners: Math.round(247 * (multiplier * 0.2 + 0.8)),
        avgListeners: Math.round(156 * (multiplier * 0.2 + 0.8)),
        newFans: Math.round(12 * (multiplier * 0.3 + 0.7)),
        tips: parseFloat((45.50 * multiplier).toFixed(2))
      },
      {
        date: '2024-10-04',
        duration: '1h 45m',
        peakListeners: Math.round(189 * (multiplier * 0.2 + 0.8)),
        avgListeners: Math.round(124 * (multiplier * 0.2 + 0.8)),
        newFans: Math.round(8 * (multiplier * 0.3 + 0.7)),
        tips: parseFloat((32.00 * multiplier).toFixed(2))
      },
      {
        date: '2024-10-02',
        duration: '3h 00m',
        peakListeners: Math.round(312 * (multiplier * 0.2 + 0.8)),
        avgListeners: Math.round(198 * (multiplier * 0.2 + 0.8)),
        newFans: Math.round(18 * (multiplier * 0.3 + 0.7)),
        tips: parseFloat((67.25 * multiplier).toFixed(2))
      }
    ]
    };
  }, [timeframe, dateRange]);

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-accent-mint" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth}%`;
  };

  const formatDateRange = () => {
    if (!dateRange.from) return 'Select dates';
    if (!dateRange.to) return dateRange.from.toLocaleDateString();
    return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      // Start new range
      setDateRange({ from: date, to: undefined });
    } else {
      // Complete range
      if (date && date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
    }
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setTimeframe('week');
    setShowDatePicker(false);
  };

  return (
    <div className="artist-analytics min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Header */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your performance and grow your audience</p>
        </motion.div>

        {/* Time Filter */}
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
                    setTimeframe(period);
                    setShowDatePicker(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeframe === period && !showDatePicker
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
              
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      showDatePicker
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
                      {(dateRange.from || dateRange.to) && (
                        <button
                          onClick={clearDateRange}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateRange()}
                    </div>
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.from || dateRange.to}
                    onSelect={handleDateSelect}
                    className="border-0"
                  />
                  {dateRange.from && dateRange.to && (
                    <div className="p-3 border-t border-foreground/10">
                      <Button
                        size="sm"
                        className="w-full bg-accent-coral hover:bg-accent-coral/90 text-background"
                        onClick={() => setShowDatePicker(false)}
                      >
                        Apply Date Range
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Date Range Display - Shows when custom range is selected */}
          {dateRange.from && dateRange.to && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-accent-coral/10 border border-accent-coral/30 rounded-lg">
                <Calendar className="w-4 h-4 text-accent-coral" />
                <span className="text-sm font-medium">{formatDateRange()}</span>
                <button
                  onClick={clearDateRange}
                  className="ml-1 p-0.5 hover:bg-accent-coral/20 rounded transition-colors"
                  aria-label="Clear date range"
                >
                  <X className="w-3 h-3 text-accent-coral" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tab Buttons */}
        <motion.div 
          className="flex justify-center gap-3 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'tracks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tracks')}
            className={activeTab === 'tracks' ? 'bg-accent-blue hover:bg-accent-blue/90 text-background' : ''}
          >
            <Music className="w-4 h-4 mr-2" />
            Tracks
          </Button>
          <Button
            variant={activeTab === 'audience' ? 'default' : 'outline'}
            onClick={() => setActiveTab('audience')}
            className={activeTab === 'audience' ? 'bg-accent-mint hover:bg-accent-mint/90 text-background' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            Audience
          </Button>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 mt-6">
            {/* Key Metrics */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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
            </motion.div>

            {/* Recent Live Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
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
            </motion.div>
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="space-y-4 mt-6">
            {/* Top Tracks Performance */}
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

        {/* Audience Tab */}
        {activeTab === 'audience' && (
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

        {/* Bottom Spacing for Mobile Navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}