# AC_social (Given / When / Then)

## Follow
- Given I am authenticated
- When I POST /social/follow with {target_user_id}
- Then I follow that user and see follow state reflected in UI

## Unfollow
- Given I am following a user
- When I DELETE /social/follow with {target_user_id}
- Then I no longer follow them

## Like / Unlike
- Given I am authenticated
- When I POST /social/like with {entity_type, entity_id}
- Then the like is recorded (idempotent)
- When I DELETE /social/like with {entity_type, entity_id}
- Then the like is removed
