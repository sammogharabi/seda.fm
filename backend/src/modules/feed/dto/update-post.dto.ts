import { IsString, IsOptional, IsArray, MaxLength, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TrackRefDto } from './create-post.dto';

export class UpdatePostDto {
  @ApiPropertyOptional({ description: 'Text content (max 5000 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Post content must not exceed 5000 characters' })
  content?: string;

  @ApiPropertyOptional({ description: 'Track reference for TRACK posts' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrackRefDto)
  trackRef?: TrackRefDto;

  @ApiPropertyOptional({ type: [String], description: 'Media URLs (max 10 URLs)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2000, { each: true, message: 'Each media URL must not exceed 2000 characters' })
  mediaUrls?: string[];
}
