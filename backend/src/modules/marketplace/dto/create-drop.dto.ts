import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DropGatingType } from '@prisma/client';

export class DropItemDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  provider?: string = 'native';

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsNumber()
  @IsOptional()
  customPrice?: number;

  @IsString()
  @IsOptional()
  customTitle?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxQuantityPerUser?: number;
}

export class CreateDropDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  heroImage?: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsBoolean()
  @IsOptional()
  showCountdown?: boolean = true;

  @IsEnum(DropGatingType)
  @IsOptional()
  gatingType?: DropGatingType = DropGatingType.PUBLIC;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30) // Max 30 days early access
  earlyAccessDays?: number;

  @IsBoolean()
  @IsOptional()
  showOnArtistPage?: boolean = true;

  @IsBoolean()
  @IsOptional()
  showInRoomFeed?: boolean = false;

  @IsBoolean()
  @IsOptional()
  showInSessions?: boolean = false;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DropItemDto)
  @IsOptional()
  items?: DropItemDto[];
}
