# AC_social.md - Social Features Acceptance Criteria

## Follow System

### Scenario: Follow another user
**Given** I am viewing another user's profile
**When** I click the "Follow" button
**Then** I should see:
- Button changes to "Following"
- Their follower count increases by 1
- They appear in my "Following" list
- I receive their activity updates
**And** They should be notified of the new follower

### Scenario: Unfollow user
**Given** I am following a user
**When** I click "Following" and confirm unfollow
**Then** I should see:
- Button changes back to "Follow"
- Their follower count decreases by 1
- They are removed from my "Following" list
- I stop receiving their activity updates

### Scenario: Follow back
**Given** Someone follows me
**When** I visit their profile
**Then** I should see:
- "Follows you" indicator
- "Follow Back" button (instead of just "Follow")
**And** Following them should create mutual connection

### Scenario: Mutual following indicator
**Given** Two users follow each other
**When** Either views the other's profile
**Then** They should see:
- "You follow each other" indicator
- Enhanced interaction options (direct message, etc.)

### Scenario: Follow limits
**Given** I am a new user (< 7 days)
**When** I try to follow more than 50 users per day
**Then** I should see:
- Rate limit warning
- "Try again in X hours" message
- Recommendation to engage with existing follows first

### Scenario: Follow suggestions
**Given** I have few followers
**When** I view the Discover page
**Then** I should see:
- "People you may know" section
- Users with similar music taste
- Popular users in my genres
- Friends from connected social accounts

## Follower/Following Lists

### Scenario: View my followers
**Given** I click on my follower count
**When** The followers list loads
**Then** I should see:
- All users who follow me
- Their avatars and usernames
- Verification badges if applicable
- "Remove" option for each follower
- Search/filter functionality

### Scenario: View my following list
**Given** I click on my following count
**When** The following list loads
**Then** I should see:
- All users I follow
- Their avatars and usernames
- "Unfollow" button for each
- Most recent activity for each
- Sort options (recent, alphabetical, most active)

### Scenario: View someone else's followers
**Given** I view another user's follower list
**When** The list loads
**Then** I should see:
- Public followers only (if privacy allows)
- Mutual followers highlighted
- Follow buttons for non-followed users
- Limited to first 200 followers for privacy

### Scenario: Remove follower
**Given** Someone is following me
**When** I click "Remove" on their follower entry
**Then** They should:
- Stop following me automatically
- No longer see my private updates
- Receive no notification of removal
- Be able to follow me again if they choose

## Like System

### Scenario: Like a playlist
**Given** I am viewing a public playlist
**When** I click the heart/like button
**Then** I should see:
- Heart fills with color
- Like count increases by 1
- Playlist appears in my "Liked Playlists"
- Creator gets notified

### Scenario: Unlike a playlist
**Given** I have liked a playlist
**When** I click the filled heart
**Then** I should see:
- Heart returns to outline
- Like count decreases by 1
- Playlist removed from my "Liked Playlists"

### Scenario: Like a track/message
**Given** I see a track card in chat
**When** I double-tap or click the like button
**Then** I should see:
- Visual like animation
- Like count update
- Track added to my "Liked Tracks"
- Sharer gets positive feedback notification

### Scenario: View liked content
**Given** I go to my profile
**When** I click on "Liked" section
**Then** I should see tabs for:
- Liked Playlists
- Liked Tracks
- Liked Messages
**And** Each section should show:
- Recent likes first
- Original context (where I liked it)
- Option to remove likes

### Scenario: Like privacy
**Given** I like content
**When** Others view the content
**Then** My like should:
- Only show my username to mutual followers
- Show as anonymous count to others
- Respect my profile privacy settings
- Allow me to hide my likes entirely

## Activity Feed

### Scenario: Personal activity feed
**Given** I open the Activity/Feed page
**When** The feed loads
**Then** I should see:
- Recent activity from people I follow
- New playlists created
- Tracks added to followed playlists
- New badges earned
- Achievement announcements
**And** Activities should be ranked by:
- Relevance to my interests
- Recency
- Engagement level

### Scenario: Activity types
**Given** I am viewing my activity feed
**When** Different activities appear
**Then** I should see distinct cards for:
- "@user created playlist 'Summer Vibes'"
- "@user added 5 tracks to 'Road Trip Mix'"
- "@user earned the 'Tastemaker' badge"
- "@user reached #10 on Hip-Hop leaderboard"
- "@user started following you"

### Scenario: Activity interactions
**Given** I see activities in my feed
**When** I interact with them
**Then** I should be able to:
- Like the activity
- Comment on playlists/achievements
- Share to my own feed
- Follow the person if not already
- View the full content (playlist, profile, etc.)

