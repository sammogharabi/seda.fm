# Feedback System - Quick Start Guide for Claude Code

## What Was Just Built

A complete feedback submission system that:
1. Collects user feedback through a form in the sidebar
2. Sends feedback via email to sam@seda.fm using Resend
3. Includes user information, rating, and detailed comments
4. Works with the underground music collective aesthetic

## Files Modified/Created

### Frontend
- **Created**: `/components/Feedback.tsx` - Main feedback component
- **Modified**: `/components/Sidebar.tsx` - Added Feedback navigation link

### Backend
- **Modified**: `/supabase/functions/server/index.tsx` - Added `/make-server-2cdc6b38/feedback` endpoint

### Documentation
- **Created**: `/FEATURE-FEEDBACK.md` - Complete feature documentation
- **Modified**: `/HANDOFF-SUMMARY.md` - Updated with feedback system info

## How It Works

### User Flow
1. User clicks "Feedback" in sidebar (between Merch Store and Sign Out)
2. Selects user type: Artist or Fan
3. Rates experience 1-10 using star icons
4. Writes detailed feedback in textarea
5. Clicks "Submit Feedback"
6. Backend sends email to sam@seda.fm
7. User sees success toast
8. Form resets

### Technical Flow
```
Frontend (Feedback.tsx)
    ↓ POST request
Backend (/make-server-2cdc6b38/feedback)
    ↓ Validates data
    ↓ Calls Resend API
Resend
    ↓ Sends email
sam@seda.fm inbox
```

## Environment Variables

### Already Configured ✅
- `RESEND_API_KEY` - You already provided this
- `SUPABASE_URL` - Auto-configured
- `SUPABASE_ANON_KEY` - Auto-configured
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured

No additional setup needed!

## Testing the Feature

### Manual Test
1. Open the app
2. Click "Feedback" in sidebar
3. Select "Artist" or "Fan"
4. Click a rating (1-10 stars)
5. Type feedback in textarea
6. Click "Submit Feedback"
7. Check sam@seda.fm for email
8. Verify success toast appears
9. Verify form resets

### Expected Email Content
- Subject: "New Feedback from artist - Rating: 8/10" (example)
- Contains: Username, User ID, User Type, Rating, Comment, Timestamp
- Styled with dark theme matching sedā.fm aesthetic

## Code Locations

### Frontend Component
```
/components/Feedback.tsx
```

Key functions:
- `handleSubmit()` - Validates and submits feedback
- Form state management with React hooks

### Backend Endpoint
```
/supabase/functions/server/index.tsx
```

Endpoint: `POST /make-server-2cdc6b38/feedback`

Key features:
- Validates request data
- Sends HTML email via Resend
- Error handling with detailed logging

### API Integration
```typescript
// Frontend call
fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2cdc6b38/feedback`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    userType: 'artist' | 'fan',
    rating: 1-10,
    comment: 'feedback text',
    username: 'username or "Anonymous"',
    userId: 'user_id or null'
  })
});
```

## Styling & Design

### Colors Used
- Background: `#0a0a0a`
- Text: `#fafafa`
- Primary button: `#ff6b6b` (coral)
- Borders: `#333`
- Selected state: Coral accent

### Component Layout
- User type selection buttons at top
- Star rating row (10 clickable stars)
- Textarea for detailed feedback
- Submit button at bottom
- All responsive for mobile

### Email Template
- Dark-themed HTML email
- Professional layout
- Matches sedā.fm underground aesthetic
- Mobile-responsive

## Error Handling

### Frontend Validation
- ❌ No user type → "Please select your user type"
- ❌ No rating → "Please select a rating"
- ❌ Empty comment → "Please provide your feedback"
- ❌ API error → "Failed to submit feedback"

### Backend Validation
- Returns 400 if missing required fields
- Returns 500 if RESEND_API_KEY missing
- Returns 500 if Resend API fails
- All errors logged to console

## Debugging

### Check Frontend
```javascript
// Browser console will show:
console.log('Feedback submitted successfully:', data);
// OR
console.error('Error submitting feedback:', error);
```

