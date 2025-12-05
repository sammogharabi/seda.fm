import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class UpdateCustomizationDto {
  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  photos?: any[];

  @IsOptional()
  @IsArray()
  videos?: any[];

  @IsOptional()
  @IsArray()
  highlightedTracks?: any[];

  @IsOptional()
  @IsArray()
  highlightedMerch?: any[];

  @IsOptional()
  @IsArray()
  highlightedConcerts?: any[];

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;
}
