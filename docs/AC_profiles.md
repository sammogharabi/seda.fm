# AC_profiles.md - Profile Feature Acceptance Criteria

## User Profile Creation

### Scenario: New user creates profile
**Given** I am a new authenticated user without a profile
**When** I visit my profile page for the first time
**Then** I should see a profile creation prompt
**And** I should be assigned a default username based on my email
**And** I should be able to customize my username (if available)
**And** I should be able to add a bio (max 500 characters)
**And** I should be able to upload an avatar image

### Scenario: Username validation
**Given** I am creating or editing my profile
**When** I enter a username
**Then** It should be validated for:
- Length: 3-30 characters
- Characters: alphanumeric, underscores, hyphens only
- No spaces or special characters
- Case-insensitive uniqueness
- No profanity (basic filter)
**And** I should see real-time availability feedback
**And** Reserved usernames should be blocked (admin, support, etc.)

### Scenario: Avatar upload
**Given** I am editing my profile
**When** I upload an avatar image
**Then** The image should be:
- Validated for type (jpg, png, webp)
- Size limited to 5MB
- Auto-resized to 400x400px
- Cropped to square if needed
**And** I should see a preview before saving
**And** The old avatar should be replaced

## Profile Viewing

### Scenario: View own profile
**Given** I am logged in
**When** I visit my profile page
**Then** I should see:
- My avatar, username, and display name
- My bio
- My DJ Points score
- My follower/following counts
- My public playlists
- My trophy case preview (top 3 badges)
- Edit profile button
- Settings button

### Scenario: View another user's profile
**Given** I am viewing another user's profile
**When** The profile loads
**Then** I should see:
- Their public information (avatar, username, bio)
- Their DJ Points and stats
- Their public playlists
- Their trophy case
- Follow/Unfollow button
- Share profile button
**And** I should NOT see:
- Edit options
- Private playlists
- Settings

### Scenario: View artist profile
**Given** I am viewing a verified artist's profile
**When** The profile loads
**Then** I should see:
- Verified badge next to username
- Artist-specific sections:
  - Discography
  - Tour dates (if available)
  - Merch link
  - Top fans leaderboard
- All standard profile features

## Profile Editing

### Scenario: Edit basic information
**Given** I am on my profile page
**When** I click "Edit Profile"
**Then** I should be able to modify:
- Display name (different from username)
- Bio (with character counter)
- Avatar image
- Cover image
- Social links (Twitter, Instagram, etc.)
**And** Changes should be saved on submit
**And** I should see a success confirmation

### Scenario: Username change
**Given** I want to change my username
**When** I edit my profile
**Then** I should:
- See a warning about URL changes
- Be limited to 1 username change per 30 days
- Have the old username reserved for 30 days
- See redirects from old profile URL

## Privacy & Permissions

### Scenario: Private profile
**Given** I have set my profile to private
**When** A non-follower visits my profile
**Then** They should see:
- Limited information (username, avatar)
- "This profile is private" message
- Follow request button
**And** They should NOT see:
- Bio, playlists, stats
- Trophy case
- Activity

### Scenario: Block user
**Given** I have blocked another user
**When** They try to view my profile
**Then** They should see a "User not found" error
**And** They cannot:
- Follow me
- See my content
- Send me messages

## Artist Verification Integration

### Scenario: Display verification status
**Given** I have completed artist verification
**When** My profile is viewed
**Then** Users should see:
- Blue verified checkmark
- "Verified Artist" badge
- Artist-specific profile sections enabled
- Enhanced profile customization options

### Scenario: Pending verification
**Given** I have submitted artist verification
**When** I view my own profile
**Then** I should see:
- "Verification Pending" badge
- Link to verification status
- Estimated review time
**And** Others should not see verification badges yet

## Performance & Errors

### Scenario: Profile load performance
**Given** I navigate to any profile
**When** The page loads
**Then** The profile should:
- Load within 2 seconds on 3G
- Show skeleton loading states
- Load images progressively
- Cache recently viewed profiles

### Scenario: Profile not found
**Given** I visit a non-existent profile URL
**When** The page loads
**Then** I should see:
- 404 error page
- "Profile not found" message
- Search suggestion
- Link back to discover page

### Scenario: Network error handling
**Given** I lose internet connection
**When** Editing my profile
**Then** I should:
- See an offline indicator
- Have changes saved locally
- Get retry option when connection returns
- Not lose any entered data

## Mobile Responsiveness

### Scenario: Mobile profile view
**Given** I am on a mobile device
**When** I view a profile
**Then** The layout should:
- Stack vertically appropriately
- Show avatar prominently
- Have touch-friendly buttons
- Support swipe between tabs
- Lazy load playlist items

### Scenario: Mobile profile editing
**Given** I am editing my profile on mobile
**When** I upload an avatar
**Then** I should be able to:
- Take a photo directly
- Choose from gallery
- Crop using touch gestures
- See mobile-optimized preview

## Analytics & Metrics

### Scenario: Profile view tracking
**Given** A user views a profile
**When** The page loads
**Then** We should track:
- Profile view event
- Viewer ID (if authenticated)
- View source (search, link, etc.)
- Time spent on profile
- Actions taken (follow, playlist view)

### Scenario: Profile completion
**Given** A user has a profile
**When** We calculate completion
**Then** We should track:
- Has avatar: 25%
- Has bio: 25%
- Has playlists: 25%
- Has social links: 25%
**And** Show completion prompt if < 100%

## Integration Points

### Scenario: Profile in chat
**Given** I see a message from a user
**When** I click their avatar/username
**Then** I should:
- See a mini profile preview
- Be able to view full profile
- Quick follow/unfollow option
- See mutual connections

### Scenario: Profile in leaderboards
**Given** I view a leaderboard
**When** I see user entries
**Then** Each entry should:
- Link to user profile
- Show avatar and username
- Show verified badge if applicable
- Load profile on click

## Edge Cases

### Scenario: Deleted user profile
**Given** A user account is deleted
**When** Someone visits their old profile URL
**Then** They should see:
- "This account no longer exists"
- No cached content
- Playlists show "Deleted User" as creator

### Scenario: Suspended user profile
**Given** A user account is suspended
**When** Someone visits their profile
**Then** They should see:
- "This account is suspended"
- No interactive features
- Report cleared after suspension lifts

### Scenario: Username squatting
**Given** Someone registers a celebrity/brand username
**When** Reported for impersonation
**Then** Admins should be able to:
- Review the profile
- Force username change
- Reserve username for legitimate owner
- Apply verification where appropriate