import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Play,
  Pause,
  ExternalLink,
  Clock,
  DollarSign,
  Volume2,
  Download,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { LinkMetadata, getPlatformColor, getPlatformIcon } from '../utils/linkParser';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { unfurlApi } from '../lib/api/unfurl';

interface LinkPreviewProps {
  link: LinkMetadata;
  onPlay?: (link: LinkMetadata) => void;
  isPlaying?: boolean;
  className?: string;
}

export function LinkPreview({ link: initialLink, onPlay, isPlaying = false, className = '' }: LinkPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [link, setLink] = useState<LinkMetadata>(initialLink);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real metadata for links that need it
  useEffect(() => {
    const shouldFetchMetadata =
      !initialLink.title ||
      initialLink.title === 'YouTube Video' ||
      initialLink.title === 'Spotify track' ||
      initialLink.title === 'SoundCloud Track' ||
      initialLink.title === 'Bandcamp Track';

    if (shouldFetchMetadata && initialLink.url) {
      setIsLoading(true);
      unfurlApi.unfurl(initialLink.url)
        .then((metadata) => {
          if (metadata) {
            setLink({ ...initialLink, ...metadata });
          }
        })
        .catch((error) => {
          console.error('Failed to fetch link metadata:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialLink.url]);
  
  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(link);
    }
  };
  
  const handleExternalClick = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };
  
  // Different layouts based on platform
  const renderYouTubePreview = () => (
    <Card className={`overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-all ${className}`}>
      <CardContent className="p-0">
        <div className="aspect-video relative bg-muted">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : link.thumbnail ? (
            <ImageWithFallback
              src={link.thumbnail}
              alt={link.title || 'Video thumbnail'}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          ) : null}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Button
              onClick={handlePlayClick}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full w-16 h-16"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
          </div>
          
          {/* Platform badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-600 text-white border-0">
              {getPlatformIcon(link.platform)} {link.platform}
            </Badge>
          </div>
          
          {/* Duration badge */}
          {link.duration && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/70 text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                {link.duration}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h4 className="font-semibold text-sm mb-1 line-clamp-2">
            {link.title || 'YouTube Video'}
          </h4>
          {link.artist && (
            <p className="text-sm text-muted-foreground mb-2">{link.artist}</p>
          )}
          {link.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {link.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExternalClick}
              className="flex-1"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Watch on YouTube
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderBandcampPreview = () => (
    <Card className={`overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-all ${className}`}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Album artwork */}
          <div className="w-24 h-24 bg-muted flex-shrink-0">
            {link.thumbnail && (
              <ImageWithFallback
                src={link.thumbnail}
                alt={link.title || 'Album artwork'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <div className="flex-1 p-2 md:p-3 lg:p-4">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs md:text-sm mb-1 truncate">
                  {link.title || 'Bandcamp Track'}
                </h4>
                {link.artist && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{link.artist}</p>
                )}
              </div>
              
              <Badge className="bg-blue-600 text-white border-0 flex-shrink-0 text-xs px-2 py-1">
                <span className="hidden sm:inline">{getPlatformIcon(link.platform)} Bandcamp</span>
                <span className="sm:hidden">BC</span>
              </Badge>
            </div>
            
            {link.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 md:mb-3">
                {link.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              {link.isPlayable && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePlayClick}
                  className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-auto min-h-[32px]"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>
              )}
              
              {link.price && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-1 flex-shrink-0">
                  <DollarSign className="w-3 h-3" />
                  {link.price}
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExternalClick}
                className="ml-auto text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-auto min-h-[32px] flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Buy
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderSpotifyPreview = () => (
    <Card className={`overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-all ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Album artwork */}
          <div className="w-16 h-16 bg-muted flex-shrink-0 rounded">
            {link.thumbnail && (
              <ImageWithFallback
                src={link.thumbnail}
                alt={link.title || 'Album artwork'}
                className="w-full h-full object-cover rounded"
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                  {link.title || 'Spotify Track'}
                </h4>
                {link.artist && (
                  <p className="text-sm text-muted-foreground truncate">{link.artist}</p>
                )}
              </div>
              
              <Badge className="bg-green-600 text-white border-0 ml-2">
                {getPlatformIcon(link.platform)} Spotify
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              {link.duration && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {link.duration}
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExternalClick}
                className="ml-auto"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in Spotify
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderGenericPreview = () => (
    <Card className={`overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-all ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent-coral/10 text-accent-coral flex items-center justify-center rounded border border-accent-coral/20">
            {getPlatformIcon(link.platform)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {link.title || 'External Link'}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
              {link.platform}
            </p>
            
            {link.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {link.description}
              </p>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExternalClick}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  // Render based on platform type
  switch (link.type) {
    case 'youtube':
      return renderYouTubePreview();
    case 'bandcamp':
      return renderBandcampPreview();
    case 'spotify':
      return renderSpotifyPreview();
    case 'soundcloud':
      return renderBandcampPreview(); // Similar layout to Bandcamp
    default:
      return renderGenericPreview();
  }
}