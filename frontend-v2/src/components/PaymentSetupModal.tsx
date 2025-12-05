import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { marketplaceApi, ConnectStatus } from '../lib/api/marketplace';

interface PaymentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: any;
}

type SetupStep = 'intro' | 'stripe' | 'paypal' | 'complete';

interface PaymentStatus {
  stripe: {
    connected: boolean;
    status: string | null;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  };
  paypal: {
    connected: boolean;
    email: string | null;
  };
}

export function PaymentSetupModal({ isOpen, onClose, onComplete, user }: PaymentSetupModalProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    stripe: { connected: false, status: null, chargesEnabled: false, payoutsEnabled: false },
    paypal: { connected: false, email: null }
  });

  // Check existing payment setup status
  const checkPaymentStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      // Check Stripe Connect status and PayPal status in parallel
      const [stripeStatus, paypalStatus] = await Promise.all([
        marketplaceApi.getConnectStatus(),
        marketplaceApi.getPayPalConnectStatus()
      ]);

      setPaymentStatus({
        stripe: {
          connected: stripeStatus.hasAccount,
          status: stripeStatus.status,
          chargesEnabled: stripeStatus.chargesEnabled,
          payoutsEnabled: stripeStatus.payoutsEnabled
        },
        paypal: {
          connected: paypalStatus.hasPayPal,
          email: paypalStatus.email
        }
      });

      // If already set up with at least one method, go to complete
      const hasStripe = stripeStatus.hasAccount && stripeStatus.chargesEnabled;
      const hasPayPal = paypalStatus.hasPayPal;
      if (hasStripe || hasPayPal) {
        setStep('complete');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkPaymentStatus();
    }
  }, [isOpen, checkPaymentStatus]);

  // Handle Stripe Connect onboarding
  const handleStripeSetup = async () => {
    setLoading(true);
    try {
      // First check if account already exists
      let accountId: string | undefined;

      try {
        const status = await marketplaceApi.getConnectStatus();
        if (status.hasAccount) {
          // Account exists, just get onboarding link
          accountId = 'existing';
        }
      } catch (error) {
        // No account exists, create one
      }

      if (!accountId) {
        // Create new Connect account
        const result = await marketplaceApi.createConnectAccount();
        accountId = result.accountId;
      }

      // Get onboarding link
      const { url } = await marketplaceApi.getConnectOnboardingLink({
        refreshUrl: `${window.location.origin}/settings/payments?refresh=true`,
        returnUrl: `${window.location.origin}/settings/payments?success=true`
      });

      // Open Stripe onboarding in new tab
      window.open(url, '_blank');

      toast.success('Stripe setup started', {
        description: 'Complete the setup in the new tab, then return here.'
      });

      // Show a button to continue after they return
      setStep('stripe');
    } catch (error: any) {
      console.error('Stripe setup error:', error);
      toast.error('Failed to start Stripe setup', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle PayPal setup
  const handlePayPalSetup = async () => {
    if (!paypalEmail || !paypalEmail.includes('@')) {
      toast.error('Please enter a valid PayPal email');
      return;
    }

    setLoading(true);
    try {
      // Save PayPal email to backend
      await marketplaceApi.savePayPalEmail(paypalEmail);

      setPaymentStatus(prev => ({
        ...prev,
        paypal: { connected: true, email: paypalEmail }
      }));

      toast.success('PayPal connected', {
        description: `Payments will be sent to ${paypalEmail}`
      });

      setStep('complete');
    } catch (error: any) {
      toast.error('Failed to save PayPal settings', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if stripe onboarding was completed
  const handleStripeVerify = async () => {
    setLoading(true);
    try {
      const status = await marketplaceApi.getConnectStatus();

      if (status.chargesEnabled) {
        setPaymentStatus(prev => ({
          ...prev,
          stripe: {
            connected: true,
            status: status.status,
            chargesEnabled: status.chargesEnabled,
            payoutsEnabled: status.payoutsEnabled
          }
        }));

        toast.success('Stripe account verified!');
        setStep('complete');
      } else if (status.hasAccount) {
        toast.info('Account setup incomplete', {
          description: 'Please complete the Stripe onboarding process'
        });
      } else {
        toast.error('No Stripe account found', {
          description: 'Please start the setup process again'
        });
        setStep('intro');
      }
    } catch (error) {
      toast.error('Failed to verify Stripe account');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const renderIntroStep = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-accent-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-accent-coral" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Set Up Payments</h3>
        <p className="text-muted-foreground text-sm">
          Connect a payment account to receive money from your sales.
          You need at least one payment method to sell on Seda.
        </p>
      </div>

      <div className="space-y-3">
        {/* Stripe Option */}
        <button
          onClick={() => handleStripeSetup()}
          disabled={loading}
          className="w-full p-4 border border-foreground/10 rounded-lg hover:border-accent-coral/50 hover:bg-accent-coral/5 transition-colors text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#635BFF]" />
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  Stripe Connect
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Accept credit cards, Apple Pay, Google Pay</p>
              </div>
            </div>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent-coral transition-colors" />
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            2.9% + $0.30 per transaction
          </div>
        </button>

        {/* PayPal Option */}
        <button
          onClick={() => setStep('paypal')}
          disabled={loading}
          className="w-full p-4 border border-foreground/10 rounded-lg hover:border-accent-coral/50 hover:bg-accent-coral/5 transition-colors text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#003087]" />
              </div>
              <div>
                <div className="font-medium">PayPal</div>
                <p className="text-sm text-muted-foreground">Accept PayPal and Venmo payments</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent-coral transition-colors" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            3.49% + $0.49 per transaction
          </div>
        </button>
      </div>

      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          You'll receive 90% of each sale. Seda takes a 10% platform fee to keep the service running.
          Payment processing fees are separate.
        </p>
      </div>
    </div>
  );

  const renderStripeStep = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-[#635BFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-[#635BFF]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Complete Stripe Setup</h3>
        <p className="text-muted-foreground text-sm">
          Complete your Stripe onboarding in the new tab, then return here to verify.
        </p>
      </div>

      <div className="p-4 border border-foreground/10 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-accent-coral/20 flex items-center justify-center text-xs font-medium">1</div>
          <span>Complete the Stripe onboarding form</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-accent-coral/20 flex items-center justify-center text-xs font-medium">2</div>
          <span>Verify your identity and banking info</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-full bg-accent-coral/20 flex items-center justify-center text-xs font-medium">3</div>
          <span>Return here and click "Verify Setup"</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleStripeVerify}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Verify Setup
            </>
          )}
        </Button>
        <Button
          onClick={handleStripeSetup}
          variant="outline"
          disabled={loading}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Reopen Stripe
        </Button>
      </div>

      <Button
        onClick={() => setStep('intro')}
        variant="ghost"
        className="w-full"
      >
        Back to options
      </Button>
    </div>
  );

  const renderPayPalStep = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-[#003087]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-[#003087]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect PayPal</h3>
        <p className="text-muted-foreground text-sm">
          Enter your PayPal email address to receive payments.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="paypal-email">PayPal Email Address</Label>
          <Input
            id="paypal-email"
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="your@email.com"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Make sure this is the email associated with your PayPal Business or Personal account.
          </p>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-500">Important</p>
              <p className="text-muted-foreground text-xs mt-1">
                For higher volume sales, we recommend upgrading to a PayPal Business account
                to avoid transaction limits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handlePayPalSetup}
          disabled={loading || !paypalEmail}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Connect PayPal'
          )}
        </Button>
      </div>

      <Button
        onClick={() => setStep('intro')}
        variant="ghost"
        className="w-full"
      >
        Back to options
      </Button>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-accent-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-accent-mint" />
        </div>
        <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
        <p className="text-muted-foreground text-sm">
          Your payment account is connected. You can now start selling on Seda.
        </p>
      </div>

      <div className="space-y-3">
        {paymentStatus.stripe.connected && (
          <div className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#635BFF]" />
              </div>
              <div>
                <div className="font-medium text-sm">Stripe Connect</div>
                <div className="text-xs text-muted-foreground">
                  {paymentStatus.stripe.chargesEnabled ? 'Active' : 'Pending verification'}
                </div>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent-mint" />
          </div>
        )}

        {paymentStatus.paypal.connected && (
          <div className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003087]/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-[#003087]" />
              </div>
              <div>
                <div className="font-medium text-sm">PayPal</div>
                <div className="text-xs text-muted-foreground">{paymentStatus.paypal.email}</div>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-accent-mint" />
          </div>
        )}
      </div>

      <Button onClick={handleComplete} className="w-full">
        Continue to Add Products
      </Button>

      {/* Option to add another method */}
      {(!paymentStatus.stripe.connected || !paymentStatus.paypal.connected) && (
        <Button
          onClick={() => setStep('intro')}
          variant="ghost"
          className="w-full"
        >
          Add another payment method
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border border-foreground/10">
        <DialogHeader>
          <DialogTitle>
            {step === 'intro' && 'Set Up Payments'}
            {step === 'stripe' && 'Stripe Setup'}
            {step === 'paypal' && 'PayPal Setup'}
            {step === 'complete' && 'Setup Complete'}
          </DialogTitle>
          <DialogDescription>
            {step === 'intro' && 'Choose how you want to receive payments from your sales'}
            {step === 'stripe' && 'Complete the Stripe onboarding process'}
            {step === 'paypal' && 'Enter your PayPal details'}
            {step === 'complete' && 'Your payment account is ready'}
          </DialogDescription>
        </DialogHeader>

        {checkingStatus ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {step === 'intro' && renderIntroStep()}
            {step === 'stripe' && renderStripeStep()}
            {step === 'paypal' && renderPayPalStep()}
            {step === 'complete' && renderCompleteStep()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
