# Feedback System Feature Documentation

## Overview
The feedback system allows users (both artists and fans) to submit structured feedback about their sedā.fm experience. Feedback is sent directly to sam@seda.fm via email using the Resend email service.

## Feature Location
- **Navigation**: Positioned in the Sidebar between "Merch Store" and "Sign Out" buttons
- **Route**: Accessible via the main app sidebar navigation
- **Component**: `/components/Feedback.tsx`

## User Flow

1. User clicks "Feedback" in the sidebar
2. User selects their user type (Artist or Fan)
3. User rates their experience from 1-10 using a clickable star-based rating system
4. User provides detailed feedback in a textarea
5. User clicks "Submit Feedback"
6. System sends feedback via email to sam@seda.fm
7. User receives success confirmation toast
8. Form resets for next submission

## Components

### Feedback.tsx
**Location**: `/components/Feedback.tsx`

**Props**:
- `user: any` - Current user object containing username and id

**State Management**:
- `userType: 'artist' | 'fan' | null` - Selected user type
- `rating: number | null` - Rating value (1-10)
- `comment: string` - Feedback text
- `isSubmitting: boolean` - Loading state during submission

**Key Features**:
- User type selection buttons (Artist/Fan) with visual feedback
- Interactive star-based rating system (1-10)
- Textarea for detailed feedback comments
- Form validation with error toasts
- Loading state during submission
- Success/error notifications using Sonner toast

