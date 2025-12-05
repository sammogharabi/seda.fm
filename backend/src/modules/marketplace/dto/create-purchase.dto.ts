import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  paymentIntentId?: string;
}
