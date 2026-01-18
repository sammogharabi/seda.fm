import React from 'react';
import { Card, CardContent } from './ui/card';
import { Users } from 'lucide-react';

interface FollowSuggestionsProps {
  onFollowUser?: (user: any) => void;
  followingList?: any[];
  maxSuggestions?: number;
  showHeader?: boolean;
  compact?: boolean;
  onViewFanProfile?: (user: any) => void;
}

export function FollowSuggestions({
  showHeader = true,
  compact = false,
}: FollowSuggestionsProps) {
  if (compact) {
    return (
      <div className="p-6 text-center">
        <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          People suggestions coming soon
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">Who to follow</h3>
          <p className="text-sm text-muted-foreground">Discover new artists and fans</p>
        </div>
      )}

      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">People Suggestions Coming Soon</h3>
          <p className="text-muted-foreground">
            We'll recommend artists and fans based on your music taste.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}