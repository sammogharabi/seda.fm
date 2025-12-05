# AI-Generated Music Detection System

## Overview

sedā.fm's comprehensive AI detection system ensures that only authentic human-created music is published on the platform. This system includes upload attestation, automated detection, manual moderation, community reporting, and trusted uploader status.

## Components

### 1. AIAuthenticationAttestation (`/components/AIAuthenticationAttestation.tsx`)
**Upload Flow - Human Authorship Attestation**

A required checkbox component that appears during track upload, ensuring artists confirm their music is human-created.

**Features:**
- Checkbox with human authorship confirmation
- Info banner explaining AI restrictions
- Error state if user attempts to upload without confirmation
- Warning about policy violations
- Link to full policy modal with detailed guidelines
- Smooth animations for checked state

**Usage:**
```tsx
<AIAuthenticationAttestation
  isChecked={attestationChecked}
  onCheckedChange={setAttestationChecked}
  showError={showAttestationError}
/>
```

---

### 2. AIDetectionResults (`/components/AIDetectionResults.tsx`)
**Artist View - Post-Upload Detection Status**

Displays the AI detection status of uploaded tracks from the artist's perspective.

**Features:**
- Track cards with status badges:
  - 🟢 Human Verified
  - 🟡 Pending Review
  - 🔴 Flagged for AI Review
  - 🔵 Analyzing...
- Progress bars for analyzing state
- Alerts for flagged/pending tracks with risk scores
- "Submit Proof of Authorship" modal for flagged tracks
- Support for uploading project files, stems, or screenshots

**Usage:**
```tsx
<AIDetectionResults 
  tracks={artistTracks}
  onSubmitProof={handleSubmitProof}
/>
```

---

### 3. AIModeratorDashboard (`/components/AIModeratorDashboard.tsx`)
**Moderator Dashboard - Review Queue**

A comprehensive moderation interface for reviewing flagged tracks.

**Features:**
- Stats overview (High Risk, Pending, In Review, Total Queue)
- Advanced filtering:
  - Search by track/artist name
  - Risk level filter (High, Medium, Low)
  - Artist type filter (Verified, Trusted, Unverified)
  - Sort by risk score or upload date
- Track list with:
  - AI risk score visualization
  - Metadata quick view
  - Artist badges (Verified, Trusted)
- Detail panel showing:
  - Full track metadata
  - Artist history
  - Waveform placeholder (for future implementation)
  - Moderator notes field
  - Approve/Reject actions

**Usage:**
```tsx
<AIModeratorDashboard
  flaggedTracks={flaggedTracks}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

---

### 4. TrustedUploaderBadge (`/components/TrustedUploaderBadge.tsx`)
**Artist Profile - Trusted Uploader Badge**

Displays trusted uploader status with three variants for different contexts.

**Variants:**
- **inline**: Small badge for posts/comments
- **header**: Animated badge for profile headers
- **full**: Complete card with stats and requirements

**Features:**
- Sparkle animation for trusted status
- Stats display:
  - Total uploads
  - Human verified percentage (with progress bar)
  - Reviews passed
  - Consecutive approval streak
- Requirements checklist for earning status
- Maintains status guidelines

**Usage:**
```tsx
// Inline badge
<TrustedUploaderBadge isTrusted={true} variant="inline" />

// Header badge
<TrustedUploaderBadge isTrusted={true} variant="header" />

// Full card with stats
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
```

---

### 5. ReportAIModal (`/components/ReportAIModal.tsx`)
**Community Reporting - Report Suspected AI Modal**

Modal for community members to report suspected AI-generated tracks.

**Features:**
- Reason dropdown with common AI indicators:
  - Synthetic/AI-Generated Vocals
  - Repetitive/Looped AI Instrumental
  - Unnatural Dynamics or Mix
  - Generic/Formulaic Composition
  - Suspicious Metadata
  - Artist History of AI Content
  - Other
- Detailed description field
- Important notes about reporting system
- Success confirmation screen
- "Under Community Review" badge status

**Usage:**
```tsx
<ReportAIModal
  isOpen={showReportModal}
  onClose={() => setShowReportModal(false)}
  trackTitle="Track Name"
  artistName="Artist Name"
  onSubmit={handleReportSubmit}
/>
```

---

### 6. AIDetectionSystemDemo (`/components/AIDetectionSystemDemo.tsx`)
**Comprehensive Demo**

A complete demonstration of all AI detection components in a tabbed interface.

**Access:**
Navigate to the `ai-detection` view in the app to see the full system in action.

```tsx
// In App.tsx, navigate to:
appState.handleViewChange('ai-detection')
```

---

## Integration with TrackUploadModal

The `TrackUploadModal` has been updated to include the AI attestation as part of the upload flow:

1. Artists must confirm copyright ownership
2. Artists must confirm human authorship (AI attestation)
3. Both confirmations are required before upload can proceed

---

## Design System Compliance

All components follow sedā.fm's design language:

### Colors
- **Background**: `#0a0a0a`
- **Text**: `#fafafa`
- **Accents**:
  - Coral (`accent-coral`): Warnings, rejections, high risk
  - Blue (`accent-blue`): Info, trusted status
  - Mint (`accent-mint`): Success, verified status
  - Yellow (`accent-yellow`): Pending, medium risk

### Typography
- Uses default typography from `styles/globals.css`
- No custom font sizes unless explicitly needed

### Spacing
- 24px grid system (p-4, p-6, gap-4, gap-6)
- Consistent card padding

### Animations
- Motion/React for smooth transitions
- Spring animations for badge appearances
- Progress bars with color-coded states

### Accessibility
- WCAG AA contrast compliance
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly

---

## Policy Summary

### What's NOT Allowed
- Music fully generated by AI tools (Suno, Udio, AIVA, etc.)
- Tracks where AI composed the melody, harmony, or structure
- AI-generated vocals or lyrics
- Music created by prompting AI systems

### What's Allowed
- Using DAW plugins and effects (reverb, compression, EQ)
- Sampling and remixing existing human-created music
- Using synthesizers and digital instruments
- AI-assisted mastering or mixing (as a tool, not creator)

### Consequences
1. **First offense**: Track removal + warning
2. **Second offense**: 30-day suspension
3. **Third offense**: Permanent ban

### Trusted Uploader Requirements
- 10+ tracks verified as human-created
- 100% verification rate
- Active account for 30+ days
- No policy violations or warnings

---

## Future Enhancements

1. **Acoustic Analysis**: Real-time spectral analysis during upload
2. **Metadata Verification**: Check for DAW signatures, creation time deltas
3. **Waveform Visualization**: Visual comparison tools for moderators
4. **Machine Learning**: Automated pattern recognition for AI-generated audio
5. **Blockchain Proof**: Optional blockchain verification for high-value releases
6. **Artist Reputation Score**: Track reporting accuracy and upload quality

---

## Testing

To test the system:

1. Navigate to `ai-detection` view in the app
2. Explore all tabs to see different components
3. Try uploading a track (upload flow includes attestation)
4. Test the report modal functionality
5. View different trusted uploader badge variants

---

## Notes

- All components are responsive (mobile + desktop)
- Uses Sheet on mobile, Dialog on desktop for modals
- Z-index properly configured to work with mobile navigation (z-[60])
- Toast notifications for user feedback
- Empty states for all list views
- Loading states with progress indicators
