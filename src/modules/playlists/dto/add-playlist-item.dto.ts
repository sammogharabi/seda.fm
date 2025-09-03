import { IsString, IsInt, IsOptional, IsUrl, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const SUPPORTED_PROVIDERS = [
  'spotify',
  'apple',
  'beatport', 
  'youtube',
  'deezer',
  'tidal',
  'bandcamp',
  'amazon',
  'pandora',
] as const;

export class AddPlaylistItemDto {
  @ApiProperty({
    description: 'Position in playlist (0-based index)',
    minimum: 0,
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({
    description: 'Music streaming provider',
    enum: SUPPORTED_PROVIDERS,
    example: 'spotify',
  })
  @IsString()
  @IsIn(SUPPORTED_PROVIDERS)
  provider: typeof SUPPORTED_PROVIDERS[number];

  @ApiProperty({
    description: 'Track ID from the provider',
    example: '4uLU6hMCjMI75M1A2tKUQC',
  })
  @IsString()
  provider_track_id: string;

  @ApiProperty({
    description: 'Track title (optional denormalization)',
    example: 'Blinding Lights',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Artist name (optional denormalization)',
    example: 'The Weeknd',
    required: false,
  })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty({
    description: 'Album artwork URL (optional denormalization)',
    example: 'https://i.scdn.co/image/ab67616d0000b273...',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  artwork_url?: string;
}