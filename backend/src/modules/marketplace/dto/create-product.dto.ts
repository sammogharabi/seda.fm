import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
  IsUrl,
  IsObject,
} from 'class-validator';
import { ProductType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product type', enum: ProductType })
  @IsEnum(ProductType, { message: 'Invalid product type' })
  type: ProductType;

  @ApiProperty({ description: 'Product title (max 200 chars)', example: 'My Track' })
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({ description: 'Product description (max 5000 chars)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @ApiProperty({ description: 'Price in dollars (0-10000)', example: 9.99 })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @Max(10000, { message: 'Price cannot exceed $10,000' })
  price: number;

  @ApiProperty({ description: 'Cover image URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2048, { message: 'Cover image URL must not exceed 2048 characters' })
  coverImage?: string;

  @ApiProperty({ description: 'Track reference object', required: false })
  @IsOptional()
  @IsObject({ message: 'Track reference must be an object' })
  trackRef?: Prisma.InputJsonValue;

  @ApiProperty({ description: 'File download URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2048, { message: 'File URL must not exceed 2048 characters' })
  fileUrl?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10737418240, { message: 'File size cannot exceed 10GB' })
  fileSize?: number;

  @ApiProperty({ description: 'External platform URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'External URL must be a valid URL' })
  @MaxLength(2048)
  externalUrl?: string;

  @ApiProperty({ description: 'External platform name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Platform name must not exceed 100 characters' })
  externalPlatform?: string;

  @ApiProperty({ description: 'Pack contents for bundle products', required: false })
  @IsOptional()
  @IsObject({ message: 'Pack contents must be an object' })
  packContents?: Prisma.InputJsonValue;
}
