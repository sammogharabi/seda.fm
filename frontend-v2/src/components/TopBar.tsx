import React from 'react';
import { Button } from './ui/button';
import { MessageCircle, Bell } from 'lucide-react';
import { Badge } from './ui/badge';

interface TopBarProps {
  onMessagesClick: () => void;
  unreadMessages?: number;
  className?: string;
}

export function TopBar({ onMessagesClick, unreadMessages = 0, className = '' }: TopBarProps) {
  return (
    <div className={`flex items-center justify-end gap-2 px-6 py-4 border-b border-foreground/10 bg-card ${className}`}>
      {/* Messages Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 px-3 rounded-lg border border-transparent hover:border-foreground/10"
        onClick={onMessagesClick}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Messages</span>
        {unreadMessages > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
          >
            {unreadMessages > 99 ? '99+' : unreadMessages}
          </Badge>
        )}
      </Button>

      {/* Notifications Button - Placeholder for future */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 px-3 rounded-lg border border-transparent hover:border-foreground/10"
      >
        <Bell className="w-4 h-4" />
      </Button>
    </div>
  );
}
