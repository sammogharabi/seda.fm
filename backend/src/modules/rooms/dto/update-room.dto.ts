import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
