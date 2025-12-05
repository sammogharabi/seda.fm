import React from 'react';
import { Card, CardContent } from './ui/card';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ResponsiveCard({ children, className = '', contentClassName = '' }: ResponsiveCardProps) {
  return (
    <Card className={`hover:border-foreground/20 transition-colors ${className}`}>
      <CardContent className={`p-4 md:p-6 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export function ResponsiveFlex({ 
  children, 
  className = '', 
  spacing = 'md',
  wrap = true 
}: ResponsiveFlexProps) {
  const spacingMap = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4', 
    lg: 'gap-4 md:gap-6'
  };

  return (
    <div className={`flex items-center ${spacingMap[spacing]} ${wrap ? 'flex-wrap' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  className?: string;
  truncate?: boolean;
}

export function ResponsiveText({ 
  children, 
  variant = 'body', 
  className = '', 
  truncate = false 
}: ResponsiveTextProps) {
  const variantMap = {
    title: 'font-semibold text-base md:text-lg',
    subtitle: 'text-sm md:text-base text-muted-foreground',
    body: 'text-sm',
    caption: 'text-xs md:text-sm text-muted-foreground'
  };

  return (
    <div className={`${variantMap[variant]} ${truncate ? 'truncate min-w-0' : ''} ${className}`}>
      {children}
    </div>
  );
}