import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
