import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Ticket, 
  Music,
  Calendar,
  Eye,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

interface MarketplaceRevenueProps {
  user: any;
}

// Mock revenue data
const MOCK_REVENUE_DATA = {
  totalRevenue: 847.50,
  thisMonth: 234.75,
  lastMonth: 189.25,
  growth: 24,
  breakdown: {
    tracks: 420.25,
    merch: 327.50,
    concerts: 99.75
  },
  recentSales: [
    {
      id: 1,
      type: 'track',
      item: 'Digital Dreams',
      amount: 3.00,
      buyer: 'Anonymous',
      date: '2024-10-02',
      format: 'FLAC'
    },
    {
      id: 2,
      type: 'merch',
      item: 'Underground Vibes T-Shirt',
      amount: 25.00,
      buyer: 'Anonymous',
      date: '2024-10-01',
      platform: 'Bandcamp'
    },
    {
      id: 3,
      type: 'concert',
      item: 'Underground Sessions Vol. 3',
      amount: 15.00,
      buyer: 'Anonymous',
      date: '2024-09-30',
      platform: 'Eventbrite'
    },
    {
      id: 4,
      type: 'track',
      item: 'Neon Nights',
      amount: 3.00,
      buyer: 'Anonymous',
      date: '2024-09-29',
      format: 'MP3'
    }
  ],
  topItems: [
    { name: 'Digital Dreams', sales: 45, revenue: 135.00, type: 'track' },
    { name: 'Underground Vibes T-Shirt', sales: 13, revenue: 325.00, type: 'merch' },
    { name: 'Neon Nights', sales: 38, revenue: 114.00, type: 'track' }
  ]
};

export function MarketplaceRevenue({ user }: MarketplaceRevenueProps) {
  const data = MOCK_REVENUE_DATA;
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
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'track': return <Music className="w-4 h-4" />;
      case 'merch': return <ShoppingBag className="w-4 h-4" />;
      case 'concert': return <Ticket className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'track': return 'text-accent-mint';
      case 'merch': return 'text-accent-coral';
      case 'concert': return 'text-accent-blue';
      default: return 'text-foreground';
    }
  };

  return (
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

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold">${data.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-coral" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-semibold">${data.thisMonth.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-mint/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-mint" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Growth</p>
              <p className="text-2xl font-semibold">+{data.growth}%</p>
            </div>
            <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Last Month</p>
              <p className="text-2xl font-semibold">${data.lastMonth.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-accent-yellow" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-accent-mint" />
              <span className="text-sm font-medium">Track Sales</span>
            </div>
            <p className="text-2xl font-semibold">${data.breakdown.tracks.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {((data.breakdown.tracks / data.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-accent-coral" />
              <span className="text-sm font-medium">Merchandise</span>
            </div>
            <p className="text-2xl font-semibold">${data.breakdown.merch.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {((data.breakdown.merch / data.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-medium">Concert Referrals</span>
            </div>
            <p className="text-2xl font-semibold">${data.breakdown.concerts.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {((data.breakdown.concerts / data.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </Card>

      {/* Top Performing Items */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Top Performing Items</h3>
        <div className="space-y-3">
          {data.topItems.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between py-2 border-b border-foreground/10 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground w-8">#{index + 1}</span>
                <div className={`p-1.5 rounded ${getItemColor(item.type)}`}>
                  {getItemIcon(item.type)}
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.sales} sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${item.revenue.toFixed(2)}</p>
                <Badge variant="secondary" className="text-xs capitalize">
                  {item.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Sales */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Sales</h3>
        <div className="space-y-3">
          {data.recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between py-2 border-b border-foreground/10 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${getItemColor(sale.type)}`}>
                  {getItemIcon(sale.type)}
                </div>
                <div>
                  <p className="font-medium">{sale.item}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(sale.date).toLocaleDateString()}</span>
                    {sale.format && <Badge variant="outline" className="text-xs">{sale.format}</Badge>}
                    {sale.platform && <Badge variant="outline" className="text-xs">{sale.platform}</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${sale.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{sale.buyer}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue Notes */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-medium mb-4">Revenue Information</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Track sales: 90% revenue goes to you (minus payment processing fees)</p>
          <p>• Merchandise: External platform fees may apply</p>
          <p>• Concert referrals: Commission-based revenue from ticket sales</p>
          <p>• Payments are processed weekly via Stripe or PayPal</p>
          <p>• All transactions are protected by buyer/seller protection policies</p>
        </div>
      </Card>
    </div>
  );
}