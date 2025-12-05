import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchType {
  ALL = 'all',
  USERS = 'users',
  TRACKS = 'tracks',
  ARTISTS = 'artists',
  CRATES = 'crates',
  ROOMS = 'rooms',
}

export class SearchDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  q: string;

  @ApiPropertyOptional({ enum: SearchType, default: SearchType.ALL })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
