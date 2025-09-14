import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoomEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isPrivate: boolean;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  memberships?: RoomMembershipEntity[];

  @ApiPropertyOptional()
  memberCount?: number;
}

export class RoomMembershipEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isMod: boolean;

  @ApiProperty()
  joinedAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    artistProfile?: {
      artistName: string;
      verified: boolean;
    };
  };
}