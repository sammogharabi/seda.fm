import { IsEnum, IsString, IsOptional, IsUUID, IsArray, MaxLength, IsUrl, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { Type } from 'class-transformer';

// Define proper type for trackRef instead of any
export class TrackRefDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  artist?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @IsUrl({}, { message: 'coverUrl must be a valid URL' })
  coverUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  platform?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  externalUrl?: string;
}

export class CreatePostDto {
  @ApiProperty({ enum: PostType, description: 'Type of post' })
  @IsEnum(PostType)
  type: PostType;

  @ApiPropertyOptional({ description: 'Text content for TEXT posts (max 5000 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Post content must not exceed 5000 characters' })
  content?: string;

  @ApiPropertyOptional({ description: 'Track reference for TRACK posts' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrackRefDto)
  trackRef?: TrackRefDto;

  @ApiPropertyOptional({ description: 'Crate ID for CRATE posts' })
  @IsOptional()
  @IsUUID()
  crateId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Media URLs for MEDIA posts (max 10 URLs)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2000, { each: true, message: 'Each media URL must not exceed 2000 characters' })
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: 'Product ID for PRODUCT posts' })
  @IsOptional()
  @IsUUID()
  productId?: string;
}
