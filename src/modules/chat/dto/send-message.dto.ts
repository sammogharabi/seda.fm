import { IsString, IsOptional, IsUUID, IsEnum, ValidateNested, IsUrl, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'TEXT',
  TRACK_CARD = 'TRACK_CARD',
  SYSTEM = 'SYSTEM',
  REPLY = 'REPLY',
}

export class TrackRefDto {
  @ApiProperty()
  @IsString()
  provider: string;

  @ApiProperty()
  @IsString()
  providerId: string;

  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  artist: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  artwork?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ enum: MessageType })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TrackRefDto)
  trackRef?: TrackRefDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}