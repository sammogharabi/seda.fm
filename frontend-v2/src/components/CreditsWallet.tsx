import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Coins, Crown, Info, Zap } from 'lucide-react';
import { formatCredits, CREDIT_ECONOMY } from '../utils/progression';
import { progressionService } from '../utils/progressionService';
import { toast } from 'sonner@2.0.3';

interface CreditsWalletProps {
  userId: string;
  creditsBalance: number;
  creditsEarned: number;
  seasonCredits: number;
  onCreditsUpdate?: (newBalance: number) => void;
  className?: string;
}

export function CreditsWallet({
  userId,
  creditsBalance,
  creditsEarned,
  seasonCredits,
  onCreditsUpdate,
  className = ''
}: CreditsWalletProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const canRedeemMonth = creditsBalance >= CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH;
  const monthsAvailable = Math.floor(creditsBalance / CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH);
  const creditsRemaining = creditsBalance % CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH;
  const seasonalCapReached = seasonCredits >= CREDIT_ECONOMY.SEASONAL_CREDIT_CAP;
  const remainingSeasonalCredits = Math.max(0, CREDIT_ECONOMY.SEASONAL_CREDIT_CAP - seasonCredits);

  const handleRedeemPremium = async (months: number = 1) => {
    const creditsNeeded = months * CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH;
    
    if (creditsBalance < creditsNeeded) {
      toast.error('Insufficient credits', {
        description: `You need ${creditsNeeded} credits but only have ${creditsBalance}`
      });
      return;
    }

    setIsRedeeming(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = progressionService.spendCredits(userId, creditsNeeded, 'premium_upgrade');
    
    if (success) {
      toast.success(`Premium ${months > 1 ? `${months} months` : 'month'} activated!`, {
        description: `${creditsNeeded} credits redeemed successfully`
      });
      
      // Update parent component
      onCreditsUpdate?.(creditsBalance - creditsNeeded);
    } else {
      toast.error('Redemption failed', {
        description: 'Please try again later'
      });
    }
    
    setIsRedeeming(false);
  };

  return (
    <Card className={`bg-gradient-to-br from-card to-accent/5 border-accent-coral/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="w-5 h-5 text-accent-coral" />
          Credits Wallet
          <Badge variant="outline" className="ml-auto text-xs">
            {formatCredits(creditsBalance)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-accent-coral">
              {creditsBalance}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-accent-mint">
              {creditsEarned}
            </div>
            <div className="text-xs text-muted-foreground">Total Earned</div>
          </div>
        </div>

        {/* Seasonal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Season Progress</span>
            <span className="font-medium">
              {seasonCredits}/{CREDIT_ECONOMY.SEASONAL_CREDIT_CAP}
            </span>
          </div>
          
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-coral to-accent-mint rounded-full"
              style={{ width: `${(seasonCredits / CREDIT_ECONOMY.SEASONAL_CREDIT_CAP) * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(seasonCredits / CREDIT_ECONOMY.SEASONAL_CREDIT_CAP) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          
          {seasonalCapReached ? (
            <p className="text-xs text-accent-yellow font-medium">
              🎉 Seasonal cap reached! Resets next season
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {remainingSeasonalCredits} credits remaining this season
            </p>
          )}
        </div>

        {/* Premium Redemption */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-accent-coral" />
            <span className="font-medium">Premium Upgrade</span>
            <Info className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• {CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH} credits = 1 month Premium</p>
            <p>• Credits only redeemable for Premium subscriptions</p>
            <p>• No cash value or other redemption options</p>
          </div>

          {canRedeemMonth ? (
            <div className="space-y-2">
              <Button
                onClick={() => handleRedeemPremium(1)}
                disabled={isRedeeming}
                className="w-full bg-accent-coral hover:bg-accent-coral/90 text-background font-medium"
              >
                {isRedeeming ? (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-spin" />
                    Redeeming...
                  </div>
                ) : (
                  `Redeem 1 Month Premium (${CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH} credits)`
                )}
              </Button>
              
              {monthsAvailable > 1 && (
                <Button
                  onClick={() => handleRedeemPremium(monthsAvailable)}
                  disabled={isRedeeming}
                  variant="outline"
                  className="w-full"
                >
                  Redeem {monthsAvailable} Months ({monthsAvailable * CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH} credits)
                </Button>
              )}
              
              {creditsRemaining > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {creditsRemaining} credits remaining after redemption
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Need {CREDIT_ECONOMY.CREDITS_PER_PREMIUM_MONTH - creditsBalance} more credits for Premium
              </p>
              <Button variant="outline" disabled className="w-full">
                Not enough credits
              </Button>
            </div>
          )}
        </div>

        {/* Earning Tips */}
        <div className="bg-accent-mint/10 rounded-lg p-3 text-xs space-y-1">
          <p className="font-medium text-accent-mint">💡 Earn more credits by:</p>
          <ul className="text-muted-foreground space-y-0.5 ml-2">
            <li>• DJing in public sessions</li>
            <li>• Supporting artists with tips & purchases</li>
            <li>• Reaching higher levels</li>
            <li>• Engaging with the community</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}