import { IsString, IsOptional, IsNumber, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum MusicProvider {
  SPOTIFY = 'spotify',
  APPLE = 'apple',
  BEATPORT = 'beatport',
  SOUNDCLOUD = 'soundcloud',
  YOUTUBE = 'youtube',
}

export class SendTrackCardDto {
  @ApiProperty({ description: 'Track ID from the music provider' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Track title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Artist name' })
  @IsString()
  artist: string;

  @ApiProperty({ description: 'Album name', required: false })
  @IsOptional()
  @IsString()
  album?: string;

  @ApiProperty({ description: 'Track artwork URL', required: false })
  @IsOptional()
  @IsUrl()
  artworkUrl?: string;

  @ApiProperty({ 
    description: 'Music provider',
    enum: MusicProvider,
    example: MusicProvider.SPOTIFY 
  })
  @IsEnum(MusicProvider)
  provider: MusicProvider;

  @ApiProperty({ description: 'Provider-specific URI (e.g., spotify:track:...)', required: false })
  @IsOptional()
  @IsString()
  uri?: string;

  @ApiProperty({ description: 'Track duration in seconds', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Preview URL for 30-second clip', required: false })
  @IsOptional()
  @IsUrl()
  previewUrl?: string;
}