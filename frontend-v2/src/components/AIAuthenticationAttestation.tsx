import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

interface AIAuthenticationAttestationProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showError?: boolean;
}

export function AIAuthenticationAttestation({
  isChecked,
  onCheckedChange,
  showError = false
}: AIAuthenticationAttestationProps) {
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Attestation Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            isChecked 
              ? 'bg-accent-mint/5 border-accent-mint/30' 
              : showError 
              ? 'bg-accent-coral/5 border-accent-coral/50 animate-pulse' 
              : 'bg-secondary/30 border-foreground/10'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="pt-0.5">
              <Checkbox
                id="human-attestation"
                checked={isChecked}
                onCheckedChange={onCheckedChange}
                className="border-2"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label
                htmlFor="human-attestation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                Human Authorship Attestation
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-accent-mint" />
                  </motion.div>
                )}
              </label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I confirm this track was created entirely by a human artist without AI generation or AI-assisted composition.
              </p>
              
              {/* Info Banner */}
              <div className="flex items-start gap-2 p-2 rounded bg-accent-blue/10 border border-accent-blue/20">
                <Info className="w-3.5 h-3.5 text-accent-blue flex-shrink-0 mt-0.5" />
                <p className="text-xs text-accent-blue">
                  AI-generated or AI-assisted tracks are not allowed on sedā.fm
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {showError && !isChecked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className="border-accent-coral/50 bg-accent-coral/10">
                <AlertTriangle className="h-4 w-4 text-accent-coral" />
                <AlertDescription className="text-sm text-accent-coral">
                  Upload cannot proceed without confirmation of human authorship
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning & Policy Link */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5 text-accent-yellow flex-shrink-0 mt-0.5" />
            <p>
              Violations may result in track removal, account suspension, or permanent ban from the platform.
            </p>
          </div>
          
          <button
            onClick={() => setShowPolicyModal(true)}
            className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors flex items-center gap-1 group"
          >
            Learn more about our AI policy
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Policy Modal */}
      <Dialog open={showPolicyModal} onOpenChange={setShowPolicyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="ai-policy-description">
          <DialogHeader>
            <DialogTitle>AI-Generated Content Policy</DialogTitle>
            <DialogDescription id="ai-policy-description">
              sedā.fm is built for authentic human creativity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium">Why We Don't Allow AI-Generated Music</h3>
              <p className="text-muted-foreground leading-relaxed">
                sedā.fm is a platform for real artists to connect with real fans. We believe in protecting human creativity, 
                supporting authentic musical expression, and building a community rooted in genuine artistic labor.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">What's Not Allowed</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Music fully generated by AI tools (Suno, Udio, AIVA, etc.)</li>
                <li>Tracks where AI composed the melody, harmony, or structure</li>
                <li>AI-generated vocals or lyrics</li>
                <li>Music created by prompting AI systems</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">What's Allowed</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Using DAW plugins and effects (reverb, compression, EQ)</li>
                <li>Sampling and remixing existing human-created music</li>
                <li>Using synthesizers and digital instruments</li>
                <li>AI-assisted mastering or mixing (as a tool, not creator)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Detection & Review Process</h3>
              <p className="text-muted-foreground leading-relaxed">
                All uploads are scanned using acoustic analysis, metadata verification, and pattern recognition. 
                Flagged tracks enter manual review. You may be asked to provide proof of authorship (DAW screenshots, stems, project files).
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Consequences of Violations</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>First offense:</strong> Track removal + warning</li>
                <li><strong>Second offense:</strong> 30-day suspension</li>
                <li><strong>Third offense:</strong> Permanent ban</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-accent-mint/10 border border-accent-mint/20">
              <p className="text-xs text-accent-mint">
                <strong>Trusted Uploaders:</strong> Artists with consistent human-verified uploads may earn "Trusted Uploader" status, 
                which allows faster processing and reduced scrutiny (though random audits still apply).
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