### Check Backend
```javascript
// Server logs will show:
console.log('Feedback email sent successfully:', emailData);
// OR
console.error('Resend API error while sending feedback email:', errorData);
```

### Common Issues

**Issue**: Email not arriving
- Check RESEND_API_KEY is set
- Check Resend account is active
- Check sam@seda.fm inbox and spam folder
- Check backend logs for Resend API errors

**Issue**: Validation errors
- Check all form fields are filled
- Check user type is selected
- Check rating is selected (1-10)
- Check comment has text

**Issue**: Submit button not working
- Check isSubmitting state
- Check handleSubmit function is called
- Check browser console for errors

## Next Steps / Enhancements

### Potential Improvements
1. Store feedback in database (KV store)
2. Add feedback history view for admins
3. Add feedback categories (Bug, Feature, etc.)
4. Add screenshot attachment capability
5. Add Slack/Discord webhook integration
6. Add sentiment analysis
7. Create admin dashboard to view feedback

### Database Storage (If Needed)
```typescript
// Store in KV store with:
await kv.set(`feedback:${Date.now()}:${userId}`, {
  userType,
  rating,
  comment,
  username,
  userId,
  timestamp: new Date().toISOString()
});

// Retrieve with:
await kv.getByPrefix('feedback:');
```

## Integration with Rest of App

### Sidebar Integration
The Feedback link is added to Sidebar.tsx:
- Positioned between Merch Store and Sign Out
- Uses MessageSquare icon
- Highlights when active
- Same styling as other nav items

### User Context
- Receives user object as prop
- Uses username for email
- Uses userId for tracking
- Falls back to "Anonymous" if no user

### Toast Notifications
- Uses Sonner toast library
- Success: "Feedback submitted!"
- Error: "Failed to submit feedback"
- Validation errors for missing fields

## API Details

### Request Format
```json
POST /make-server-2cdc6b38/feedback
Content-Type: application/json
Authorization: Bearer {publicAnonKey}

{
  "userType": "artist",
  "rating": 8,
  "comment": "Love the new features!",
  "username": "artistName",
  "userId": "user-123"
}
```

### Success Response
```json
{
  "success": true,
  "message": "Feedback sent successfully"
}
```

### Error Response
```json
{
  "error": "Missing required fields",
  "details": "..."
}
```

## Resend Configuration

### Required Setup (Already Done ✅)
1. Resend account created
2. API key generated
3. API key stored in RESEND_API_KEY
4. From address: feedback@seda.fm

### Email Settings
- From: `sedā.fm <feedback@seda.fm>`
- To: `sam@seda.fm`
- Format: HTML email with inline CSS
- Mobile responsive design

## Security Notes

### Environment Variables
- ✅ RESEND_API_KEY never exposed to frontend
- ✅ Service role key only used in backend
- ✅ Public anon key safe for frontend

### Data Handling
- Username and userId included in email
- No sensitive data stored locally
- All API calls over HTTPS

## Production Checklist

### Before Deploy
- [x] RESEND_API_KEY configured
- [x] Backend endpoint tested
- [x] Frontend form tested
- [x] Email delivery tested
- [x] Error handling tested
- [x] Mobile responsive verified
- [x] Toast notifications working

### Monitoring
- Monitor Resend dashboard for delivery rates
- Check backend logs for errors
- Monitor sam@seda.fm inbox for feedback
- Track user engagement with feedback feature

## Contact for Issues

If you encounter any issues:
1. Check `/FEATURE-FEEDBACK.md` for detailed documentation
2. Check browser console for frontend errors
3. Check server logs for backend errors
4. Check Resend dashboard for email delivery status
5. Verify all environment variables are set

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run build && echo "Build successful!"
```

## Summary

✅ **Feedback system is complete and working**
✅ **All environment variables configured**
✅ **Email integration tested**
✅ **Documentation complete**
✅ **Ready for production**

The feedback system is fully functional and integrated into sedā.fm. Users can submit feedback, which is automatically sent to sam@seda.fm via Resend. No additional setup required!
