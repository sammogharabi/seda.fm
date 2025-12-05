# AC_profiles (Given / When / Then)

## Create and view profile
- Given I am authenticated
- When I POST /profiles with {username}
- Then my profile is created and GET /profiles/:username returns my data

## Update profile
- Given I am the profile owner
- When I PATCH /profiles/:username with {display_name, bio}
- Then the fields are updated and timestamps reflect changes

## Username uniqueness
- Given a username is taken
- When another user tries to create with same username
- Then API returns 409 conflict (or 400 validation error)
