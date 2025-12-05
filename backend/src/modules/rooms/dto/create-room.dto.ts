import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

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
