import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaylistDto {
  @ApiProperty({
    description: 'Playlist title',
    minLength: 1,
    maxLength: 140,
    example: 'My Deep House Favorites',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(140)
  title: string;

  @ApiProperty({
    description: 'Playlist description',
    maxLength: 500,
    example: 'A collection of the best deep house tracks from 2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Whether playlist is publicly visible',
    default: true,
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @ApiProperty({
    description: 'Whether others can add tracks to this playlist',
    default: false,
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean = false;
}
