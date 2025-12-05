import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  TrendingUp, 
  Download, 
  DollarSign, 
  Users, 
  Calendar,
  Music,
  BarChart3,
  PieChart,
  Play,
  Heart,
  ShoppingBag,
  Ticket,
  Package,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface StoreAnalyticsProps {
  tracks: any[];
  merch: any[];
  concerts: any[];
}

export function StoreAnalytics({ tracks, merch, concerts }: StoreAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'merch' | 'concerts'>('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return 'Last 24 hours';
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'year': return 'Last 12 months';
      case 'custom':
        if (dateRange.from && dateRange.to) {
          return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
        }
        return 'Custom range';
      default: return 'Last 30 days';
    }
  };

  // Mock analytics data for merch (in real app, this would come from API)
  const merchAnalytics = merch.map(item => ({
    ...item,
    sales: Math.floor(Math.random() * 50) + 5,
    revenue: parseFloat((Math.random() * 500 + 100).toFixed(2)),
    views: Math.floor(Math.random() * 200) + 20,
    conversionRate: parseFloat((Math.random() * 10 + 2).toFixed(1))
  }));

  // Mock analytics data for concerts (in real app, this would come from API)
  const concertAnalytics = concerts.map(item => ({
    ...item,
    ticketsSold: Math.floor(Math.random() * 150) + 20,
    capacity: Math.floor(Math.random() * 100) + 200,
    revenue: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
    attendance: parseFloat((Math.random() * 30 + 60).toFixed(1))
  }));

  // Calculate aggregate metrics
  const totalTracksRevenue = tracks.reduce((sum, track) => sum + track.revenue, 0);
  const totalMerchRevenue = merchAnalytics.reduce((sum, item) => sum + item.revenue, 0);
  const totalConcertsRevenue = concertAnalytics.reduce((sum, item) => sum + item.revenue, 0);
  const totalRevenue = totalTracksRevenue + totalMerchRevenue + totalConcertsRevenue;

  const totalTrackSales = tracks.reduce((sum, track) => sum + track.downloadCount, 0);
  const totalMerchSales = merchAnalytics.reduce((sum, item) => sum + item.sales, 0);
  const totalConcertTickets = concertAnalytics.reduce((sum, item) => sum + item.ticketsSold, 0);
  const totalSales = totalTrackSales + totalMerchSales + totalConcertTickets;

  // Sort items by performance
  const topMerch = [...merchAnalytics].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topConcerts = [...concertAnalytics].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topTracks = [...tracks].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={timeRange === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('day')}
          className={timeRange === 'day' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
        >
          Day
        </Button>
        <Button
          variant={timeRange === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('week')}
          className={timeRange === 'week' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
        >
          Week
        </Button>
        <Button
          variant={timeRange === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('month')}
          className={timeRange === 'month' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
        >
          Month
        </Button>
        <Button
          variant={timeRange === 'year' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange('year')}
          className={timeRange === 'year' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
        >
          Year
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={timeRange === 'custom' ? 'default' : 'outline'}
              size="sm"
              className={timeRange === 'custom' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Custom
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range: any) => {
                setDateRange({ from: range?.from, to: range?.to });
                if (range?.from && range?.to) {
                  setTimeRange('custom');
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        <Badge variant="outline" className="ml-auto border-accent-coral/50 text-accent-coral font-mono">
          {getTimeRangeLabel()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-accent-mint flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +12.5% this month
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-accent-mint" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-semibold">{totalSales.toLocaleString()}</p>
              <p className="text-xs text-accent-blue flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +8.3% this month
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-accent-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Avg Order</p>
              <p className="text-2xl font-semibold">${(totalRevenue / totalSales || 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Minus className="w-3 h-3" />
                0% change
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-accent-yellow" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Active Items</p>
              <p className="text-2xl font-semibold">{tracks.length + merch.length + concerts.length}</p>
              <p className="text-xs text-accent-coral flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +2 this week
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-accent-coral" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Revenue Breakdown
        </h3>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Music className="w-4 h-4 text-accent-mint" />
                <span className="text-sm">Tracks</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-[200px]">
                  <div 
                    className="h-full bg-accent-mint rounded-full"
                    style={{ width: `${(totalTracksRevenue / totalRevenue) * 100}%` }}
                  />
                </div>
                <span className="font-medium w-20 text-right">${totalTracksRevenue.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {((totalTracksRevenue / totalRevenue) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <ShoppingBag className="w-4 h-4 text-accent-coral" />
                <span className="text-sm">Merch</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-[200px]">
                  <div 
                    className="h-full bg-accent-coral rounded-full"
                    style={{ width: `${(totalMerchRevenue / totalRevenue) * 100}%` }}
                  />
                </div>
                <span className="font-medium w-20 text-right">${totalMerchRevenue.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {((totalMerchRevenue / totalRevenue) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Ticket className="w-4 h-4 text-accent-blue" />
                <span className="text-sm">Concerts</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-[200px]">
                  <div 
                    className="h-full bg-accent-blue rounded-full"
                    style={{ width: `${(totalConcertsRevenue / totalRevenue) * 100}%` }}
                  />
                </div>
                <span className="font-medium w-20 text-right">${totalConcertsRevenue.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {((totalConcertsRevenue / totalRevenue) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Performers Across All Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Tracks */}
        {topTracks.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-accent-mint" />
              Top Tracks
            </h3>
            <div className="space-y-3">
              {topTracks.slice(0, 3).map((track, index) => (
                <div key={track.id} className="flex items-start gap-2">
                  <span className="text-sm font-mono text-muted-foreground w-4">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{track.title}</p>
                    <p className="text-xs text-muted-foreground">{track.downloadCount} sales</p>
                  </div>
                  <p className="text-sm font-medium text-accent-mint">${track.revenue.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Merch */}
        {topMerch.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent-coral" />
              Top Merch
            </h3>
            <div className="space-y-3">
              {topMerch.slice(0, 3).map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <span className="text-sm font-mono text-muted-foreground w-4">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sales} sales</p>
                  </div>
                  <p className="text-sm font-medium text-accent-coral">${item.revenue.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Concerts */}
        {topConcerts.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-accent-blue" />
              Top Events
            </h3>
            <div className="space-y-3">
              {topConcerts.slice(0, 3).map((concert, index) => (
                <div key={concert.id} className="flex items-start gap-2">
                  <span className="text-sm font-mono text-muted-foreground w-4">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{concert.title}</p>
                    <p className="text-xs text-muted-foreground">{concert.ticketsSold} tickets</p>
                  </div>
                  <p className="text-sm font-medium text-accent-blue">${concert.revenue.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  const renderMerchAnalytics = () => (
    <div className="space-y-6">
      {/* Merch Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-semibold">{merch.length}</p>
            </div>
            <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-accent-coral" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Sales</p>
              <p className="text-2xl font-semibold">{totalMerchSales}</p>
            </div>
            <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-accent-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold">${totalMerchRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-accent-mint" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Avg Price</p>
              <p className="text-2xl font-semibold">${(totalMerchRevenue / totalMerchSales || 0).toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-accent-yellow" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Selling Merch */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Selling Items
        </h3>
        <div className="space-y-3">
          {topMerch.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
            >
              <div className="w-12 h-12 bg-cover bg-center rounded flex-shrink-0"
                   style={{ backgroundImage: `url(${item.image})` }} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.sales} sales • {item.conversionRate}% conversion
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-accent-coral">${item.revenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{item.views} views</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Merch Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-mint" />
              Performance Tips
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Items with multiple photos sell 32% more</p>
              <p>• Limited edition items drive urgency</p>
              <p>• Bundle merch with tracks for higher revenue</p>
              <p>• Share customer photos for social proof</p>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent-coral" />
              Marketing Ideas
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Offer exclusive designs for top fans</p>
              <p>• Create limited drops for special events</p>
              <p>• Include merch discount codes in albums</p>
              <p>• Collaborate with other artists on designs</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderConcertAnalytics = () => (
    <div className="space-y-6">
      {/* Concert Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-semibold">{concerts.length}</p>
            </div>
            <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5 text-accent-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Tickets Sold</p>
              <p className="text-2xl font-semibold">{totalConcertTickets}</p>
            </div>
            <div className="w-10 h-10 bg-accent-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-accent-mint" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold">${totalConcertsRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-accent-coral" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
              <p className="text-2xl font-semibold">
                {concertAnalytics.length > 0 
                  ? (concertAnalytics.reduce((sum, c) => sum + c.attendance, 0) / concertAnalytics.length).toFixed(0)
                  : 0}%
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-accent-yellow" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Events */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Performing Events
        </h3>
        <div className="space-y-3">
          {topConcerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
            >
              <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ticket className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{concert.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{concert.city}</span>
                  {concert.date && (
                    <>
                      <span>•</span>
                      <Calendar className="w-3 h-3" />
                      <span>{concert.date}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {concert.ticketsSold} tickets • {concert.attendance}% attendance
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-accent-coral">${concert.revenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {concert.capacity && `of ${concert.capacity} capacity`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Concert Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-mint" />
              Venue Optimization
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Smaller venues often have better engagement</p>
              <p>• Mid-week shows can have lower overhead</p>
              <p>• Partner with local artists to share costs</p>
              <p>• Consider live streaming for remote fans</p>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent-coral" />
              Promotion Tips
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Early bird pricing increases advance sales</p>
              <p>• Bundle tickets with merch for more revenue</p>
              <p>• Use local press and radio for promotion</p>
              <p>• Offer VIP experiences for superfans</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTrackAnalytics = () => {
    const totalDownloads = tracks.reduce((sum, track) => sum + track.downloadCount, 0);
    const avgPrice = tracks.length > 0 ? totalTracksRevenue / totalDownloads || 0 : 0;

    return (
      <div className="space-y-6">
        {/* Track Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Total Tracks</p>
                <p className="text-2xl font-semibold">{tracks.length}</p>
              </div>
              <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-accent-coral" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl font-semibold">{totalDownloads.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-accent-blue" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-semibold">${totalTracksRevenue.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-accent-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-accent-mint" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-semibold">${avgPrice.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-accent-yellow" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performing Tracks */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Performing Tracks
          </h3>
          <div className="space-y-3">
            {topTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
              >
                <div className="w-12 h-12 bg-cover bg-center rounded flex-shrink-0"
                     style={{ backgroundImage: `url(${track.artwork})` }} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {track.downloadCount} downloads • {track.genre}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-accent-coral">${track.revenue.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    {track.pricingType === 'pwyw' && (
                      <Badge variant="secondary" className="text-xs">PWYW</Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  if (tracks.length === 0 && merch.length === 0 && concerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">No store data available</p>
        <p className="text-sm text-muted-foreground">Add items to your store to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-foreground/10">
        <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tracks', label: 'Tracks', icon: Music, count: tracks.length },
            { id: 'merch', label: 'Merch', icon: ShoppingBag, count: merch.length },
            { id: 'concerts', label: 'Concerts', icon: Ticket, count: concerts.length }
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                activeTab === id
                  ? 'border-accent-coral text-foreground bg-accent-coral/10'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">{label}</span>
              {count !== undefined && (
                <Badge variant="secondary" className="text-xs">{count}</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tracks' && renderTrackAnalytics()}
        {activeTab === 'merch' && renderMerchAnalytics()}
        {activeTab === 'concerts' && renderConcertAnalytics()}
      </motion.div>

      {/* Bottom Spacing for Mobile Navigation */}
      <div className="h-20"></div>
    </div>
  );
}
