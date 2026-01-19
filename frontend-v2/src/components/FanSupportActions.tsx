import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Heart, ShoppingBag, Ticket, DollarSign, Music, Gift } from 'lucide-react';
import { progressionService } from '../utils/progressionService';
import { XP_REWARDS } from '../utils/progression';
import { toast } from 'sonner';

interface FanSupportActionsProps {
  userId: string;
  artistName?: string;
  onXPUpdate?: () => void;
  className?: string;
}

export function FanSupportActions({
  userId,
  artistName = 'Underground Beats',
  onXPUpdate,
  className = ''
}: FanSupportActionsProps) {
  const [tipAmount, setTipAmount] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSupportAction = async (
    action: 'tip' | 'track' | 'merch' | 'ticket',
    value?: number
  ) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      progressionService.simulateFanSupport(userId, action, value);
      onXPUpdate?.();
      
      // Show success feedback
      const actionMessages = {
        tip: `Tipped $${value} to ${artistName}`,
        track: `Purchased track from ${artistName}`,
        merch: `Bought merchandise from ${artistName}`,
        ticket: `Purchased event ticket for ${artistName}`
      };
      
      toast.success('Support sent!', {
        description: actionMessages[action],
        duration: 3000
      });
      
    } catch (error) {
      toast.error('Support failed', {
        description: 'Please try again later'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const supportActions = [
    {
      id: 'tip',
      title: 'Tip Artist',
      description: `Send a tip to support ${artistName}`,
      icon: DollarSign,
      color: 'accent-coral',
      xpReward: `+${XP_REWARDS.FAN_TIP_PER_DOLLAR} XP per $1`,
      customAmount: true
    },
    {
      id: 'track',
      title: 'Buy Track',
      description: 'Purchase a track to add to your collection',
      icon: Music,
      color: 'accent-blue',
      xpReward: `+${XP_REWARDS.FAN_TRACK_PURCHASE} XP`,
      customAmount: false
    },
    {
      id: 'merch',
      title: 'Buy Merch',
      description: 'Get exclusive artist merchandise',
      icon: ShoppingBag,
      color: 'accent-mint',
      xpReward: `+${XP_REWARDS.FAN_MERCH_PURCHASE} XP`,
      customAmount: false
    },
    {
      id: 'ticket',
      title: 'Buy Ticket',
      description: 'Get tickets for upcoming events',
      icon: Ticket,
      color: 'accent-yellow',
      xpReward: `+${XP_REWARDS.FAN_TICKET_PURCHASE} XP`,
      customAmount: false
    }
  ];

  return (
    <Card className={`bg-gradient-to-br from-card to-accent/5 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent-coral" />
          Support {artistName}
          <Badge variant="outline" className="ml-auto text-xs">
            Earn Fan XP
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tip Section with Custom Amount */}
        <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-accent-coral" />
            <h4 className="font-medium">Send Tip</h4>
            <Badge variant="outline" className="text-xs text-accent-coral border-accent-coral">
              +{XP_REWARDS.FAN_TIP_PER_DOLLAR} XP per $1
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="tip-amount" className="text-xs text-muted-foreground">
                Amount ($)
              </Label>
              <Input
                id="tip-amount"
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                min="1"
                max="100"
                className="mt-1"
                placeholder="5"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleSupportAction('tip', parseFloat(tipAmount) || 5)}
                disabled={isProcessing || !tipAmount || parseFloat(tipAmount) <= 0}
                className="bg-accent-coral hover:bg-accent-coral/90 text-background"
              >
                {isProcessing ? 'Sending...' : 'Send Tip'}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Estimated XP: +{Math.floor((parseFloat(tipAmount) || 5) * XP_REWARDS.FAN_TIP_PER_DOLLAR)}
          </p>
        </div>

        {/* Other Support Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {supportActions.slice(1).map((action) => {
            const IconComponent = action.icon;
            
            return (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleSupportAction(action.id as any)}
                  disabled={isProcessing}
                  variant="outline"
                  className={`w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-${action.color}/10 hover:border-${action.color}/30 transition-all`}
                >
                  <IconComponent className={`w-6 h-6 text-${action.color}`} />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs text-${action.color} border-${action.color}/30`}
                    >
                      {action.xpReward}
                    </Badge>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Support Info */}
        <div className="bg-accent-mint/10 border border-accent-mint/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Gift className="w-4 h-4 text-accent-mint mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-accent-mint mb-1">
                Supporting artists earns you Fan XP!
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Your support helps artists create more music</li>
                <li>• Fan XP contributes to your overall level progression</li>
                <li>• Level up to earn credits redeemable for Premium</li>
                <li>• Artists may give bonus XP for top supporters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Support Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleSupportAction('tip', 1)}
            disabled={isProcessing}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Quick $1 Tip
          </Button>
          <Button
            onClick={() => handleSupportAction('tip', 10)}
            disabled={isProcessing}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Quick $10 Tip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}