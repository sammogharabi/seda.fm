# Email Verification with SendGrid - Setup Guide

## Overview

The email verification system has been implemented to send confirmation emails to new users after signup. When users click the verification link, they'll be directed to either the artist or fan experience based on their account type.

## Backend Implementation

### ✅ Completed

1. **SendGrid Integration**
   - Installed `@sendgrid/mail` package
   - Created [SendGridService](backend/src/config/sendgrid.service.ts) for sending emails
   - Professional HTML email template with brand colors

2. **Database Schema**
   - Added email verification fields to User model:
     - `emailVerified`: Boolean flag (default: false)
     - `emailVerificationToken`: Unique verification token
     - `emailVerificationTokenExpiresAt`: 24-hour expiry
     - `userType`: 'fan' or 'artist'
   - Migration applied: `20251111174533_add_email_verification`

3. **Auth Module**
   - Created [AuthModule](backend/src/modules/auth/auth.module.ts)
   - Created [AuthService](backend/src/modules/auth/auth.service.ts) with:
     - `sendVerificationEmail(userId, userType)` - Sends verification email
     - `verifyEmail(token)` - Verifies email and returns user info
     - `resendVerificationEmail(userId)` - Resends verification email

4. **API Endpoints**
   - `POST /api/v1/auth/send-verification-email` - Send verification email (authenticated)
   - `GET /api/v1/auth/verify-email?token={token}` - Verify email (public)
   - `POST /api/v1/auth/resend-verification-email` - Resend email (authenticated)

## SendGrid Configuration

### Step 1: Get SendGrid API Key

1. Sign up for SendGrid at https://signup.sendgrid.com/
2. Complete email verification and account setup
3. Navigate to **Settings** → **API Keys**
4. Click **Create API Key**
5. Give it a name like "Sedā Email Verification"
6. Select **Full Access** or **Restricted Access** with "Mail Send" permission
7. Copy the API key (you'll only see it once!)

### Step 2: Update Environment Variables

Edit `backend/.env.development`:

```env
# SendGrid Email Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx  # Replace with your actual API key
SENDGRID_FROM_EMAIL=noreply@seda.fm # Must be verified in SendGrid
APP_URL=http://localhost:3000        # Frontend URL for verification links
```

### Step 3: Verify Sender Email (Important!)

SendGrid requires you to verify the sender email address:

1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification**
3. Fill in the form with your email (e.g., noreply@seda.fm or your personal email for testing)
4. Click the verification link sent to your email
5. Update `SENDGRID_FROM_EMAIL` in `.env.development` to match

**For Production**: Set up **Domain Authentication** instead for better deliverability.

## Frontend Implementation

### Step 1: Create Email Verification Page

Create `frontend-v2/src/pages/VerifyEmailPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [userType, setUserType] = useState<'fan' | 'artist'>('fan');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type') as 'fan' | 'artist' || 'fan';

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'}/auth/verify-email?token=${token}`
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setUserType(data.userType || type);
          setMessage('Your email has been verified successfully!');

          // Redirect after 3 seconds
          setTimeout(() => {
            if (data.userType === 'artist') {
              navigate('/artist/dashboard');
            } else {
              navigate('/dashboard');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-accent-coral" />
                <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                <p className="text-muted-foreground mb-4">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your {userType === 'artist' ? 'artist' : 'fan'} dashboard...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-muted-foreground mb-4">{message}</p>
                <Button onClick={() => navigate('/login')}>
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 2: Add Route

In your router configuration (e.g., `App.tsx` or routing file):

```typescript
import { VerifyEmailPage } from './pages/VerifyEmailPage';

// Add route
<Route path="/verify-email" element={<VerifyEmailPage />} />
```

### Step 3: Update Signup Flow

After successful signup, call the send verification email endpoint:

```typescript
// In your signup handler
const handleSignup = async (formData) => {
  try {
    // 1. Create user with Supabase
    const { data: authData, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) throw error;

    // 2. Send verification email via your backend
    const token = authData.session?.access_token;
    await fetch(`${API_BASE_URL}/auth/send-verification-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userType: formData.userType, // 'fan' or 'artist'
      }),
    });

    // 3. Show success message
    toast.success('Please check your email to verify your account!');

  } catch (error) {
    console.error('Signup error:', error);
    toast.error('Signup failed. Please try again.');
  }
};
```

## Email Template

The verification email includes:
- **Branded design** with Sedā.fm logo and colors
- **User type badge** (Fan or Artist) with appropriate color
- **Clear CTA button** to verify email
- **24-hour expiration notice**
- **Professional footer** with brand messaging

Preview:
- **Fan emails**: Blue accent color (#4ECDC4)
- **Artist emails**: Coral accent color (#FF6B6B)

## Testing

### Local Testing (without SendGrid)

1. Check backend logs - the service will log a warning if SendGrid API key is missing
2. Verification tokens will still be generated in the database
3. Manually test verification by copying the token from database and calling the verify endpoint

### With SendGrid

1. Complete SendGrid setup above
2. Restart backend: `npm run start:dev`
3. Sign up a new user
4. Check your email inbox
5. Click the verification link
6. Should redirect to appropriate dashboard based on user type

## Database Queries (for debugging)

```sql
-- Check user's email verification status
SELECT id, email, "emailVerified", "userType", "emailVerificationTokenExpiresAt"
FROM users
WHERE email = 'test@example.com';

