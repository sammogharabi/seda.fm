# AC_playlists.md - Playlist Feature Acceptance Criteria

## Playlist Creation

### Scenario: Create new playlist
**Given** I am logged in
**When** I click "Create Playlist"
**Then** I should be prompted for:
- Playlist name (required, max 100 chars)
- Description (optional, max 500 chars)
- Privacy setting (Public/Private)
- Collaboration setting (Solo/Collaborative)
**And** The playlist should be created with me as owner
**And** I should be redirected to the playlist page

### Scenario: Playlist name validation
**Given** I am creating a playlist
**When** I enter a name
**Then** It should be validated for:
- Not empty
- Max 100 characters
- No profanity (basic filter)
- Trim whitespace
**And** I should see character count
**And** Submit should be disabled if invalid

### Scenario: Default privacy settings
**Given** I am a regular user creating a playlist
**When** I create a playlist
**Then** It should default to Public
**And** Collaboration should default to Off

**Given** I am a verified artist creating a playlist
**When** I create a playlist
**Then** It should default to Public
**And** Collaboration should be available as option

## Adding Tracks to Playlists

### Scenario: Add track from search
**Given** I am viewing a playlist I can edit
**When** I search for a track
**Then** I should see results from multiple providers
**And** Each result should show: title, artist, album, duration
**And** I should be able to click "Add to Playlist"
**And** The track should appear at the bottom of the playlist
**And** I should see confirmation toast

### Scenario: Add multiple tracks
**Given** I have selected multiple tracks from search
**When** I click "Add Selected to Playlist"
**Then** All tracks should be added to the playlist
**And** They should maintain their selection order
**And** Duplicates should be prevented with warning
**And** I should see count of successfully added tracks

### Scenario: Track already in playlist
**Given** I try to add a track that's already in the playlist
**When** I attempt to add it
**Then** I should see a warning: "Track already in playlist"
**And** The add button should show "Already Added"
**And** I should have option to "Add Anyway" (for mixtapes)

### Scenario: Provider integration
**Given** I am adding tracks to a playlist
**When** I search for music
**Then** Tracks should come from:
- Spotify (if connected)
- Apple Music (if connected)
- YouTube Music
- SoundCloud
**And** Each track should show its source
**And** Unavailable tracks should be grayed out

## Track Management

### Scenario: Reorder tracks
**Given** I am viewing my playlist
**When** I drag a track to a new position
**Then** The playlist should reorder
**And** Position numbers should update
**And** Changes should save automatically
**And** Other collaborators should see updates

### Scenario: Remove tracks
**Given** I am viewing a playlist I can edit
**When** I click the remove button on a track
**Then** I should see confirmation: "Remove [track] from [playlist]?"
**And** The track should be removed on confirm
**And** Positions should adjust automatically
**And** Action should be undoable for 10 seconds

### Scenario: Bulk track operations
**Given** I select multiple tracks in a playlist
**When** I have tracks selected
**Then** I should see bulk action options:
- Remove selected tracks
- Move to another playlist
- Download/Export (if available)
**And** Actions should work with confirmation

### Scenario: Track attribution
**Given** I view a collaborative playlist
**When** I see the track list
**Then** Each track should show:
- Who added it and when
- "Added by @username • 2 days ago"
- User avatar next to attribution

## Collaborative Playlists

### Scenario: Enable collaboration
**Given** I own a playlist
**When** I enable collaboration
**Then** I should see:
- "Invite Collaborators" button
- Link sharing option
- Permission settings (Add tracks only / Full edit)
**And** The playlist should show "Collaborative" badge

### Scenario: Invite collaborators
**Given** I have a collaborative playlist
**When** I click "Invite Collaborators"
**Then** I should be able to:
- Search for users by username
- Send direct invites via username
- Generate shareable invite link
- Set permissions level
**And** Invited users should get notifications

### Scenario: Accept collaboration invite
**Given** I received a playlist collaboration invite
**When** I click the invite link
**Then** I should see:
- Playlist preview
- Owner information
- Permission level
- "Join Playlist" button
**And** Joining should add me as collaborator

### Scenario: Collaborator permissions
**Given** I am a collaborator with "Add Only" permission
**When** I view the playlist
**Then** I should be able to:
- Add new tracks
- See full track list
- View other collaborators
**And** I should NOT be able to:
- Remove tracks I didn't add
- Reorder tracks
- Change playlist settings
- Remove other collaborators

### Scenario: Remove collaborator
**Given** I own a collaborative playlist
**When** I remove a collaborator
**Then** Their access should be revoked immediately
**And** Tracks they added should remain with attribution
**And** They should be notified of removal

## Playlist Browsing & Discovery