### Scenario: Activity feed filtering
**Given** I want to customize my feed
**When** I access feed settings
**Then** I should be able to:
- Filter by activity type
- Mute certain users temporarily
- Prioritize close friends
- Hide certain types of activities

## Social Discovery

### Scenario: Discover people through music
**Given** I listen to a track in DJ Mode
**When** I see who else played this track
**Then** I should see:
- "Also played by" section
- User avatars and usernames
- Quick follow buttons
- Their other recently played tracks

### Scenario: Mutual connections
**Given** I am viewing a user's profile
**When** We have mutual followers
**Then** I should see:
- "Followed by @user1, @user2 and 5 others"
- Clickable links to mutual connections
- Indication of how we're connected

### Scenario: Genre-based discovery
**Given** I have genre preferences set
**When** I browse discovery
**Then** I should find:
- Top users in my preferred genres
- Rising stars in those genres
- Similar taste compatibility scores
- Recent genre-specific activity

## Privacy & Blocking

### Scenario: Block user
**Given** I want to block another user
**When** I select "Block" from their profile menu
**Then** They should:
- No longer be able to follow me
- Not see my profile or content
- Be removed from my followers
- Cannot message or mention me
**And** I should not see their content

### Scenario: Unblock user
**Given** I have blocked a user
**When** I unblock them from settings
**Then** They should:
- Regain normal access to my public content
- Be able to follow me again
- See my profile and playlists
**And** No automatic re-following occurs

### Scenario: Private social activity
**Given** I set my activity to private
**When** Others view social features
**Then** They should NOT see:
- My follower/following lists
- My recent activity
- What I've liked recently
- My playlist activity
**And** Only mutual followers see limited activity

### Scenario: Report user
**Given** I encounter inappropriate behavior
**When** I report a user
**Then** I should be able to:
- Select report reason (spam, harassment, etc.)
- Provide additional details
- Block user immediately
- Get confirmation of report submission
**And** Admins should be notified for review

## Notifications

### Scenario: New follower notification
**Given** Someone new follows me
**When** The follow occurs
**Then** I should receive:
- In-app notification
- Push notification (if enabled)
- Email notification (if configured)
**And** Notification should show:
- Follower's avatar and username
- Option to follow back
- View profile link

### Scenario: Like notifications
**Given** Someone likes my content
**When** The like occurs
**Then** I should be notified when:
- My playlist gets its first like
- My playlist reaches milestones (10, 50, 100 likes)
- Someone I follow likes my content
**And** Group similar notifications to avoid spam

### Scenario: Activity milestone notifications
**Given** I reach social milestones
**When** Milestones are achieved
**Then** I should be notified for:
- First 10 followers
- Every 100 followers after that
- First playlist with 50+ likes
- Making it to someone's top followers

## Mobile Social Features

### Scenario: Mobile follow interactions
**Given** I am using the mobile app
**When** I interact with social features
**Then** I should have:
- Swipe gestures for quick actions
- Long-press context menus
- Pull-to-refresh on feeds
- Haptic feedback for likes/follows

### Scenario: Mobile activity feed
**Given** I am viewing the activity feed on mobile
**When** I scroll through activities
**Then** The interface should:
- Use infinite scroll loading
- Show condensed activity cards
- Allow tap to expand details
- Support swipe for quick actions

## Performance & Scalability

### Scenario: Large following count
**Given** A user has 10,000+ followers
**When** Someone views their follower list
**Then** The system should:
- Load first 100 followers quickly
- Paginate remaining followers
- Provide search functionality
- Show total count accurately

### Scenario: High-activity user feed
**Given** I follow very active users
**When** My feed loads
**Then** It should:
- Load within 2 seconds
- Show most relevant activities first
- Cache recent feed data
- Handle real-time updates smoothly

## Integration with Other Features

### Scenario: Social leaderboards
**Given** I view a leaderboard
**When** I see user rankings
**Then** I should see:
- Follow buttons next to usernames
- Mutual follower indicators
- Quick profile access
- Social context for high rankers

### Scenario: Social playlist discovery
**Given** I browse playlists
**When** I see playlist listings
**Then** Playlists should be prioritized by:
- Created by people I follow
- Liked by people I follow
- Similar to my taste profile
- Popular in my social network

### Scenario: Chat social context
**Given** I am in a chat room
**When** I see messages from users
**Then** I should see:
- Follow status indicators
- Mutual follower count
- Quick follow actions
- Social reputation scores