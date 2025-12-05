import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { 
  Music, 
  Type, 
  Calendar,
  X,
  Search,
  Clock,
  Link
} from 'lucide-react';
import { LinkPreview } from './LinkPreview';
import { extractLinksFromText, LinkMetadata } from '../utils/linkParser';

interface PostTypeTabsProps {
  postType: string;
  onPostTypeChange: (type: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  selectedTrack: any;
  onSelectedTrackChange: (track: any) => void;
  trackSearch: string;
  onTrackSearchChange: (search: string) => void;
  filteredTracks: any[];
  djSessionTitle: string;
  onDjSessionTitleChange: (title: string) => void;
  djSessionGenre: string;
  onDjSessionGenreChange: (genre: string) => void;
  djSessionDuration: string;
  onDjSessionDurationChange: (duration: string) => void;
  detectedLinks?: LinkMetadata[];
  onLinksChange?: (links: LinkMetadata[]) => void;
}

export function PostTypeTabs({
  postType,
  onPostTypeChange,
  content,
  onContentChange,
  selectedTrack,
  onSelectedTrackChange,
  trackSearch,
  onTrackSearchChange,
  filteredTracks,
  djSessionTitle,
  onDjSessionTitleChange,
  djSessionGenre,
  onDjSessionGenreChange,
  djSessionDuration,
  onDjSessionDurationChange,
  detectedLinks = [],
  onLinksChange
}: PostTypeTabsProps) {
  const [parsedContent, setParsedContent] = useState({ text: content, links: detectedLinks });

  // Parse links whenever content changes
  useEffect(() => {
    const parsed = extractLinksFromText(content);
    setParsedContent(parsed);
    if (onLinksChange) {
      onLinksChange(parsed.links);
    }
  }, [content, onLinksChange]);

  const handleContentChange = (newContent: string) => {
    onContentChange(newContent);
  };
  return (
    <Tabs value={postType} onValueChange={onPostTypeChange}>
      {/* Mobile-Optimized Tab Navigation */}
      <div className="w-full">
        <TabsList className="w-full h-auto p-1 bg-secondary/50 rounded-lg">
          <div className="grid grid-cols-4 w-full gap-1">
            <TabsTrigger 
              value="text" 
              className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[60px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs font-medium">Text</span>
            </TabsTrigger>
            <TabsTrigger 
              value="link" 
              className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[60px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Link className="w-4 h-4" />
              <span className="text-xs font-medium">Link</span>
            </TabsTrigger>
            <TabsTrigger 
              value="music" 
              className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[60px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Music className="w-4 h-4" />
              <span className="text-xs font-medium">Music</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dj_session" 
              className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[60px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">DJ Session</span>
            </TabsTrigger>
          </div>
        </TabsList>
      </div>

      <TabsContent value="text" className="space-y-4">
        <div>
          <Label htmlFor="content">What's on your mind?</Label>
          <Textarea
            id="content"
            placeholder="Share your thoughts, music discoveries, or paste links to YouTube, Bandcamp, Spotify..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {content.length}/500 characters
          </p>
          
          {/* Auto-detected links */}
          {parsedContent.links.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Detected Links</Label>
              <div className="space-y-3">
                {parsedContent.links.map((link, index) => (
                  <LinkPreview 
                    key={`text-preview-${index}-${link.url}`} 
                    link={link}
                    className="bg-secondary/30"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="link" className="space-y-4">
        <div>
          <Label htmlFor="link-content">Share a link with your thoughts</Label>
          <Textarea
            id="link-content"
            placeholder="Paste your YouTube, Bandcamp, Spotify, or merch store link here and add your commentary..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {content.length}/500 characters
          </p>
        </div>

        {/* Link parsing helper text */}
        <div className="p-3 bg-accent-mint/10 border border-accent-mint/20 rounded">
          <p className="text-sm text-foreground mb-2 font-medium">Supported platforms:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>• YouTube videos</div>
            <div>• Bandcamp tracks/albums</div>
            <div>• Spotify songs/albums</div>
            <div>• SoundCloud tracks</div>
            <div>• Merch stores</div>
            <div>• Any website</div>
          </div>
        </div>

        {/* Link previews */}
        {parsedContent.links.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Link Previews</Label>
            <div className="space-y-3">
              {parsedContent.links.map((link, index) => (
                <LinkPreview 
                  key={`link-preview-${index}-${link.url}`} 
                  link={link}
                />
              ))}
            </div>
          </div>
        )}

        {content && parsedContent.links.length === 0 && (
          <div className="p-3 bg-muted/50 border border-foreground/10 rounded text-center">
            <p className="text-sm text-muted-foreground">
              No links detected. Try pasting a valid URL.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="music" className="space-y-4">
        <div>
          <Label htmlFor="content">Tell us about this track</Label>
          <Textarea
            id="content"
            placeholder="Why are you sharing this track? What makes it special?"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
        </div>

        <div>
          <Label htmlFor="track-search">Search for a track</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="track-search"
              placeholder="Search tracks or artists..."
              value={trackSearch}
              onChange={(e) => onTrackSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {selectedTrack && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTrack.artwork}
                  alt={selectedTrack.title}
                  className="w-12 h-12 object-cover border border-foreground/20"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{selectedTrack.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTrack.artist}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {selectedTrack.duration}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectedTrackChange(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {trackSearch && !selectedTrack && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => onSelectedTrackChange(track)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={track.artwork}
                      alt={track.title}
                      className="w-10 h-10 object-cover border border-foreground/20"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{track.title}</h4>
                      <p className="text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {track.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTracks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tracks found</p>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="dj_session" className="space-y-4">
        <div>
          <Label htmlFor="content">Describe your DJ session</Label>
          <Textarea
            id="content"
            placeholder="What can listeners expect from your session?"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="session-title">Session Title</Label>
            <Input
              id="session-title"
              placeholder="e.g., Late Night Vibes"
              value={djSessionTitle}
              onChange={(e) => onDjSessionTitleChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="session-genre">Genre</Label>
            <Input
              id="session-genre"
              placeholder="e.g., House, Techno"
              value={djSessionGenre}
              onChange={(e) => onDjSessionGenreChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="session-duration">Expected Duration</Label>
          <Input
            id="session-duration"
            placeholder="e.g., 2 hours"
            value={djSessionDuration}
            onChange={(e) => onDjSessionDurationChange(e.target.value)}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}