import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  Upload, 
  Music, 
  DollarSign, 
  Shield, 
  AlertCircle,
  Info,
  ExternalLink,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { AIAuthenticationAttestation } from './AIAuthenticationAttestation';

interface TrackUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadTrack: (trackData: any) => void;
  user: any;
}

export function TrackUploadModal({ isOpen, onClose, onUploadTrack, user }: TrackUploadModalProps) {
  const [step, setStep] = useState(1);
  const [trackData, setTrackData] = useState({
    title: '',
    description: '',
    pricingType: 'fixed', // 'fixed' or 'pwyw'
    fixedPrice: '',
    minimumPrice: '',
    suggestedPrice: '',
    formats: ['mp3-320'],
    copyrightConfirmed: false,
    humanAttestationConfirmed: false,
    audioFile: null,
    artwork: null,
    genre: '',
    tags: '',
    duration: '',
    releaseDate: new Date().toISOString().split('T')[0]
  });
  const [showAttestationError, setShowAttestationError] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const formatOptions = [
    { id: 'mp3-320', label: 'MP3 320kbps', description: 'High quality compressed audio' },
    { id: 'mp3-256', label: 'MP3 256kbps', description: 'Good quality compressed audio' },
    { id: 'flac', label: 'FLAC', description: 'Lossless high-definition audio' },
    { id: 'wav', label: 'WAV', description: 'Uncompressed studio quality' }
  ];

  const genreOptions = [
    'Electronic', 'Hip Hop', 'House', 'Techno', 'Ambient', 'Jazz', 'Rock', 
    'Indie', 'Pop', 'R&B', 'Experimental', 'Classical', 'Folk', 'Reggae', 
    'Drum & Bass', 'Dubstep', 'Trance', 'Other'
  ];

  const handleFormatToggle = useCallback((formatId: string) => {
    setTrackData(prev => ({
      ...prev,
      formats: prev.formats.includes(formatId)
        ? prev.formats.filter(f => f !== formatId)
        : [...prev.formats, formatId]
    }));
  }, []);

  const handleFileUpload = useCallback((file: File, type: 'audio' | 'artwork') => {
    if (type === 'audio') {
      // Simulate audio file processing
      setTrackData(prev => ({ ...prev, audioFile: file }));
      
      // Mock duration extraction (in real app, would use audio analysis)
      const mockDuration = Math.floor(Math.random() * 300) + 120; // 2-7 minutes
      const minutes = Math.floor(mockDuration / 60);
      const seconds = mockDuration % 60;
      setTrackData(prev => ({ 
        ...prev, 
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}` 
      }));
    } else {
      setTrackData(prev => ({ ...prev, artwork: file }));
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!trackData.copyrightConfirmed) {
      toast.error('Please confirm copyright ownership');
      return;
    }

    if (!trackData.humanAttestationConfirmed) {
      setShowAttestationError(true);
      toast.error('Please confirm human authorship');
      return;
    }

    if (!trackData.audioFile) {
      toast.error('Please upload an audio file');
      return;
    }

    if (trackData.formats.length === 0) {
      toast.error('Please select at least one format');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          
          // Create track object
          const newTrack = {
            id: Date.now(),
            ...trackData,
            audioFile: URL.createObjectURL(trackData.audioFile),
            artwork: trackData.artwork ? URL.createObjectURL(trackData.artwork) : 'https://images.unsplash.com/photo-1703115015343-81b498a8c080?w=300&h=300&fit=crop',
            uploadDate: new Date().toISOString(),
            status: 'published',
            downloadCount: 0,
            revenue: 0
          };

          onUploadTrack(newTrack);
          setIsUploading(false);
          setStep(1);
          setTrackData({
            title: '',
            description: '',
            pricingType: 'fixed',
            fixedPrice: '',
            minimumPrice: '',
            suggestedPrice: '',
            formats: ['mp3-320'],
            copyrightConfirmed: false,
            humanAttestationConfirmed: false,
            audioFile: null,
            artwork: null,
            genre: '',
            tags: '',
            duration: '',
            releaseDate: new Date().toISOString().split('T')[0]
          });
          setShowAttestationError(false);
          onClose();
          
          toast.success('Track uploaded successfully!', {
            description: 'Your track is now available for purchase'
          });
          
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  }, [trackData, onUploadTrack, onClose]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Track Information</h3>
              <div className="space-y-4">
                <div>
                  <Label>Track Title *</Label>
                  <Input
                    value={trackData.title}
                    onChange={(e) => setTrackData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter track title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={trackData.description}
                    onChange={(e) => setTrackData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your track"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Genre</Label>
                    <Select
                      value={trackData.genre}
                      onValueChange={(value) => setTrackData(prev => ({ ...prev, genre: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map((genre) => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Release Date</Label>
                    <Input
                      type="date"
                      value={trackData.releaseDate}
                      onChange={(e) => setTrackData(prev => ({ ...prev, releaseDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <Input
                    value={trackData.tags}
                    onChange={(e) => setTrackData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="ambient, chill, electronic (comma separated)"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Pricing Strategy</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="fixed-price"
                      name="pricing"
                      checked={trackData.pricingType === 'fixed'}
                      onChange={() => setTrackData(prev => ({ ...prev, pricingType: 'fixed' }))}
                    />
                    <Label htmlFor="fixed-price">Fixed Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pwyw"
                      name="pricing"
                      checked={trackData.pricingType === 'pwyw'}
                      onChange={() => setTrackData(prev => ({ ...prev, pricingType: 'pwyw' }))}
                    />
                    <Label htmlFor="pwyw">Pay What You Want</Label>
                  </div>
                </div>

                {trackData.pricingType === 'fixed' ? (
                  <div>
                    <Label>Price (USD) *</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={trackData.fixedPrice}
                        onChange={(e) => setTrackData(prev => ({ ...prev, fixedPrice: e.target.value }))}
                        placeholder="3.00"
                        className="pl-10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Minimum Price (USD)</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={trackData.minimumPrice}
                          onChange={(e) => setTrackData(prev => ({ ...prev, minimumPrice: e.target.value }))}
                          placeholder="1.00 (optional)"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Suggested Price (USD)</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={trackData.suggestedPrice}
                          onChange={(e) => setTrackData(prev => ({ ...prev, suggestedPrice: e.target.value }))}
                          placeholder="3.00"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-accent-blue mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Revenue Information</p>
                      <p className="text-muted-foreground mt-1">
                        You receive 90% of proceeds minus payment processing fees.
                        {trackData.pricingType === 'pwyw' && ' PWYW often generates 15-30% higher average revenue.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Audio Formats</h3>
              
              <div className="space-y-3">
                {formatOptions.map((format) => (
                  <div key={format.id} className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{format.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {format.id.includes('mp3') ? 'Compressed' : 'Lossless'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{format.description}</p>
                    </div>
                    <Switch
                      checked={trackData.formats.includes(format.id)}
                      onCheckedChange={() => handleFormatToggle(format.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-accent-mint mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Format Recommendations</p>
                    <p className="text-muted-foreground mt-1">
                      • MP3 320kbps: Standard for most listeners<br/>
                      • FLAC: Audiophiles and producers prefer lossless<br/>
                      • Multiple formats increase potential audience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">File Upload</h3>
              
              <div className="space-y-4">
                {/* Audio File Upload */}
                <div>
                  <Label>Audio File *</Label>
                  <div className="mt-1 border-2 border-dashed border-foreground/20 rounded-lg p-6 text-center relative">
                    {trackData.audioFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <Music className="w-6 h-6 text-accent-mint" />
                        <div>
                          <p className="font-medium">{trackData.audioFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(trackData.audioFile.size / (1024 * 1024)).toFixed(1)} MB
                            {trackData.duration && ` • ${trackData.duration}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTrackData(prev => ({ ...prev, audioFile: null, duration: '' }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Drop your audio file here</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports MP3, WAV, FLAC, AIFF • Max 100MB
                        </p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audio')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Artwork Upload */}
                <div>
                  <Label>Artwork (Optional)</Label>
                  <div className="mt-1 border-2 border-dashed border-foreground/20 rounded-lg p-4 text-center relative">
                    {trackData.artwork ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-cover bg-center rounded" 
                             style={{ backgroundImage: `url(${URL.createObjectURL(trackData.artwork)})` }} />
                        <div>
                          <p className="font-medium">{trackData.artwork.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(trackData.artwork.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTrackData(prev => ({ ...prev, artwork: null }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG • Recommended: 1400x1400px
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'artwork')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Copyright Confirmation</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-medium text-destructive mb-2">Important Legal Notice</h4>
                      <p className="text-sm text-muted-foreground">
                        You must own or have proper licensing rights to sell this track. 
                        Uploading copyrighted material without permission is illegal and 
                        will result in account termination.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="copyright"
                      checked={trackData.copyrightConfirmed}
                      onChange={(e) => setTrackData(prev => ({ ...prev, copyrightConfirmed: e.target.checked }))}
                      className="mt-1"
                    />
                    <label htmlFor="copyright" className="text-sm">
                      <span className="font-medium">I confirm that I own the copyright to this track</span> or have 
                      proper licensing rights to sell it commercially. I understand that 
                      providing false information may result in legal action and account termination.
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-accent-blue mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Don't own the rights?</p>
                      <p className="text-muted-foreground mt-1">
                        You can register your original work through official copyright registration.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open('https://www.copyright.gov/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Copyright Registration
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                  <h4 className="font-medium mb-2">Security Features</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• All purchased files are watermarked with transaction ID</p>
                    <p>• Download links expire after 5 uses for security</p>
                    <p>• Buyer information is logged for anti-piracy tracking</p>
                    <p>• DMCA takedown support available for copyright holders</p>
                  </div>
                </div>

                {/* AI Attestation */}
                <div className="pt-4 border-t border-foreground/10">
                  <AIAuthenticationAttestation
                    isChecked={trackData.humanAttestationConfirmed}
                    onCheckedChange={(checked) => {
                      setTrackData(prev => ({ ...prev, humanAttestationConfirmed: checked }));
                      if (checked) setShowAttestationError(false);
                    }}
                    showError={showAttestationError}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isUploading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md border border-foreground/10" aria-describedby="track-upload-progress-description">
          <DialogHeader>
            <DialogTitle>Uploading Track</DialogTitle>
            <DialogDescription id="track-upload-progress-description">
              Processing your audio file and preparing for sale
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-accent-mint/20 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Music className="w-8 h-8 text-accent-mint" />
              </motion.div>
              <p className="font-medium">{trackData.title}</p>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-accent-mint h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Analyzing audio quality and metadata</p>
              <p>• Generating multiple format versions</p>
              <p>• Applying security watermarks</p>
              <p>• Creating secure download infrastructure</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border border-foreground/10" aria-describedby="track-upload-step-description">
        <DialogHeader>
          <DialogTitle>Upload New Track</DialogTitle>
          <DialogDescription id="track-upload-step-description">
            Step {step} of 5: {
              step === 1 ? 'Track Information' :
              step === 2 ? 'Pricing Strategy' :
              step === 3 ? 'Audio Formats' :
              step === 4 ? 'File Upload' :
              'Copyright Confirmation'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum === step
                    ? 'bg-accent-coral text-background'
                    : stepNum < step
                    ? 'bg-accent-mint text-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
        </div>

        {renderStepContent()}

        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          
          <div className="flex-1" />

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !trackData.title.trim()) ||
                (step === 2 && trackData.pricingType === 'fixed' && !trackData.fixedPrice) ||
                (step === 3 && trackData.formats.length === 0) ||
                (step === 4 && !trackData.audioFile)
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleUpload}
              disabled={!trackData.copyrightConfirmed}
              className="bg-accent-coral hover:bg-accent-coral/90"
            >
              Upload Track
            </Button>
          )}

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}