import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Music,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { AIAuthenticationAttestation } from './AIAuthenticationAttestation';
import { AIDetectionResults } from './AIDetectionResults';
import { AIModeratorDashboard } from './AIModeratorDashboard';
import { TrustedUploaderBadge } from './TrustedUploaderBadge';
import { ReportAIModal } from './ReportAIModal';
import { toast } from 'sonner@2.0.3';

export function AIDetectionSystemDemo() {
  const [activeTab, setActiveTab] = useState('upload');
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [showAttestationError, setShowAttestationError] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock data for artist tracks
  const mockArtistTracks = [
    {
      id: '1',
      title: 'Midnight Dreams',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
      uploadDate: '2025-10-10',
      aiStatus: 'verified' as const,
      aiRiskScore: 0.15
    },
    {
      id: '2',
      title: 'Electric Pulse',
      uploadDate: '2025-10-12',
      aiStatus: 'analyzing' as const
    },
    {
      id: '3',
      title: 'Urban Nights',
      coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200',
      uploadDate: '2025-10-13',
      aiStatus: 'flagged' as const,
      aiRiskScore: 0.87,
      reviewNotes: 'High risk score due to unusual spectral patterns'
    },
    {
      id: '4',
      title: 'Summer Vibes',
      uploadDate: '2025-10-14',
      aiStatus: 'pending' as const,
      aiRiskScore: 0.72
    }
  ];

  // Mock data for moderator dashboard
  const mockFlaggedTracks = [
    {
      id: '1',
      title: 'Synthetic Symphony',
      artist: {
        id: 'artist1',
        name: 'NewProducer',
        verified: false,
        trustedUploader: false,
        uploadCount: 3
      },
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
      uploadDate: '2025-10-13',
      aiRiskScore: 0.92,
      metadata: {
        bitrate: '320kbps',
        format: 'MP3',
        duration: '3:42',
        creationTimeDelta: 'Suspicious (0s)'
      },
      flaggedReason: 'High AI risk score, unusual spectral patterns',
      status: 'pending' as const
    },
    {
      id: '2',
      title: 'Digital Waves',
      artist: {
        id: 'artist2',
        name: 'BeatMaker',
        verified: false,
        trustedUploader: false,
        uploadCount: 12
      },
      uploadDate: '2025-10-12',
      aiRiskScore: 0.78,
      metadata: {
        bitrate: '256kbps',
        format: 'WAV',
        daw: 'FL Studio',
        duration: '4:15',
        creationTimeDelta: 'Normal (3.2h)'
      },
      flaggedReason: 'Community report: synthetic vocals',
      status: 'reviewing' as const
    },
    {
      id: '3',
      title: 'Urban Nights',
      artist: {
        id: 'artist3',
        name: 'EstablishedArtist',
        verified: true,
        trustedUploader: true,
        uploadCount: 47
      },
      coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200',
      uploadDate: '2025-10-14',
      aiRiskScore: 0.65,
      metadata: {
        bitrate: '320kbps',
        format: 'FLAC',
        daw: 'Ableton Live',
        duration: '5:03',
        creationTimeDelta: 'Normal (2.1h)'
      },
      flaggedReason: 'Random audit - trusted uploader',
      status: 'pending' as const
    }
  ];

  const handleUpload = () => {
    if (!attestationChecked) {
      setShowAttestationError(true);
      toast.error('Attestation Required', {
        description: 'Please confirm human authorship before uploading'
      });
      return;
    }
    
    toast.success('Track Uploaded', {
      description: 'AI authenticity scan in progress...'
    });
    setAttestationChecked(false);
    setShowAttestationError(false);
  };

  const handleSubmitProof = (trackId: string, proof: any) => {
    toast.success('Proof Submitted', {
      description: 'Our team will review your submission within 24 hours'
    });
  };

  const handleApprove = (trackId: string, notes: string) => {
    console.log('Approved:', trackId, notes);
  };

  const handleReject = (trackId: string, notes: string) => {
    console.log('Rejected:', trackId, notes);
  };

  const handleReportSubmit = (report: any) => {
    toast.success('Report Submitted', {
      description: 'Thank you for helping maintain authenticity'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-accent-blue" />
            <h1 className="text-3xl font-bold">AI Detection System</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            sedā.fm's comprehensive system for maintaining authentic human creativity. 
            From upload attestation to community reporting and moderation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              100% Human Music
            </Badge>
            <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
              <Shield className="w-3 h-3 mr-1" />
              AI Detection
            </Badge>
            <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20">
              <Users className="w-3 h-3 mr-1" />
              Community Reports
            </Badge>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Flow</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Artist View</span>
                <span className="sm:hidden">Artist</span>
              </TabsTrigger>
              <TabsTrigger value="moderator" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Moderator</span>
                <span className="sm:hidden">Mod</span>
              </TabsTrigger>
              <TabsTrigger value="trusted" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Trusted Badge</span>
                <span className="sm:hidden">Badge</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
                <span className="sm:hidden">Report</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload Flow Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent-blue" />
                    Track Upload - Human Authorship Attestation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Mock Upload Form */}
                    <div className="p-6 rounded-lg border-2 border-dashed border-foreground/10 text-center">
                      <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your track here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, FLAC up to 200MB
                      </p>
                    </div>

                    {/* Attestation Component */}
                    <AIAuthenticationAttestation
                      isChecked={attestationChecked}
                      onCheckedChange={(checked) => {
                        setAttestationChecked(checked);
                        if (checked) setShowAttestationError(false);
                      }}
                      showError={showAttestationError}
                    />

                    {/* Upload Button */}
                    <Button 
                      className="w-full bg-accent-blue hover:bg-accent-blue/90"
                      onClick={handleUpload}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Track
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Artist Detection Results Tab */}
            <TabsContent value="results" className="space-y-6">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-accent-mint" />
                    My Uploads - AI Detection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIDetectionResults 
                    tracks={mockArtistTracks}
                    onSubmitProof={handleSubmitProof}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderator Dashboard Tab */}
            <TabsContent value="moderator">
              <AIModeratorDashboard
                flaggedTracks={mockFlaggedTracks}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </TabsContent>

            {/* Trusted Uploader Badge Tab */}
            <TabsContent value="trusted" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trusted User Example */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-blue" />
                    Trusted Uploader Status
                  </h3>
                  <TrustedUploaderBadge
                    isTrusted={true}
                    variant="full"
                    stats={{
                      totalUploads: 47,
                      humanVerifiedPercentage: 100,
                      reviewsPassed: 47,
                      consecutiveApprovals: 23
                    }}
                  />
                </div>

                {/* Standard User Example */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    Standard Verification
                  </h3>
                  <TrustedUploaderBadge
                    isTrusted={false}
                    variant="full"
                    stats={{
                      totalUploads: 8,
                      humanVerifiedPercentage: 87,
                      reviewsPassed: 7,
                      consecutiveApprovals: 5
                    }}
                  />
                </div>
              </div>

              {/* Badge Usage Examples */}
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="text-lg">Badge Usage Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Inline Badge (for posts/comments):</Label>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-foreground/10 flex items-center gap-2">
                      <span className="text-sm">@EstablishedArtist</span>
                      <TrustedUploaderBadge isTrusted={true} variant="inline" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Header Badge (for profile headers):</Label>
                    <div className="p-3 rounded-lg bg-secondary/30 border border-foreground/10 flex items-center gap-2">
                      <TrustedUploaderBadge isTrusted={true} variant="header" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Community Report Tab */}
            <TabsContent value="report" className="space-y-6">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent-coral" />
                    Community Reporting System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Community members can report tracks they suspect are AI-generated. 
                      Reports trigger manual review and analysis.
                    </p>

                    {/* Mock Track Card */}
                    <div className="p-4 rounded-lg border border-foreground/10 bg-secondary/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Suspicious Track Title</h4>
                          <p className="text-sm text-muted-foreground">by Unknown Artist</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReportModal(true)}
                          className="border-accent-coral/30 text-accent-coral hover:bg-accent-coral/10"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Report AI
                        </Button>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20 space-y-2">
                      <h4 className="text-sm font-medium text-accent-blue">How Reporting Works</h4>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Reports are anonymous to artists</li>
                        <li>• Tracks get flagged with "Under Community Review" badge</li>
                        <li>• Moderators review all reports within 48 hours</li>
                        <li>• Your reporting reputation affects review priority</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Report Modal */}
      <ReportAIModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        trackTitle="Suspicious Track Title"
        artistName="Unknown Artist"
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