**Styling**:
- Dark mode theme (#0a0a0a background, #fafafa text)
- Underground music collective aesthetic
- Coral accent color for primary actions
- Professional backstage pass-style design
- Responsive layout

## Backend Implementation

### API Endpoint
**Endpoint**: `POST /make-server-2cdc6b38/feedback`

**Location**: `/supabase/functions/server/index.tsx`

**Request Body**:
```json
{
  "userType": "artist" | "fan",
  "rating": 1-10,
  "comment": "User feedback text",
  "username": "username or 'Anonymous'",
  "userId": "user_id or null"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Feedback sent successfully"
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "details": "Additional error information"
}
```

### Email Integration

**Service**: Resend (https://resend.com)

**Environment Variable Required**: `RESEND_API_KEY`

**Email Configuration**:
- **From**: `sedā.fm <feedback@seda.fm>`
- **To**: `sam@seda.fm`
- **Subject**: `New Feedback from {userType} - Rating: {rating}/10`

**Email Template**:
- Professional dark-themed HTML email
- Matches sedā.fm's underground aesthetic
- Includes user information section:
  - Username (or "Anonymous")
  - User ID (or "N/A")
  - User type (Artist/Fan)
  - Rating (X/10)
- Includes feedback section with full comment text
- Timestamp of submission
- Responsive design for mobile email clients

### Error Handling

**Frontend**:
- Validates user type selection before submission
- Validates rating selection before submission
- Validates comment is not empty before submission
- Displays error toasts for validation failures
- Displays error toast if API call fails
- Logs errors to console for debugging

**Backend**:
- Validates required fields (userType, rating, comment)
- Checks for RESEND_API_KEY environment variable
- Validates Resend API response
- Logs all errors with context to console
- Returns detailed error messages to frontend

## Technical Implementation

### Frontend API Call
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-2cdc6b38/feedback`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      userType,
      rating,
      comment,
      username: user?.username || 'Anonymous',
      userId: user?.id || null
    })
  }
);
```

### Backend Email Sending
```typescript
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${resendApiKey}`
  },
  body: JSON.stringify({
    from: 'sedā.fm <feedback@seda.fm>',
    to: ['sam@seda.fm'],
    subject: `New Feedback from ${userType} - Rating: ${rating}/10`,
    html: '...' // Full HTML email template
  })
});
```

## Environment Variables

### Required
- `RESEND_API_KEY` - API key from Resend for sending emails
  - **Already configured**: Yes (user already provided this secret)
  - **Where to get**: https://resend.com (free tier available)

### Used (Auto-configured)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for backend
- `SUPABASE_ANON_KEY` - Public anonymous key for frontend

## Design Patterns

### UI/UX Patterns
- **Button Groups**: User type selection uses mutually exclusive button group
- **Interactive Ratings**: Clickable stars with hover states and visual feedback
- **Form Validation**: Real-time validation with toast notifications
- **Loading States**: Submit button shows loading state during API call
- **Success Feedback**: Toast notification confirms successful submission
- **Auto-reset**: Form clears after successful submission

### Code Patterns
- **Async/Await**: Modern async handling for API calls
- **Try/Catch**: Comprehensive error handling
- **State Management**: React hooks for form state
- **Type Safety**: TypeScript interfaces for props and data
- **Logging**: Console logging for debugging in both frontend and backend

## Integration Points

### Sidebar Integration
**File**: `/components/Sidebar.tsx`

The Feedback link is positioned in the sidebar navigation:
- After "Merch Store" link
- Before "Sign Out" button
- Uses `MessageSquare` icon from lucide-react
- Text: "Feedback"

### State Dependencies
- Requires `user` object from app state
- Uses `projectId` and `publicAnonKey` from `/utils/supabase/info.tsx`

## Testing Checklist

### Frontend Testing
- [ ] User type button selection (Artist/Fan)
- [ ] Rating stars clickable (1-10)
- [ ] Textarea accepts input
- [ ] Validation errors show for missing fields
- [ ] Submit button shows loading state
- [ ] Success toast displays on successful submission
- [ ] Error toast displays on failed submission
- [ ] Form resets after successful submission

### Backend Testing
- [ ] Endpoint accepts POST requests
- [ ] Request validation works
- [ ] Email is sent via Resend
- [ ] Email contains correct user information
- [ ] Email contains correct feedback content
- [ ] Error handling works for missing API key
- [ ] Error handling works for Resend API failures
- [ ] Logs show appropriate messages

### Email Testing
- [ ] Email arrives at sam@seda.fm
- [ ] Email subject line is correct
- [ ] Email body renders correctly
- [ ] Dark theme styling appears correctly
- [ ] All user information is included
- [ ] Timestamp is formatted correctly
- [ ] Email is mobile-responsive

## Future Enhancements

### Potential Improvements
1. **Analytics Dashboard**: View feedback submissions in an admin panel
2. **Feedback Categories**: Add categories (Bug, Feature Request, General, etc.)
3. **Attachments**: Allow users to attach screenshots
4. **Follow-up**: Email thread for follow-up questions
5. **Auto-tagging**: Use AI to categorize feedback automatically
6. **Sentiment Analysis**: Track feedback sentiment over time
7. **Integration**: Connect to project management tools (Linear, Notion, etc.)

### Database Storage
Currently, feedback is only sent via email. To add database storage:
1. Store feedback in `kv_store` with key pattern: `feedback:{timestamp}:{userId}`
2. Create feedback history view for admins
3. Add ability to mark feedback as "reviewed" or "acted upon"

### Notification Options
- Add Slack webhook integration
- Add Discord webhook integration
- Send SMS for critical feedback (low ratings)

## Migration Notes

### From Mock to Live
This feature was implemented with full backend integration from the start. No migration needed.

### API Key Setup
When handing off to Claude Code:
1. User already has RESEND_API_KEY configured
2. No additional setup required
3. Email sending should work immediately

## Design System Alignment

### Colors Used
- **Background**: `#0a0a0a` (dark mode primary)
- **Text**: `#fafafa` (dark mode text)
- **Primary Action**: `#ff6b6b` (coral)
- **Borders**: `#333` (dark mode borders)
- **Secondary Background**: `#1a1a1a` (elevated surfaces)
- **Muted Text**: `#a0a0a0` (secondary text)

### Typography
- Uses default typography from `/styles/globals.css`
- No custom font sizes applied (follows design system)
- Maintains consistent hierarchy

### Spacing
- Professional spacing throughout
- Consistent padding and margins
- Publication-quality layout

## Related Documentation
- `ARCHITECTURE.md` - Overall app architecture
- `COMPONENT-GUIDE.md` - Component creation guidelines
- `STATE-MANAGEMENT.md` - App state management patterns
- `DEPLOY.md` - Deployment instructions
