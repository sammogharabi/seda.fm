import React, { useState, useCallback, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DollarSign,
  Download,
  Shield,
  CreditCard,
  Heart,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { marketplaceApi } from '../lib/api/marketplace';

let stripePromise: Promise<Stripe | null> | null = null;
let paypalClientId: string | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    try {
      const config = await marketplaceApi.getStripeConfig();
      if (config.publishableKey) {
        stripePromise = loadStripe(config.publishableKey);
      }
    } catch (error) {
      console.error('Failed to load Stripe config:', error);
      return null;
    }
  }
  return stripePromise;
};

const getPayPalClientId = async () => {
  if (!paypalClientId) {
    try {
      const config = await marketplaceApi.getPayPalConfig();
      if (config.isConfigured) {
        paypalClientId = config.clientId;
      }
    } catch (error) {
      console.error('Failed to load PayPal config:', error);
      return null;
    }
  }
  return paypalClientId;
};

interface TrackPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: any;
  artist: any;
  onPurchaseComplete: (purchaseData: any) => void;
  currentUser: any;
}

export function TrackPurchaseModal({ 
  isOpen, 
  onClose, 
  track, 
  artist, 
  onPurchaseComplete, 
  currentUser 
}: TrackPurchaseModalProps) {
  const [step, setStep] = useState(1);
  const [purchaseData, setPurchaseData] = useState({
    selectedFormat: track?.formats?.[0] || 'mp3-320',
    paymentMethod: 'card',
    customPrice: track?.pricingType === 'pwyw' ? (track?.suggestedPrice || '') : '',
    email: currentUser?.email || '',
    giftMode: false,
    giftRecipient: '',
    giftMessage: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalClientIdLoaded, setPaypalClientIdLoaded] = useState<string | null>(null);

  // Load PayPal client ID on mount
  useEffect(() => {
    getPayPalClientId().then((clientId) => {
      if (clientId) {
        setPaypalClientIdLoaded(clientId);
        setPaypalReady(true);
      }
    });
  }, []);

  const formatLabels: Record<string, string> = {
    'mp3-320': 'MP3 320kbps',
    'mp3-256': 'MP3 256kbps',
    'flac': 'FLAC (Lossless)',
    'wav': 'WAV (Uncompressed)'
  };

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'paypal', label: 'PayPal', icon: Wallet },
  ];

  const getFinalPrice = useCallback(() => {
    if (track?.pricingType === 'pwyw') {
      const customAmount = parseFloat(purchaseData.customPrice) || 0;
      const minimumPrice = parseFloat(track?.minimumPrice) || 0;
      return Math.max(customAmount, minimumPrice);
    }
    return parseFloat(track?.fixedPrice) || 0;
  }, [track, purchaseData.customPrice]);

  // Platform takes 10%, processing fees vary by payment method
  const PLATFORM_FEE_PERCENT = 0.10;
  const STRIPE_FEE_PERCENT = 0.029;
  const STRIPE_FEE_FIXED = 0.30;
  const PAYPAL_FEE_PERCENT = 0.0349;
  const PAYPAL_FEE_FIXED = 0.49;

  const getProcessingFee = useCallback(() => {
    const price = getFinalPrice();
    if (purchaseData.paymentMethod === 'paypal') {
      return price * PAYPAL_FEE_PERCENT + PAYPAL_FEE_FIXED;
    }
    return price * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
  }, [getFinalPrice, purchaseData.paymentMethod]);

  const getPlatformFee = useCallback(() => {
    return getFinalPrice() * PLATFORM_FEE_PERCENT;
  }, [getFinalPrice]);

  const getArtistNet = useCallback(() => {
    const price = getFinalPrice();
    const platformFee = price * PLATFORM_FEE_PERCENT;
    const processingFee = getProcessingFee();
    return price - platformFee - processingFee;
  }, [getFinalPrice, getProcessingFee]);

  // Handle Stripe payment
  const handleStripePurchase = useCallback(async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error('Payment system unavailable. Please try again later.');
      }

      const totalAmount = getFinalPrice() + getProcessingFee();
      const currentUrl = window.location.href;
      const baseUrl = window.location.origin;

      const session = await marketplaceApi.createCheckoutSession({
        productId: track.id,
        amount: totalAmount,
        successUrl: `${baseUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}&track_id=${track.id}`,
        cancelUrl: currentUrl,
      });

      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Stripe payment failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);

      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    }
  }, [track, getFinalPrice, getProcessingFee]);

  // Handle PayPal order creation
  const handlePayPalCreateOrder = useCallback(async () => {
    const totalAmount = getFinalPrice() + getProcessingFee();
    const currentUrl = window.location.href;
    const baseUrl = window.location.origin;

    try {
      const order = await marketplaceApi.createPayPalOrder({
        productId: track.id,
        amount: totalAmount,
        returnUrl: `${baseUrl}/purchase/success?paypal=true&track_id=${track.id}`,
        cancelUrl: currentUrl,
      });
      return order.orderId;
    } catch (error) {
      console.error('PayPal order creation failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Failed to create PayPal order.');
      throw error;
    }
  }, [track, getFinalPrice, getProcessingFee]);

  // Handle PayPal order approval
  const handlePayPalApprove = useCallback(async (data: { orderID: string }) => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const result = await marketplaceApi.capturePayPalOrder(data.orderID);

      if (result.success) {
        const purchaseResult = {
          id: result.orderId,
          trackId: track.id,
          trackTitle: track.title,
          artistName: artist.displayName || artist.username,
          format: purchaseData.selectedFormat,
          price: getFinalPrice(),
          processingFee: getProcessingFee(),
          paymentMethod: 'paypal',
          purchaseDate: new Date().toISOString(),
          downloadCount: 0,
          maxDownloads: 5,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        onPurchaseComplete(purchaseResult);
        setStep(3);
        setIsProcessing(false);

        toast.success('Purchase successful!', {
          description: 'Your download is ready'
        });
      } else {
        throw new Error('Payment capture failed');
      }
    } catch (error) {
      console.error('PayPal capture failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);

      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    }
  }, [track, artist, purchaseData, getFinalPrice, getProcessingFee, onPurchaseComplete]);

  // Handle payment based on selected method
  const handlePurchase = useCallback(async () => {
    if (purchaseData.paymentMethod === 'paypal') {
      // PayPal is handled by PayPal buttons
      return;
    }
    // Default to Stripe
    await handleStripePurchase();
  }, [purchaseData.paymentMethod, handleStripePurchase]);

  // Handle successful payment return (when user comes back from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const trackId = urlParams.get('track_id');

    if (sessionId && trackId && trackId === track?.id) {
      // Payment was successful, show success state
      setStep(3);

      const purchaseResult = {
        id: sessionId,
        trackId: track.id,
        trackTitle: track.title,
        artistName: artist.displayName || artist.username,
        format: purchaseData.selectedFormat,
        price: getFinalPrice(),
        processingFee: getProcessingFee(),
        paymentMethod: 'stripe',
        purchaseDate: new Date().toISOString(),
        downloadCount: 0,
        maxDownloads: 5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      onPurchaseComplete(purchaseResult);

      toast.success('Purchase successful!', {
        description: 'Your download is ready'
      });

      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [track, artist, purchaseData, getFinalPrice, getProcessingFee, onPurchaseComplete]);

  const renderPricingSection = () => {
    if (track?.pricingType === 'pwyw') {
      const minimumPrice = parseFloat(track?.minimumPrice) || 0;
      const suggestedPrice = parseFloat(track?.suggestedPrice) || 0;
      
      return (
        <div className="space-y-4">
          <div>
            <Label>Choose Your Price</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                min={minimumPrice}
                value={purchaseData.customPrice}
                onChange={(e) => setPurchaseData(prev => ({ ...prev, customPrice: e.target.value }))}
                placeholder={suggestedPrice ? suggestedPrice.toString() : "Enter amount"}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              {minimumPrice > 0 && <span>Minimum: ${minimumPrice.toFixed(2)}</span>}
              {suggestedPrice > 0 && <span>Suggested: ${suggestedPrice.toFixed(2)}</span>}
            </div>
          </div>

          <div className="flex gap-2">
            {[1, 3, 5, 10].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setPurchaseData(prev => ({ ...prev, customPrice: amount.toString() }))}
                className="flex-1"
              >
                ${amount}
              </Button>
            ))}
          </div>

          <div className="p-3 bg-muted/50 border border-foreground/10 rounded-lg">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-accent-coral mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Support the Artist</p>
                <p className="text-muted-foreground">
                  90% goes to {artist.displayName || artist.username} (minus payment processing)
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Track Price</span>
            <span className="text-xl font-semibold">${track?.fixedPrice}</span>
          </div>
        </div>
      );
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Track Info */}
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted/50 rounded-lg flex-shrink-0">
                <div 
                  className="w-full h-full bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${track?.artwork})` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{track?.title}</h3>
                <p className="text-sm text-muted-foreground">by {artist?.displayName || artist?.username}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{track?.duration}</span>
                  </div>
                  {track?.genre && (
                    <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <Label>Download Format</Label>
              <Select
                value={purchaseData.selectedFormat}
                onValueChange={(value) => setPurchaseData(prev => ({ ...prev, selectedFormat: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {track?.formats?.map((format) => (
                    <SelectItem key={format} value={format}>
                      {formatLabels[format] || format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing */}
            {renderPricingSection()}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPurchaseData(prev => ({ ...prev, paymentMethod: method.id }))}
                      className={`p-3 border rounded-lg flex items-center gap-3 text-left transition-colors ${
                        purchaseData.paymentMethod === method.id
                          ? 'border-accent-coral bg-accent-coral/5'
                          : 'border-foreground/10 hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="space-y-3 p-4 bg-muted/30 border border-foreground/10 rounded-lg">
              <h4 className="font-medium">Purchase Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${getFinalPrice().toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-foreground/10 pt-2 mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Platform fee (10%)</span>
                  <span>-${getPlatformFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing fee ({purchaseData.paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'})</span>
                  <span>-${getProcessingFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-foreground pt-1">
                  <span>Artist receives</span>
                  <span className="text-accent-mint">${getArtistNet().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-500">Payment Error</p>
                    <p className="text-red-400">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Buttons (shown when PayPal is selected) */}
            {purchaseData.paymentMethod === 'paypal' && paypalReady && paypalClientIdLoaded && (
              <div className="pt-2">
                <PayPalScriptProvider options={{ clientId: paypalClientIdLoaded, currency: 'USD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                    createOrder={handlePayPalCreateOrder}
                    onApprove={handlePayPalApprove}
                    onError={(err) => {
                      console.error('PayPal error:', err);
                      setPaymentError('PayPal payment failed. Please try again.');
                    }}
                    onCancel={() => {
                      toast.info('Payment cancelled');
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-3 bg-muted/50 border border-foreground/10 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-accent-blue mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">
                    Secure Payment via {purchaseData.paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}
                  </p>
                  <p className="text-muted-foreground">
                    {purchaseData.paymentMethod === 'paypal'
                      ? 'Your payment is processed securely by PayPal.'
                      : 'Your payment is processed securely by Stripe. We never store your card details.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mx-auto"
            >
              <div className="w-16 h-16 bg-accent-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent-mint" />
              </div>
            </motion.div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Purchase Complete!</h3>
              <p className="text-muted-foreground">
                Your download is ready. Check your library or email for the download link.
              </p>
            </div>

            <div className="p-4 bg-muted/30 border border-foreground/10 rounded-lg text-left">
              <h4 className="font-medium mb-3">Download Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>{formatLabels[purchaseData.selectedFormat]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads remaining:</span>
                  <span>5 of 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Link expires:</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-accent-mint hover:bg-accent-mint/90">
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </Button>
              
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                View in Library
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              A receipt has been sent to your email address
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isProcessing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md border border-foreground/10" aria-describedby="processing-description">
          <DialogHeader className="sr-only">
            <DialogTitle>Processing Payment</DialogTitle>
            <DialogDescription id="processing-description">
              Your payment is being processed securely
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <motion.div
              className="w-16 h-16 bg-accent-coral/20 rounded-full flex items-center justify-center mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CreditCard className="w-8 h-8 text-accent-coral" />
            </motion.div>
            <div>
              <h3 className="text-lg font-medium">Processing Payment</h3>
              <p className="text-sm text-muted-foreground">
                Securely processing your purchase...
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Please don't close this window
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-foreground/10" aria-describedby="track-purchase-description">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Purchase Track' : 
             step === 2 ? 'Payment Details' : 
             'Download Ready'}
          </DialogTitle>
          <DialogDescription id="track-purchase-description">
            {step === 1 ? 'Choose your format and price' :
             step === 2 ? 'Complete your purchase' :
             'Your track is ready for download'}
          </DialogDescription>
        </DialogHeader>

        {step < 3 && (
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {[1, 2].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    stepNum === step
                      ? 'bg-accent-coral text-background'
                      : stepNum < step
                      ? 'bg-accent-mint text-background'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
          </div>
        )}

        {renderStepContent()}

        {step < 3 && (
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            
            <div className="flex-1" />

            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={
                  (track?.pricingType === 'pwyw' && !purchaseData.customPrice) ||
                  (track?.pricingType === 'pwyw' && getFinalPrice() < (parseFloat(track?.minimumPrice) || 0))
                }
              >
                Continue
              </Button>
            ) : purchaseData.paymentMethod !== 'paypal' ? (
              <Button
                onClick={handlePurchase}
                className="bg-accent-coral hover:bg-accent-coral/90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${getFinalPrice().toFixed(2)}
              </Button>
            ) : null}

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}