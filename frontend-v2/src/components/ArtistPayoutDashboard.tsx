import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  CreditCard,
  History,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface PayoutDashboardProps {
  apiBaseUrl?: string;
}

interface ConnectStatus {
  hasAccount: boolean;
  status: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted?: boolean;
}

interface Balance {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  initiatedAt: string;
  arrivalDate?: string;
  completedAt?: string;
  failureMessage?: string;
}

interface Transfer {
  id: string;
  amount: number;
  currency: string;
  created: string;
  description?: string;
}

export function ArtistPayoutDashboard({ apiBaseUrl = '/api' }: PayoutDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch connect status
      const statusRes = await fetch(`${apiBaseUrl}/stripe/connect/status`, {
        credentials: 'include',
      });
      const statusData = await statusRes.json();
      setConnectStatus(statusData);

      if (statusData.hasAccount && statusData.payoutsEnabled) {
        // Fetch balance and history
        const [balanceRes, payoutsRes, transfersRes] = await Promise.all([
          fetch(`${apiBaseUrl}/stripe/connect/balance`, { credentials: 'include' }),
          fetch(`${apiBaseUrl}/stripe/connect/payouts`, { credentials: 'include' }),
          fetch(`${apiBaseUrl}/stripe/connect/transfers`, { credentials: 'include' }),
        ]);

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData);
        }

        if (payoutsRes.ok) {
          const payoutsData = await payoutsRes.json();
          setPayouts(payoutsData.payouts || []);
        }

        if (transfersRes.ok) {
          const transfersData = await transfersRes.json();
          setTransfers(transfersData.transfers || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check for URL params from Stripe redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect_success') === 'true') {
      toast.success('Stripe account connected successfully!');
      if (params.get('payouts_enabled') === 'true') {
        toast.success('Payouts are now enabled!');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('connect_error')) {
      toast.error(`Failed to connect: ${params.get('connect_error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('connect_refresh') === 'true') {
      toast.info('Please complete your Stripe account setup');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [apiBaseUrl]);

  // Create Stripe Connect account
  const handleCreateAccount = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/stripe/connect/account`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create account');
      }

      // Get onboarding link
      const onboardingRes = await fetch(`${apiBaseUrl}/stripe/connect/onboarding`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshUrl: `${window.location.origin}/artist/settings?connect_refresh=true`,
          returnUrl: `${window.location.origin}/artist/settings?connect_return=true`,
        }),
      });

      if (!onboardingRes.ok) {
        throw new Error('Failed to create onboarding link');
      }

      const { url } = await onboardingRes.json();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment account');
      setIsConnecting(false);
    }
  };

  // Continue onboarding
  const handleContinueOnboarding = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/stripe/connect/onboarding`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshUrl: `${window.location.origin}/artist/settings?connect_refresh=true`,
          returnUrl: `${window.location.origin}/artist/settings?connect_return=true`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create onboarding link');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to continue setup');
      setIsConnecting(false);
    }
  };

  // Request payout
  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const availableBalance = balance?.available[0]?.amount || 0;
    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }

    setIsRequestingPayout(true);
    try {
      const res = await fetch(`${apiBaseUrl}/stripe/connect/payout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to request payout');
      }

      const payout = await res.json();
      toast.success(`Payout of $${amount.toFixed(2)} initiated!`);
      setPayoutAmount('');
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to request payout');
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30"><ArrowUpRight className="w-3 h-3 mr-1" />In Transit</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'FAILED':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'CANCELED':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No Stripe account connected
  if (!connectStatus?.hasAccount) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Set Up Payouts</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Connect your bank account to receive payouts from your sales.
            You'll keep 90% of every sale - we only take 10%.
          </p>
          <Button onClick={handleCreateAccount} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Connect with Stripe
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Powered by Stripe for secure payments
          </p>
        </CardContent>
      </Card>
    );
  }

  // Account exists but not fully set up
  if (!connectStatus?.payoutsEnabled) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Complete Your Setup</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Your Stripe account is created but needs additional information before you can receive payouts.
          </p>
          <Button onClick={handleContinueOnboarding} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue Setup
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fully connected - show dashboard
  const availableBalance = balance?.available[0]?.amount || 0;
  const pendingBalance = balance?.pending[0]?.amount || 0;

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-500">
                {formatCurrency(availableBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pending Balance</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-amber-500">
                {formatCurrency(pendingBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Processing...</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Payouts enabled</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Request Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Request Payout
          </CardTitle>
          <CardDescription>
            Transfer your available balance to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available: {formatCurrency(availableBalance)}
              </p>
            </div>
            <Button
              onClick={handleRequestPayout}
              disabled={isRequestingPayout || !payoutAmount || parseFloat(payoutAmount) <= 0}
              className="sm:w-auto"
            >
              {isRequestingPayout ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Request Payout
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Payout History
            </CardTitle>
            <CardDescription>Your recent payout requests</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payouts yet</p>
              <p className="text-sm">Request your first payout when you have available balance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatCurrency(payout.amount, payout.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(payout.initiatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payout.status)}
                    {payout.arrivalDate && payout.status !== 'PAID' && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Expected: {new Date(payout.arrivalDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sales (Transfers) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Recent Sales
          </CardTitle>
          <CardDescription>Income from your products</CardDescription>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sales yet</p>
              <p className="text-sm">Sales from your marketplace products will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium text-green-500">
                        +{formatCurrency(transfer.amount, transfer.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transfer.description || 'Product sale'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(transfer.created).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>Payouts typically arrive in 2-7 business days</p>
        <p>You keep 90% of every sale. Platform fee: 10%</p>
      </div>
    </div>
  );
}
