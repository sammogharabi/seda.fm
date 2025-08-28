# 🧪 SEDA Platform - UAT Checklist

## Prerequisites
- [ ] NestJS backend deployed and accessible
- [ ] Supabase production instance configured
- [ ] Frontend application (if available) connected to backend

## 🔐 Authentication & User Management

### User Registration/Login
- [ ] User can register with email/password
- [ ] User receives verification email (if configured)
- [ ] User can login with valid credentials
- [ ] Invalid credentials show appropriate error
- [ ] JWT tokens are generated and stored correctly
- [ ] Protected routes require valid authentication

## 🎨 Artist Verification System

### Claim Code Flow
- [ ] Artist can request verification with claim code
- [ ] System validates claim code format (8 characters)
- [ ] Web crawler successfully fetches artist website
- [ ] Crawler finds matching claim code on website
- [ ] Verification status updates to "verified" when code found
- [ ] Verification status shows "pending" when code not found
- [ ] Rate limiting prevents spam (3 attempts per day)

### Admin Override
- [ ] Admin can view pending verifications
- [ ] Admin can manually approve verification
- [ ] Admin can deny verification with reason
- [ ] Admin endpoints require valid admin API key

## 💬 Chat System

### Room Management
- [ ] Users can create chat rooms
- [ ] Users can join existing rooms
- [ ] Room list displays correctly
- [ ] Room participants are tracked

### Messaging
- [ ] Users can send messages in real-time
- [ ] Messages appear for all room participants
- [ ] Message history loads correctly
- [ ] Timestamps display accurately
- [ ] User avatars/names show correctly

### Advanced Features
- [ ] Users can add reactions to messages
- [ ] @mentions trigger notifications
- [ ] Music links unfurl with preview
- [ ] Deleted messages are handled properly
- [ ] Edited messages show edit indicator

### Moderation
- [ ] Moderators can delete inappropriate messages
- [ ] Moderators can timeout users
- [ ] Moderators can ban users from rooms
- [ ] Banned users cannot send messages

## 🔍 Edge Functions

### Health Check
- [ ] https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/health returns 200
- [ ] Response shows `environment: "production"`
- [ ] Timestamp is current

### Feature Flags
- [ ] https://ifrbbfqabeeyxrrliank.supabase.co/functions/v1/flags returns flags
- [ ] Admin can update flags with API key
- [ ] Flags affect application behavior

### Metrics (Admin Only)
- [ ] Metrics endpoint requires admin secret
- [ ] Returns DAU/WAU/MAU statistics
- [ ] Data is accurate and current

## 🔒 Security Testing

### API Security
- [ ] CORS configured correctly
- [ ] Rate limiting works as expected
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] Authentication bypass attempts fail

### Data Validation
- [ ] Input validation on all endpoints
- [ ] File upload restrictions enforced
- [ ] Request size limits in place

## 📱 WebSocket Testing

### Connection Management
- [ ] WebSocket connects successfully
- [ ] Reconnection on disconnect
- [ ] Heartbeat/ping-pong maintains connection
- [ ] Multiple concurrent connections supported

### Events
- [ ] join_room event works
- [ ] leave_room event works  
- [ ] send_message broadcasts correctly
- [ ] typing indicators function
- [ ] Error events handled gracefully

## 🎯 Performance Testing

### Response Times
- [ ] API endpoints respond < 500ms
- [ ] WebSocket latency < 100ms
- [ ] Database queries optimized
- [ ] No N+1 query issues

### Load Testing
- [ ] System handles 100 concurrent users
- [ ] Chat rooms support 50 participants
- [ ] No memory leaks during extended use

## 📊 Monitoring & Logging

### Application Logs
- [ ] Errors are logged with stack traces
- [ ] Info logs capture key events
- [ ] No sensitive data in logs
- [ ] Log levels appropriate for production

### Analytics
- [ ] PostHog events firing correctly
- [ ] User actions tracked
- [ ] Performance metrics collected

## 🐛 Known Issues to Test

1. **Artist Verification**: Crawler timeout on slow websites
2. **Chat**: Message ordering during high load
3. **Auth**: Token refresh edge cases
4. **WebSocket**: Reconnection after long idle

## ✅ Sign-off

- [ ] All critical features functioning
- [ ] No blocking bugs identified
- [ ] Performance acceptable
- [ ] Security requirements met
- [ ] Ready for production launch

---

## Test Accounts

Create these test accounts for UAT:

1. **Regular User**: test.user@seda.fm
2. **Verified Artist**: test.artist@seda.fm  
3. **Admin User**: test.admin@seda.fm
4. **Moderator**: test.mod@seda.fm

## Test Data

- **Test Claim Code**: SEDA2024
- **Test Room Name**: "UAT Test Room"
- **Test Music Link**: https://open.spotify.com/track/[test]

---

**UAT Date**: ___________
**Tested By**: ___________
**Environment**: Production
**Version**: ___________