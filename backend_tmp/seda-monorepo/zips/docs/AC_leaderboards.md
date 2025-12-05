# AC_leaderboards (Given / When / Then)

## Global leaderboard read
- Given snapshots exist for scope=global
- When I GET /leaderboards?scope=global
- Then I receive a list of entries sorted by rank with user handles and scores

## Genre leaderboard read
- Given snapshots exist for scope=genre:hiphop
- When I GET /leaderboards?scope=genre:hiphop
- Then I receive entries for that genre only
