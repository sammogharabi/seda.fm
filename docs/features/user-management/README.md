# User Management Feature - seda.fm

## Overview
User profile management system with artist profiles, preferences, and social features.

## 🎯 Key Features
- User registration and profile creation
- Artist profile management
- User preferences and settings
- Social connections and following
- Activity tracking and analytics

## 🏗️ Architecture

### Services
- **UserService**: Core user management
- **ProfileService**: Artist profile handling
- **PreferencesService**: User settings management

### Database Models
- `User`: Core user account data
- `ArtistProfile`: Extended artist information
- `UserPreferences`: Settings and preferences
- `UserFollowing`: Social connections

### API Endpoints
- User profile CRUD operations
- Artist profile management
- Social following features
- Preference updates

## 📚 Implementation Details
- Main service: `src/modules/user/`
- Database schema: `prisma/schema.prisma`
- Guards and permissions: role-based access

## 🔗 Related Features
- [Authentication](../auth/README.md)
- [Artist Verification](../verification/README.md)
- [Chat System](../chat/README.md)

---
*This feature is partially implemented. See the existing user module for current functionality.*