import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../dto/send-message.dto';

export class MessageEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: MessageType })
  type: MessageType;

  @ApiPropertyOptional()
  text?: string;

  @ApiPropertyOptional()
  trackRef?: {
    provider: string;
    providerId: string;
    url: string;
    title: string;
    artist: string;
    artwork?: string;
    duration?: number;
  };

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    artistProfile?: {
      artistName: string;
      verified: boolean;
    };
  };

  @ApiPropertyOptional()
  reactions?: ReactionEntity[];

  @ApiPropertyOptional()
  replies?: MessageEntity[];

  @ApiPropertyOptional()
  parent?: MessageEntity;
}

export class ReactionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  messageId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  emoji: string;

  @ApiProperty()
  createdAt: Date;

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