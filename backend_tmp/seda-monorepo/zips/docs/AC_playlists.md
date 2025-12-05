# AC_playlists (Given / When / Then)

## Create playlist
- Given I am authenticated
- When I POST /playlists with {title, is_public}
- Then a playlist is created with owner_user_id = me

## Add item
- Given I am owner/collaborator
- When I POST /playlists/:id/items with {provider, provider_track_id}
- Then item appears with a position after the last item

## Visibility
- Given a playlist is public
- When an unauthenticated user GETs it
- Then they can read it
- And if playlist is private, only owner/collaborators can read it
