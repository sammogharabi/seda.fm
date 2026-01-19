import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Filter,
  Search,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  FileAudio,
  User,
  Clock,
  TrendingUp,
  Eye,
  Music2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface FlaggedTrack {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    verified: boolean;
    trustedUploader: boolean;
    uploadCount: number;
  };
  coverUrl?: string;
  uploadDate: string;
  aiRiskScore: number;
  metadata: {
    bitrate: string;
    format: string;
    daw?: string;
    duration: string;
    creationTimeDelta?: string;
  };
  flaggedReason: string;
  status: 'pending' | 'reviewing' | 'resolved';
}

interface AIModeratorDashboardProps {
  flaggedTracks: FlaggedTrack[];
  onApprove?: (trackId: string, notes: string) => void;
  onReject?: (trackId: string, notes: string) => void;
}

export function AIModeratorDashboard({ 
  flaggedTracks, 
  onApprove, 
  onReject 
}: AIModeratorDashboardProps) {
  const [selectedTrack, setSelectedTrack] = useState<FlaggedTrack | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [artistTypeFilter, setArtistTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk-desc');

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    let filtered = [...flaggedTracks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Risk filter
    if (riskFilter !== 'all') {
      const minRisk = riskFilter === 'high' ? 0.85 : riskFilter === 'medium' ? 0.7 : 0;
      const maxRisk = riskFilter === 'high' ? 1 : riskFilter === 'medium' ? 0.85 : 0.7;
      filtered = filtered.filter(track => track.aiRiskScore >= minRisk && track.aiRiskScore < maxRisk);
    }

    // Artist type filter
    if (artistTypeFilter === 'verified') {
      filtered = filtered.filter(track => track.artist.verified);
    } else if (artistTypeFilter === 'trusted') {
      filtered = filtered.filter(track => track.artist.trustedUploader);
    } else if (artistTypeFilter === 'unverified') {
      filtered = filtered.filter(track => !track.artist.verified);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'risk-desc':
          return b.aiRiskScore - a.aiRiskScore;
        case 'risk-asc':
          return a.aiRiskScore - b.aiRiskScore;
        case 'date-desc':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-asc':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [flaggedTracks, searchQuery, riskFilter, artistTypeFilter, sortBy]);

  const handleApprove = () => {
    if (selectedTrack && onApprove) {
      onApprove(selectedTrack.id, moderatorNotes);
      toast.success('Track approved as human-created', {
        description: `${selectedTrack.title} by ${selectedTrack.artist.name}`
      });
      setSelectedTrack(null);
      setModeratorNotes('');
    }
  };

  const handleReject = () => {
    if (selectedTrack && onReject) {
      onReject(selectedTrack.id, moderatorNotes);
      toast.error('Track confirmed as AI-generated', {
        description: `${selectedTrack.title} has been removed`
      });
      setSelectedTrack(null);
      setModeratorNotes('');
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.85) return 'text-accent-coral';
    if (score >= 0.7) return 'text-accent-yellow';
    return 'text-accent-mint';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 0.85) {
      return (
        <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20">
          High Risk
        </Badge>
      );
    }
    if (score >= 0.7) {
      return (
        <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20">
          Medium Risk
        </Badge>
      );
    }
    return (
      <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
        Low Risk
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-blue" />
            AI Detection Review Queue
          </h1>
          <p className="text-muted-foreground">
            Review flagged tracks for AI-generated content
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-foreground/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-accent-coral" />
                <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20">
                  {flaggedTracks.filter(t => t.aiRiskScore >= 0.85).length}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </CardContent>
          </Card>

          <Card className="border-foreground/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-accent-yellow" />
                <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20">
                  {flaggedTracks.filter(t => t.status === 'pending').length}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>

          <Card className="border-foreground/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-accent-blue" />
                <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                  {flaggedTracks.filter(t => t.status === 'reviewing').length}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">In Review</div>
            </CardContent>
          </Card>

          <Card className="border-foreground/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Music2 className="w-5 h-5 text-accent-mint" />
                <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
                  {flaggedTracks.length}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">Total Queue</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Bar */}
        <Card className="border-foreground/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracks or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Risk Filter */}
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High (0.85-1.0)</SelectItem>
                  <SelectItem value="medium">Medium (0.7-0.85)</SelectItem>
                  <SelectItem value="low">Low (&lt;0.7)</SelectItem>
                </SelectContent>
              </Select>

              {/* Artist Type Filter */}
              <Select value={artistTypeFilter} onValueChange={setArtistTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Artist Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artists</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="trusted">Trusted Uploaders</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-foreground/10">
              <Label className="text-xs text-muted-foreground">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk-desc">Risk: High to Low</SelectItem>
                  <SelectItem value="risk-asc">Risk: Low to High</SelectItem>
                  <SelectItem value="date-desc">Date: Newest First</SelectItem>
                  <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Track List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredTracks.length === 0 ? (
              <Card className="border-foreground/10">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-accent-mint mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No tracks in review queue</p>
                </CardContent>
              </Card>
            ) : (
              filteredTracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <Card 
                    className={`border-foreground/10 cursor-pointer hover:border-accent-blue/40 transition-all ${
                      selectedTrack?.id === track.id ? 'border-accent-blue/60 bg-accent-blue/5' : ''
                    }`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Cover */}
                        <div className="flex-shrink-0">
                          {track.coverUrl ? (
                            <img 
                              src={track.coverUrl} 
                              alt={track.title}
                              className="w-14 h-14 rounded object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded bg-secondary/50 flex items-center justify-center border border-foreground/10">
                              <FileAudio className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{track.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {track.artist.name}
                                </p>
                                {track.artist.trustedUploader && (
                                  <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 text-[10px] px-1 h-4">
                                    Trusted
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {getRiskBadge(track.aiRiskScore)}
                          </div>

                          {/* Risk Score Bar */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">AI Risk Score</span>
                              <span className={`font-medium ${getRiskColor(track.aiRiskScore)}`}>
                                {(track.aiRiskScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            <Progress 
                              value={track.aiRiskScore * 100} 
                              className={`h-1.5 ${
                                track.aiRiskScore >= 0.85 
                                  ? '[&>div]:bg-accent-coral' 
                                  : track.aiRiskScore >= 0.7 
                                  ? '[&>div]:bg-accent-yellow' 
                                  : '[&>div]:bg-accent-mint'
                              }`}
                            />
                          </div>

                          {/* Metadata Quick View */}
                          <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-muted-foreground">
                            <span>{track.metadata.format}</span>
                            <span>•</span>
                            <span>{track.metadata.duration}</span>
                            {track.metadata.daw && (
                              <>
                                <span>•</span>
                                <span>{track.metadata.daw}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedTrack ? (
              <Card className="border-foreground/10 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Review Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Track Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedTrack.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {selectedTrack.artist.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrack.artist.verified && (
                        <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
                          Verified Artist
                        </Badge>
                      )}
                      {selectedTrack.artist.trustedUploader && (
                        <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                          Trusted Uploader
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Metadata */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Metadata Analysis</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span>{selectedTrack.metadata.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bitrate:</span>
                        <span>{selectedTrack.metadata.bitrate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{selectedTrack.metadata.duration}</span>
                      </div>
                      {selectedTrack.metadata.daw && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">DAW:</span>
                          <span>{selectedTrack.metadata.daw}</span>
                        </div>
                      )}
                      {selectedTrack.metadata.creationTimeDelta && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Creation Delta:</span>
                          <span className="text-accent-yellow">
                            {selectedTrack.metadata.creationTimeDelta}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Artist Stats */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Artist History</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Uploads:</span>
                        <span>{selectedTrack.artist.uploadCount}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Moderator Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="mod-notes" className="text-sm">
                      Moderator Notes
                    </Label>
                    <Textarea
                      id="mod-notes"
                      placeholder="Add notes about your decision..."
                      value={moderatorNotes}
                      onChange={(e) => setModeratorNotes(e.target.value)}
                      rows={4}
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      className="border-accent-coral/30 text-accent-coral hover:bg-accent-coral/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm AI
                    </Button>
                    <Button
                      onClick={handleApprove}
                      className="bg-accent-mint hover:bg-accent-mint/90 text-background"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-foreground/10">
                <CardContent className="p-12 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Select a track to review
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
