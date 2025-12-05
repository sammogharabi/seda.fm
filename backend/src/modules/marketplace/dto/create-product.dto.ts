import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductType } from '@prisma/client';

export class CreateProductDto {
  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsOptional()
  trackRef?: any;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  externalUrl?: string;

  @IsString()
  @IsOptional()
  externalPlatform?: string;

  @IsOptional()
  packContents?: any;
}
