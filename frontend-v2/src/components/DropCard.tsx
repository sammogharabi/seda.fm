import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Clock,
  Zap,
  Calendar,
  Users,
  Lock,
  Eye,
  ShoppingBag,
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  Play,
  Pause,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Drop, DropStatus, DropGatingType } from '../lib/api/drops';

interface DropCardProps {
  drop: Drop;
  isOwner?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function DropCard({
  drop,
  isOwner = false,
  onView,
  onEdit,
  onPublish,
  onCancel,
  onDelete,
}: DropCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate countdown
  useEffect(() => {
    if (!drop.showCountdown || !drop.startsAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(drop.startsAt!);
      const end = drop.endsAt ? new Date(drop.endsAt) : null;

      // If drop hasn't started yet
      if (start > now) {
        const diff = start.getTime() - now.getTime();
        setTimeLeft(formatTimeDiff(diff, 'Starts'));
        return;
      }

      // If drop is live and has end time
      if (end && end > now) {
        const diff = end.getTime() - now.getTime();
        setTimeLeft(formatTimeDiff(diff, 'Ends'));
        return;
      }

      // Drop has ended or no timing
      setTimeLeft('');
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [drop.startsAt, drop.endsAt, drop.showCountdown]);

  const formatTimeDiff = (ms: number, prefix: string): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${prefix} in ${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${prefix} in ${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${prefix} in ${minutes}m ${seconds % 60}s`;
    }
    return `${prefix} in ${seconds}s`;
  };

  const getStatusBadge = () => {
    switch (drop.status) {
      case 'LIVE':
        return (
          <Badge className="bg-accent-mint text-background gap-1">
            <Zap size={12} />
            Live
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge className="bg-accent-blue text-background gap-1">
            <Calendar size={12} />
            Scheduled
          </Badge>
        );
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ENDED':
        return <Badge variant="outline">Ended</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getGatingBadge = () => {
    if (drop.gatingType === 'PUBLIC') return null;

    if (drop.gatingType === 'SCENE_REQUIRED') {
      return (
        <Badge variant="outline" className="gap-1">
          <Lock size={12} />
          Scene Only
        </Badge>
      );
    }

    if (drop.gatingType === 'SCENE_EARLY_ACCESS') {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock size={12} />
          Early Access
        </Badge>
      );
    }

    return null;
  };

  return (
    <div
      className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 transition-colors cursor-pointer"
      onClick={() => {
        console.log('[DropCard] Click! onView:', onView);
        onView?.();
      }}
    >
      {/* Hero Image - use hero image, fallback to first product image, then placeholder */}
      <div className="aspect-[16/9] bg-muted relative">
        {(() => {
          const heroImg = drop.heroImage && !drop.heroImage.startsWith('blob:') ? drop.heroImage : null;
          const productImg = drop.items?.[0]?.product?.coverImage || drop.items?.[0]?.product?.images?.[0];
          const displayImg = heroImg || productImg;

          return displayImg ? (
            <img
              src={displayImg}
              alt={drop.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-coral/20 to-accent-mint/20">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
          );
        })()}

        {/* Status badges overlay */}
        <div className="absolute top-2 left-2 flex gap-2">
          {getStatusBadge()}
          {getGatingBadge()}
        </div>

        {/* Countdown overlay */}
        {timeLeft && drop.status === 'LIVE' && (
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-sm font-mono">
            {timeLeft}
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {drop.status === 'DRAFT' && (
                  <>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit3 size={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onPublish}>
                      <Play size={14} className="mr-2" />
                      Publish
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {(drop.status === 'LIVE' || drop.status === 'SCHEDULED') && (
                  <>
                    <DropdownMenuItem onClick={onView}>
                      <ExternalLink size={14} className="mr-2" />
                      View Live
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onCancel} className="text-destructive">
                      <X size={14} className="mr-2" />
                      Cancel Drop
                    </DropdownMenuItem>
                  </>
                )}
                {drop.status === 'ENDED' && (
                  <DropdownMenuItem onClick={onView}>
                    <Eye size={14} className="mr-2" />
                    View Results
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{drop.title}</h3>
        {drop.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {drop.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShoppingBag size={14} />
            {drop.itemCount} {drop.itemCount === 1 ? 'item' : 'items'}
          </span>
          {drop.status !== 'DRAFT' && (
            <>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {drop.viewCount}
              </span>
              <span className="flex items-center gap-1">
                ${drop.totalRevenue.toFixed(0)}
              </span>
            </>
          )}
        </div>

        {/* Scheduled time for future drops */}
        {drop.status === 'SCHEDULED' && drop.startsAt && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <Calendar size={14} className="inline mr-1" />
              {new Date(drop.startsAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
