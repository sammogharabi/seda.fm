import React from 'react';
import { Button } from './ui/button';
import { Plus, Edit3 } from 'lucide-react';

interface ComposeButtonProps {
  onClick: () => void;
  isMobile: boolean;
}

export function ComposeButton({ onClick, isMobile }: ComposeButtonProps) {
  if (isMobile) {
    return (
      <Button
        onClick={onClick}
        className="fixed bottom-36 right-4 z-30 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
        size="icon"
      >
        <Plus className="w-6 h-6" />
        <span className="sr-only">Create post</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      className="w-full justify-start gap-3 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Edit3 className="w-5 h-5" />
      Create Post
    </Button>
  );
}