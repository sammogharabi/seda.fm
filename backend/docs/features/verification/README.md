# Artist Verification Feature - seda.fm

## Overview
Artist verification system allowing musicians to verify their identity and gain verified status on the platform.

## 🎯 Key Features
- Claim code generation for verification requests
- URL submission for verification proof
- Automated crawling of verification URLs
- Admin review and approval workflow
- Artist profile management

## 🏗️ Architecture

### Services
- **VerificationService**: Core verification logic
- **CrawlerService**: Automated URL verification
- **AdminService**: Admin review and approval

### Database Models
- `VerificationRequest`: Verification submissions
- `ArtistProfile`: Extended artist information
- `AdminAction`: Audit log for admin actions
- `CrawlerCache`: Cached verification data

### Workflow
1. User submits verification request with claim code
2. System generates unique claim code
3. User adds claim code to their official profile/website
4. Automated crawler verifies claim code presence
5. Admin reviews and approves/denies request
6. Artist profile gets verified status

## 📚 Implementation Details
- Main service: `src/modules/verification/`
- Admin interface: `src/modules/admin/`
- Crawler service: `src/modules/crawler/`

## 🔗 Related Features
- [User Management](../user-management/README.md)
- [Authentication](../auth/README.md)

---
*This feature is currently implemented. See the full codebase for details.*