### Scenario: View public playlist
**Given** I click on a public playlist link
**When** The playlist loads
**Then** I should see:
- Playlist name and description
- Owner information with avatar
- Track count and total duration
- All tracks with play buttons
- Follow/Unfollow playlist button
- Share button
**And** If I'm logged in: "Add to My Playlists" button

### Scenario: Follow playlist
**Given** I am viewing someone else's public playlist
**When** I click "Follow"
**Then** The playlist should appear in my "Followed Playlists"
**And** I should get notifications for major updates
**And** I should see follower count increment
**And** Button should change to "Following"

### Scenario: Unfollow playlist
**Given** I am following a playlist
**When** I click "Following" and confirm unfollow
**Then** The playlist should be removed from my follows
**And** I should stop receiving notifications
**And** Follower count should decrement

### Scenario: Playlist search
**Given** I am on the Discover page
**When** I search for playlists
**Then** Results should show:
- Matching playlist names
- Creator usernames
- Track count and followers
- Public playlists only
**And** Results should be ranked by:
- Follower count
- Recent activity
- Relevance to query

## Privacy & Permissions

### Scenario: Private playlist
**Given** I set a playlist to private
**When** Others try to access it
**Then** They should see:
- "This playlist is private" message
- No track information
- Only basic playlist name
**And** Only collaborators should have access

### Scenario: Playlist privacy change
**Given** I have a public playlist with followers
**When** I change it to private
**Then** I should see warning: "X followers will lose access"
**And** Existing followers should be removed
**And** Playlist should disappear from public listings

### Scenario: Deleted playlist
**Given** A playlist I was following gets deleted
**When** I try to access it
**Then** I should see: "This playlist has been deleted"
**And** It should be removed from my followed playlists
**And** Any references should show "Deleted Playlist"

## Mobile Experience

### Scenario: Mobile playlist creation
**Given** I am on a mobile device
**When** I create a playlist
**Then** The interface should:
- Use touch-friendly form inputs
- Show mobile keyboard optimization
- Allow photo upload for cover
- Support voice-to-text for description

### Scenario: Mobile track management
**Given** I am managing a playlist on mobile
**When** I reorder tracks
**Then** I should be able to:
- Long-press and drag to reorder
- Use touch handles for dragging
- See visual feedback during drag
- Have tracks snap to positions

### Scenario: Mobile sharing
**Given** I want to share a playlist on mobile
**When** I click share
**Then** I should see native share options:
- Copy link
- Share to social apps
- Send via message
- QR code for easy sharing

## Performance & Loading

### Scenario: Large playlist loading
**Given** I have a playlist with 500+ tracks
**When** I open the playlist
**Then** It should:
- Load first 50 tracks immediately
- Show total track count
- Lazy load more tracks on scroll
- Maintain smooth scrolling
- Cache loaded segments

### Scenario: Offline playlist access
**Given** I previously viewed a playlist
**When** I lose internet connection
**Then** I should:
- See cached playlist metadata
- See "Offline" indicator
- Have limited functionality
- Get option to retry when online

## Error Handling

### Scenario: Track unavailable
**Given** A track in a playlist becomes unavailable
**When** I view the playlist
**Then** The track should:
- Show as grayed out
- Display "Unavailable" status
- Show original metadata
- Allow removal
- Suggest alternatives if possible

### Scenario: Playlist load failure
**Given** A playlist fails to load
**When** The error occurs
**Then** I should see:
- User-friendly error message
- Retry button
- Back navigation option
- Support contact info if persistent

### Scenario: Collaboration sync issues
**Given** Multiple users edit a playlist simultaneously
**When** Conflicts occur
**Then** The system should:
- Use last-write-wins for most operations
- Show conflict indicators
- Allow manual conflict resolution
- Maintain edit history/audit log

## Analytics & Metrics

### Scenario: Playlist analytics
**Given** I own a public playlist
**When** I view playlist insights
**Then** I should see:
- Total plays/listens
- Top tracks by plays
- Follower growth over time
- Geographic distribution
- Most active collaborators

### Scenario: Track performance
**Given** I added tracks to playlists
**When** I view my contributions
**Then** I should see:
- Which tracks I added where
- Play counts for my additions
- Most successful track picks
- Collaboration statistics

## Integration Points

### Scenario: Playlist in chat
**Given** I want to share a playlist in chat
**When** I post the playlist link
**Then** It should show:
- Rich preview with cover art
- Playlist name and track count
- Owner information
- Play button (if supported)
- Quick add to library option

### Scenario: DJ Mode integration
**Given** I am in DJ Mode with a playlist
**When** I queue tracks from the playlist
**Then** The system should:
- Show playlist context in queue
- Maintain track attribution
- Allow easy playlist navigation
- Update playlist play counts