# Authentication Feature - seda.fm

## Overview
User authentication and authorization system built with Supabase integration and JWT tokens.

## 🎯 Key Features
- Supabase Auth integration
- JWT token management
- Role-based access control (USER, ARTIST, ADMIN, SUPER_ADMIN)
- Email verification
- Password reset functionality

## 🏗️ Architecture

### Services
- **Supabase Integration**: User management and authentication
- **JWT Guards**: Route protection and token validation
- **User Service**: User profile management

### Database Models
- `User`: Core user data with Supabase integration
- `ArtistProfile`: Extended profile for verified artists

### Guards & Decorators
- `AuthGuard`: JWT token validation
- `AdminGuard`: Admin-only route protection

## 📚 Implementation Details
- Backend service: `src/config/supabase.service.ts`
- Guards: `src/common/guards/`
- User module: `src/modules/user/`

## 🔗 Related Features
- [User Management](../user-management/README.md)
- [Verification System](../verification/README.md)

---
*TODO: Complete implementation details when developing this feature*