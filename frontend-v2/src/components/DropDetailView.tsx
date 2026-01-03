import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Clock,
  Zap,
  Lock,
  Users,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Share2,
  Heart,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { dropsApi, Drop, DropGatingType } from '../lib/api/drops';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface DropDetailViewProps {
  dropId: string;
  user?: any;
  onBack: () => void;
  onPurchase?: (productId: string) => void;
  onJoinScene?: (sceneId: string) => void;
}

export function DropDetailView({
  dropId,
  user,
  onBack,
  onPurchase,
  onJoinScene,
}: DropDetailViewProps) {
  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState('');

  // Load drop data
  useEffect(() => {
    loadDrop();
  }, [dropId]);

  const loadDrop = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dropsApi.getDrop(dropId);
      setDrop(data);
    } catch (err: any) {
      console.error('Failed to load drop:', err);
      setError(err.message || 'Failed to load drop');
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!drop?.showCountdown || !drop.startsAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(drop.startsAt!);
      const end = drop.endsAt ? new Date(drop.endsAt) : null;

      if (start > now) {
        const diff = start.getTime() - now.getTime();
        setCountdownText(formatCountdown(diff, 'Drops'));
      } else if (end && end > now) {
        const diff = end.getTime() - now.getTime();
        setCountdownText(formatCountdown(diff, 'Ends'));
      } else {
        setCountdownText('');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [drop]);

  const formatCountdown = (ms: number, prefix: string): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${prefix} in ${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${prefix} in ${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${prefix} in ${minutes}m ${seconds}s`;
    }
    return `${prefix} in ${seconds}s`;
  };

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: drop?.title,
        text: drop?.description || `Check out this drop!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  }, [drop]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
      </div>
    );
  }

  if (error || !drop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Drop Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error || "This drop doesn't exist or has ended."}
        </p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  // Check if access is denied (gated drop)
  const accessDenied = (drop as any).accessDenied;
  const accessMessage = (drop as any).accessMessage;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Status Badges & Countdown */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {drop.status === 'LIVE' && (
              <Badge className="bg-accent-mint text-background gap-1">
                <Zap size={12} />
                Live Now
              </Badge>
            )}
            {drop.gatingType !== 'PUBLIC' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1">
                      <Lock size={12} />
                      {drop.gatingType === 'ROOM_ONLY' ? 'Room Only' :
                       drop.gatingType === 'FOLLOWERS_ONLY' ? 'Followers Only' : 'Early Access'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {drop.gatingType === 'ROOM_ONLY'
                      ? "This drop is exclusive to room members."
                      : drop.gatingType === 'FOLLOWERS_ONLY'
                      ? "This drop is exclusive to followers."
                      : `Followers get early access before this drop goes public.`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {countdownText && drop.status === 'LIVE' && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-muted-foreground" />
              <span className="font-mono font-medium">{countdownText}</span>
            </div>
          )}
        </div>

        {/* Artist Info */}
        <div className="flex items-center gap-3 mb-4">
          {drop.artist?.avatarUrl ? (
            <img
              src={drop.artist.avatarUrl}
              alt={drop.artist.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Users size={16} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium">{drop.artist?.name}</p>
            <p className="text-sm text-muted-foreground">Artist</p>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{drop.title}</h1>
        {drop.description && (
          <p className="text-lg text-muted-foreground mb-6">{drop.description}</p>
        )}

        {/* Access Denied State */}
        {accessDenied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 border border-border rounded-lg p-6 mb-6 text-center"
          >
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Exclusive Drop</h3>
            <p className="text-muted-foreground mb-4">{accessMessage}</p>
            {drop.sceneId && onJoinScene && (
              <Button onClick={() => onJoinScene(drop.sceneId!)} className="gap-2">
                <Users size={16} />
                Join Scene to Unlock
              </Button>
            )}
          </motion.div>
        )}

        {/* Products Grid */}
        {!accessDenied && drop.items && drop.items.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              {drop.itemCount} {drop.itemCount === 1 ? 'Item' : 'Items'} in this drop
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drop.items.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-lg overflow-hidden group hover:border-foreground/20 transition-colors"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-muted relative">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Limited quantity badge */}
                    {item.maxQuantityPerUser && (
                      <Badge className="absolute top-2 left-2 bg-accent-coral text-background">
                        Limit {item.maxQuantityPerUser} per person
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">
                      {item.product?.title || 'Product'}
                    </h3>
                    {item.product?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          ${(item.customPrice ?? item.product?.price)?.toFixed(2) || '0.00'}
                        </span>
                        {item.customPrice && item.product?.price && item.customPrice < item.product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${item.product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPurchase?.(item.product?.id);
                        }}
                        className="gap-2"
                      >
                        <ShoppingBag size={14} />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section - for non-gated drops */}
        {!accessDenied && drop.status !== 'DRAFT' && (
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>{drop.viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <span>{drop.purchaseCount} purchases</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
