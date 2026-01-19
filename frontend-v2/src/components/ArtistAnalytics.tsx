import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { analyticsApi, AnalyticsSummary } from '../lib/api/analytics';
import { marketplaceApi, Revenue, Product } from '../lib/api/marketplace';

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

  // API data state
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [topCountries, setTopCountries] = useState<{ country: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const days = timeframe === 'day' ? 1
          : timeframe === 'week' ? 7
          : timeframe === 'month' ? 30
          : 365;

        const [summary, countries, revenueData] = await Promise.all([
          analyticsApi.getAnalyticsSummary(days),
          analyticsApi.getTopCountries(5),
          marketplaceApi.getRevenue()
        ]);

        setAnalyticsSummary(summary);
        setTopCountries(countries);
        setRevenue(revenueData);

        // Fetch products if user ID is available
        if (user?.id) {
          const productsData = await marketplaceApi.getArtistProducts(user.id, true);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('[ArtistAnalytics] Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, dateRange, user?.id]);

  // Compute analytics from API data
  const analytics = useMemo(() => {
    const summary = analyticsSummary;
    const totalFans = summary?.newFollowers || 0;

    // Convert top countries to location format
    const totalCountryCount = topCountries.reduce((sum, c) => sum + c.count, 0) || 1;
    const locations = topCountries.map(c => ({
      country: c.country,
      percentage: Math.round((c.count / totalCountryCount) * 100),
      fans: c.count
    }));

    // Top tracks from products
    const topTracks = products
      .filter(p => p.type === 'DIGITAL_TRACK' && p.status === 'PUBLISHED')
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 4)
      .map(p => ({
        title: p.title,
        plays: p.viewCount,
        likes: p.purchaseCount,
        comments: 0,
        shares: 0,
        growth: 0
      }));

    return {
      overview: {
        totalPlays: summary?.trackPlays || 0,
        totalFans: totalFans,
        totalTracks: products.filter(p => p.type === 'DIGITAL_TRACK').length,
        totalRevenue: revenue?.totalRevenue || 0,
        weeklyGrowth: {
          plays: summary?.dailyData?.length
            ? Math.round((summary.trackPlays / summary.dailyData.length) * 10) / 10
            : 0,
          fans: summary?.dailyData?.length
            ? Math.round((summary.newFollowers / summary.dailyData.length) * 10) / 10
            : 0,
          revenue: revenue?.monthlyRevenue
            ? Math.round((revenue.monthlyRevenue / (revenue.totalRevenue || 1)) * 100)
            : 0
        }
      },
      topTracks,
      demographics: {
        locations,
        ageGroups: [] // Not available from current API
      },
      recentSessions: [] // Would need sessions API
    };
  }, [analyticsSummary, revenue, products, topCountries]);

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