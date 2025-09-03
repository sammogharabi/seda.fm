import { IsString, IsOptional, IsUrl, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Unique username (3-32 chars, alphanumeric + underscore)',
    minLength: 3,
    maxLength: 32,
    example: 'dj_alex_2024',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9_]+$/i, { message: 'Username must be alphanumeric with underscores only' })
  username: string;

  @ApiProperty({
    description: 'Display name (1-80 chars)',
    maxLength: 80,
    example: 'Alex Rodriguez',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  display_name?: string;

  @ApiProperty({
    description: 'Profile bio (max 280 chars)',
    maxLength: 280,
    example: 'Electronic music producer from Miami. Lover of deep house and techno.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @ApiProperty({
    description: 'Avatar image URL',
    example: 'https://example.com/avatars/user123.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;
}