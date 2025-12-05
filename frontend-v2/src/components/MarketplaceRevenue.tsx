import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { marketplaceApi } from '../lib/api/marketplace';
import { PaymentSetupModal } from './PaymentSetupModal';

interface MarketplaceRevenueProps {
  user: any;
}

// No mock data - will be fetched from API
const EMPTY_REVENUE_DATA = {
  totalRevenue: 0,
  thisMonth: 0,
  lastMonth: 0,
  growth: 0,
  breakdown: {
    tracks: 0,
    merch: 0,
    concerts: 0
  },
  recentSales: [],
  topItems: []
};

export function MarketplaceRevenue({ user }: MarketplaceRevenueProps) {
  const data = EMPTY_REVENUE_DATA;
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    stripe: { connected: boolean; status: string | null; chargesEnabled: boolean };
    paypal: { connected: boolean; email: string | null };
  }>({
    stripe: { connected: false, status: null, chargesEnabled: false },
    paypal: { connected: false, email: null }
  });
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(true);

  // Fetch payment status on mount
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const [stripeStatus, paypalStatus] = await Promise.all([
          marketplaceApi.getConnectStatus(),
          marketplaceApi.getPayPalConnectStatus()
        ]);

        setPaymentStatus({
          stripe: {
            connected: stripeStatus.hasAccount,
            status: stripeStatus.status,
            chargesEnabled: stripeStatus.chargesEnabled
          },
          paypal: {
            connected: paypalStatus.hasPayPal,
            email: paypalStatus.email
          }
        });
      } catch (error) {
        console.error('Failed to fetch payment status:', error);
      } finally {
        setLoadingPaymentStatus(false);
      }
    };

    fetchPaymentStatus();
  }, []);

  const handlePaymentSetupComplete = () => {
    setShowPaymentSetup(false);
    // Refresh payment status
    setLoadingPaymentStatus(true);
    Promise.all([
      marketplaceApi.getConnectStatus(),
      marketplaceApi.getPayPalConnectStatus()
    ]).then(([stripeStatus, paypalStatus]) => {
      setPaymentStatus({
        stripe: {
          connected: stripeStatus.hasAccount,
          status: stripeStatus.status,
          chargesEnabled: stripeStatus.chargesEnabled
        },
        paypal: {
          connected: paypalStatus.hasPayPal,
          email: paypalStatus.email
        }
      });
    }).finally(() => setLoadingPaymentStatus(false));
  };
  
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

      {/* Payment Methods */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Payment Methods</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPaymentSetup(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {loadingPaymentStatus ? (
          <div className="text-sm text-muted-foreground">Loading payment methods...</div>
        ) : (
          <div className="space-y-3">
            {/* Stripe */}
            <div className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#635BFF]" />
                </div>
                <div>
                  <div className="font-medium">Stripe Connect</div>
                  <p className="text-xs text-muted-foreground">
                    {paymentStatus.stripe.connected
                      ? paymentStatus.stripe.chargesEnabled
                        ? 'Active - Accepting payments'
                        : 'Pending verification'
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              {paymentStatus.stripe.connected ? (
                <CheckCircle2 className={`w-5 h-5 ${paymentStatus.stripe.chargesEnabled ? 'text-accent-mint' : 'text-amber-500'}`} />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentSetup(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Connect
                </Button>
              )}
            </div>

            {/* PayPal */}
            <div className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#003087]" />
                </div>
                <div>
                  <div className="font-medium">PayPal</div>
                  <p className="text-xs text-muted-foreground">
                    {paymentStatus.paypal.connected
                      ? paymentStatus.paypal.email
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              {paymentStatus.paypal.connected ? (
                <CheckCircle2 className="w-5 h-5 text-accent-mint" />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentSetup(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Connect
                </Button>
              )}
            </div>

            {/* Warning if no payment method */}
            {!paymentStatus.stripe.connected && !paymentStatus.paypal.connected && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-500">No payment method connected</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Connect at least one payment method to receive payments from your sales.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
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

      {/* Payment Setup Modal */}
      <PaymentSetupModal
        isOpen={showPaymentSetup}
        onClose={() => setShowPaymentSetup(false)}
        onComplete={handlePaymentSetupComplete}
        user={user}
      />
    </div>
  );
}