-- Manually verify a user (for testing)
UPDATE users
SET "emailVerified" = true,
    "emailVerificationToken" = NULL,
    "emailVerificationTokenExpiresAt" = NULL
WHERE email = 'test@example.com';

-- View all unverified users
SELECT email, "createdAt", "userType"
FROM users
WHERE "emailVerified" = false
ORDER BY "createdAt" DESC;
```

## API Endpoints Reference

### Send Verification Email
```http
POST /api/v1/auth/send-verification-email
Authorization: Bearer {supabase_token}
Content-Type: application/json

{
  "userType": "fan" | "artist"
}
```

### Verify Email
```http
GET /api/v1/auth/verify-email?token={verification_token}
# Public endpoint - no auth required

Response:
{
  "message": "Email verified successfully",
  "userType": "fan",
  "userId": "user-uuid"
}
```

### Resend Verification Email
```http
POST /api/v1/auth/resend-verification-email
Authorization: Bearer {supabase_token}

Response:
{
  "message": "Verification email resent successfully"
}
```

## Security Notes

1. **Tokens expire after 24 hours** - users must verify within this timeframe
2. **Tokens are unique and single-use** - cannot be reused after verification
3. **Verification endpoint is public** - but tokens are cryptographically secure (32 random bytes)
4. **SendGrid API key should never be exposed** - keep it in `.env` files only
5. **Production**: Use environment-specific `.env.production` file

## Troubleshooting

### Emails not sending
- Check SendGrid API key is correct
- Verify sender email in SendGrid dashboard
- Check backend logs for SendGrid errors
- Ensure SendGrid account is not suspended

### Verification link not working
- Check token hasn't expired (24 hours)
- Verify frontend route is set up correctly
- Check CORS settings if calling from different domain

### User can't find email
- Check spam/junk folder
- Verify SendGrid sender authentication
- Consider using a different sender email for testing

## Next Steps

1. **Get SendGrid API key** and update `.env.development`
2. **Verify sender email** in SendGrid dashboard
3. **Test signup flow** with a real email address
4. **Create frontend verification page** using the code above
5. **Add route** for `/verify-email` in your router
6. **Update signup handler** to call send verification endpoint

## Production Checklist

Before going live:
- [ ] Set up SendGrid Domain Authentication
- [ ] Use production SendGrid API key
- [ ] Update `APP_URL` to production frontend URL
- [ ] Test email deliverability
- [ ] Monitor SendGrid dashboard for bounces/spam reports
- [ ] Set up email monitoring/alerts
- [ ] Consider adding rate limiting to prevent abuse

---

**Last Updated:** 2025-11-11
**Status:** Backend Complete - Frontend Implementation Needed
