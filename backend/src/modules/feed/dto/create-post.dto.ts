import { IsEnum, IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ enum: PostType, description: 'Type of post' })
  @IsEnum(PostType)
  type: PostType;

  @ApiPropertyOptional({ description: 'Text content for TEXT posts' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Track reference JSON for TRACK posts' })
  @IsOptional()
  trackRef?: any;

  @ApiPropertyOptional({ description: 'Crate ID for CRATE posts' })
  @IsOptional()
  @IsUUID()
  crateId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Media URLs for MEDIA posts' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
