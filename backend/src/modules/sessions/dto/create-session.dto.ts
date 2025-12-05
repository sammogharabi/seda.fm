import { IsUUID, IsOptional, IsString, IsBoolean, MinLength, IsArray, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'Room ID to link the session to an existing room (optional)', required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ description: 'Session name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  sessionName?: string;

  @ApiProperty({ description: 'Whether the session should be private', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiProperty({ description: 'Initial track to play (JSON)', required: false })
  @IsOptional()
  initialTrack?: any;

  @ApiProperty({ description: 'Music genre for the session', required: true })
  @IsString()
  genre: string;

  @ApiProperty({ description: 'Tags to describe the session vibe (max 5)', required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags?: string[];
}
