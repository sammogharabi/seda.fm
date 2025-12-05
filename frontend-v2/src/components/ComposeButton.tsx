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
        className="fixed bottom-36 right-4 z-30 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-accent-coral text-background hover:bg-accent-coral/90"
        size="icon"
      >
        <Plus className="w-6 h-6" />
        <span className="sr-only">Create content</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      className="w-full justify-start gap-3 h-12 bg-accent-coral text-background hover:bg-accent-coral/90 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Plus className="w-5 h-5" />
      Create
    </Button>
  );
}