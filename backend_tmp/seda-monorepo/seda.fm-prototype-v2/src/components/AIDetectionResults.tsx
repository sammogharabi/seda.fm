import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Upload, 
  FileAudio,
  Loader2,
  Info,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Track {
  id: string;
  title: string;
  coverUrl?: string;
  uploadDate: string;
  aiStatus: 'verified' | 'pending' | 'flagged' | 'analyzing';
  aiRiskScore?: number;
  reviewNotes?: string;
}

interface AIDetectionResultsProps {
  tracks: Track[];
  onSubmitProof?: (trackId: string, proof: { description: string; files: File[] }) => void;
}

export function AIDetectionResults({ tracks, onSubmitProof }: AIDetectionResultsProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [proofDescription, setProofDescription] = useState('');

  const getStatusBadge = (status: Track['aiStatus']) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Human Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      case 'flagged':
        return (
          <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Flagged for AI Review
          </Badge>
        );
      case 'analyzing':
        return (
          <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing...
          </Badge>
        );
    }
  };

  const getStatusColor = (status: Track['aiStatus']) => {
    switch (status) {
      case 'verified': return 'border-accent-mint/30';
      case 'pending': return 'border-accent-yellow/30';
      case 'flagged': return 'border-accent-coral/30';
      case 'analyzing': return 'border-accent-blue/30';
    }
  };

  return (
    <>
      <div className="space-y-4">
        {tracks.length === 0 ? (
          <Card className="border-foreground/10">
            <CardContent className="p-12 text-center">
              <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No tracks uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          tracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <Card className={`border-2 ${getStatusColor(track.aiStatus)} transition-colors`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Track Thumbnail */}
                    <div className="flex-shrink-0">
                      {track.coverUrl ? (
                        <img 
                          src={track.coverUrl} 
                          alt={track.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-secondary/50 flex items-center justify-center border border-foreground/10">
                          <FileAudio className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium">{track.title}</h3>
                          {getStatusBadge(track.aiStatus)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(track.uploadDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Analyzing State */}
                      {track.aiStatus === 'analyzing' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Running authenticity scan...</span>
                            <span className="text-accent-blue">~2 min</span>
                          </div>
                          <Progress value={65} className="h-1.5" />
                        </div>
                      )}

                      {/* Flagged Alert */}
                      {track.aiStatus === 'flagged' && (
                        <Alert className="border-accent-coral/30 bg-accent-coral/5">
                          <Shield className="h-4 w-4 text-accent-coral" />
                          <AlertDescription className="text-xs">
                            This track is under AI authenticity review. You'll be notified when moderation is complete.
                            {track.aiRiskScore && (
                              <span className="block mt-1 text-accent-coral/80">
                                Risk Score: {(track.aiRiskScore * 100).toFixed(0)}%
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Pending Info */}
                      {track.aiStatus === 'pending' && (
                        <Alert className="border-accent-yellow/30 bg-accent-yellow/5">
                          <Info className="h-4 w-4 text-accent-yellow" />
                          <AlertDescription className="text-xs text-accent-yellow">
                            Manual review in progress. Typical wait time: 24-48 hours.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Proof Button */}
                      {(track.aiStatus === 'flagged' || track.aiStatus === 'pending') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTrack(track)}
                          className="w-full sm:w-auto border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10"
                        >
                          <Upload className="w-3.5 h-3.5 mr-2" />
                          Submit Proof of Authorship
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Submit Proof Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="max-w-lg" aria-describedby="proof-submission-description">
          <DialogHeader>
            <DialogTitle>Submit Proof of Authorship</DialogTitle>
            <DialogDescription id="proof-submission-description">
              Help us verify this is human-created music
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-foreground/10">
              <p className="text-sm font-medium mb-1">{selectedTrack?.title}</p>
              <p className="text-xs text-muted-foreground">
                Help us verify this is human-created music
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof-description">Description</Label>
              <Textarea
                id="proof-description"
                placeholder="Describe your creative process, tools used, or any other relevant details..."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Supporting Files (Optional)</Label>
              <div className="border-2 border-dashed border-foreground/10 rounded-lg p-6 text-center hover:border-accent-blue/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Upload project files, stems, or screenshots
                </p>
                <p className="text-xs text-muted-foreground/70">
                  DAW sessions, exported stems, recording screenshots
                </p>
                <input
                  type="file"
                  multiple
                  accept=".zip,.flp,.als,.logic,.ptx,.png,.jpg,.jpeg"
                  className="hidden"
                />
              </div>
            </div>

            <Alert className="border-accent-mint/30 bg-accent-mint/5">
              <Info className="h-4 w-4 text-accent-mint" />
              <AlertDescription className="text-xs text-accent-mint">
                Submitting detailed proof speeds up the review process. Common evidence: DAW screenshots showing your project timeline, 
                exported stems, or photos from recording sessions.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTrack(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedTrack && onSubmitProof) {
                    onSubmitProof(selectedTrack.id, {
                      description: proofDescription,
                      files: []
                    });
                  }
                  setSelectedTrack(null);
                  setProofDescription('');
                }}
                className="flex-1 bg-accent-blue hover:bg-accent-blue/90"
                disabled={!proofDescription.trim()}
              >
                Submit Proof
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
