import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ModerationAction {
  DELETE_MESSAGE = 'DELETE_MESSAGE',
  MUTE_USER = 'MUTE_USER',
  CLEAR_REACTIONS = 'CLEAR_REACTIONS',
}

export class ModerateUserDto {
  @ApiProperty()
  @IsUUID()
  targetId: string;

  @ApiProperty({ enum: ModerationAction })
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}