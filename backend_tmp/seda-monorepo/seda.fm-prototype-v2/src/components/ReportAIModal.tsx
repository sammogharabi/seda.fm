import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface ReportAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackTitle: string;
  artistName: string;
  onSubmit?: (report: { reason: string; description: string }) => void;
}

export function ReportAIModal({
  isOpen,
  onClose,
  trackTitle,
  artistName,
  onSubmit
}: ReportAIModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (onSubmit && reason && description.trim()) {
      onSubmit({ reason, description });
    }
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" aria-describedby="report-ai-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-yellow" />
            Report Suspected AI-Generated Track
          </DialogTitle>
          <DialogDescription id="report-ai-description" className="sr-only">
            Help us maintain authentic human creativity on sedā.fm
          </DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >

              <div className="space-y-4 mt-4">
                {/* Track Info */}
                <div className="p-3 rounded-lg bg-secondary/50 border border-foreground/10">
                  <div className="text-sm font-medium mb-1">{trackTitle}</div>
                  <div className="text-xs text-muted-foreground">by {artistName}</div>
                </div>

                {/* Reason Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="report-reason">Primary Reason *</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger id="report-reason">
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synthetic-vocals">
                        Synthetic/AI-Generated Vocals
                      </SelectItem>
                      <SelectItem value="looped-instrumental">
                        Repetitive/Looped AI Instrumental
                      </SelectItem>
                      <SelectItem value="unnatural-dynamics">
                        Unnatural Dynamics or Mix
                      </SelectItem>
                      <SelectItem value="generic-composition">
                        Generic/Formulaic Composition
                      </SelectItem>
                      <SelectItem value="metadata-suspicious">
                        Suspicious Metadata
                      </SelectItem>
                      <SelectItem value="artist-history">
                        Artist History of AI Content
                      </SelectItem>
                      <SelectItem value="other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="report-description">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="report-description"
                    placeholder="Describe what seems AI-generated... (e.g., 'The vocals sound robotic at 1:23', 'The melody repeats in an unnatural pattern', etc.)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about timestamps, patterns, or characteristics that seem artificial
                  </p>
                </div>

                {/* Info Alert */}
                <Alert className="border-accent-blue/30 bg-accent-blue/5">
                  <Info className="h-4 w-4 text-accent-blue" />
                  <AlertDescription className="text-xs text-accent-blue">
                    <strong>What happens next:</strong> Your report will be reviewed by our moderation team. 
                    The track will be flagged for AI analysis. False reports may affect your reporting reputation.
                  </AlertDescription>
                </Alert>

                {/* Important Notes */}
                <div className="space-y-2 p-3 rounded-lg bg-accent-yellow/5 border border-accent-yellow/20">
                  <h4 className="text-sm font-medium text-accent-yellow flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Important
                  </h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Reports are anonymous to the artist</li>
                    <li>• Abuse of the reporting system may result in restrictions</li>
                    <li>• Using digital instruments or effects is NOT AI generation</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!reason || !description.trim()}
                    className="flex-1 bg-accent-coral hover:bg-accent-coral/90"
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15,
                    delay: 0.1 
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-accent-mint/10 border-2 border-accent-mint/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-accent-mint" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Report Submitted</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Thank you for helping maintain authentic creativity on sedā.fm. 
                    Our team will review this track.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-muted-foreground">Track Status:</span>
                    <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20">
                      Under Community Review
                    </Badge>
                  </div>

                  <Alert className="border-accent-blue/30 bg-accent-blue/5 text-left">
                    <Info className="h-4 w-4 text-accent-blue" />
                    <AlertDescription className="text-xs text-accent-blue">
                      A yellow "Under Community Review" badge has been added to this track. 
                      You can view your reporting history in your account settings.
                    </AlertDescription>
                  </Alert>
                </div>

                <Button
                  onClick={handleClose}
                  className="w-full bg-accent-mint hover:bg-accent-mint/90 text-background"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
