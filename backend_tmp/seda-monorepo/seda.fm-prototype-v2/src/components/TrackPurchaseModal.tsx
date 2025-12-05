import React, { useState, useCallback } from 'react';
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
  Smartphone,
  Heart,
  Info,
  CheckCircle,
  Music,
  Clock,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

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

  const formatLabels = {
    'mp3-320': 'MP3 320kbps',
    'mp3-256': 'MP3 256kbps',
    'flac': 'FLAC (Lossless)',
    'wav': 'WAV (Uncompressed)'
  };

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'paypal', label: 'PayPal', icon: Smartphone },
    { id: 'crypto', label: 'Cryptocurrency', icon: DollarSign }
  ];

  const getFinalPrice = useCallback(() => {
    if (track?.pricingType === 'pwyw') {
      const customAmount = parseFloat(purchaseData.customPrice) || 0;
      const minimumPrice = parseFloat(track?.minimumPrice) || 0;
      return Math.max(customAmount, minimumPrice);
    }
    return parseFloat(track?.fixedPrice) || 0;
  }, [track, purchaseData.customPrice]);

  const getProcessingFee = useCallback(() => {
    const price = getFinalPrice();
    return Math.max(0.30, price * 0.029); // Stripe-like fees
  }, [getFinalPrice]);

  const handlePurchase = useCallback(async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const purchaseResult = {
      id: Date.now(),
      trackId: track.id,
      trackTitle: track.title,
      artistName: artist.displayName || artist.username,
      format: purchaseData.selectedFormat,
      price: getFinalPrice(),
      processingFee: getProcessingFee(),
      paymentMethod: purchaseData.paymentMethod,
      purchaseDate: new Date().toISOString(),
      downloadUrl: `https://downloads.seda.fm/tracks/${track.id}/${Date.now()}`,
      downloadCount: 0,
      maxDownloads: 5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    onPurchaseComplete(purchaseResult);
    setIsProcessing(false);
    setStep(3);

    toast.success('Purchase successful!', {
      description: 'Your download is ready'
    });
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
                <div className="flex justify-between">
                  <span>Track Price</span>
                  <span>${getFinalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee</span>
                  <span>${getProcessingFee().toFixed(2)}</span>
                </div>
                <div className="border-t border-foreground/10 pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(getFinalPrice() + getProcessingFee()).toFixed(2)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Artist receives: ${(getFinalPrice() * 0.9 - getProcessingFee()).toFixed(2)}
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-muted/50 border border-foreground/10 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-accent-blue mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Secure Purchase</p>
                  <p className="text-muted-foreground">
                    Your payment is protected by industry-standard encryption
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
            ) : (
              <Button
                onClick={handlePurchase}
                className="bg-accent-coral hover:bg-accent-coral/90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${(getFinalPrice() + getProcessingFee()).toFixed(2)}
              </Button>
            )}

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