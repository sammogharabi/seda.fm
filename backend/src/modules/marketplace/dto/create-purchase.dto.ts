import { IsNumber, IsOptional, IsString, Min, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// Shipping address for physical product purchases
export class ShippingAddressDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(200)
  address1: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address2?: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  state: string;

  @IsString()
  @MaxLength(20)
  zip: string;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}

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

  // Shipping info for physical products (merch, concert tickets)
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  // Product variant selection (e.g., "Size: L, Color: Black")
  @IsString()
  @IsOptional()
  @MaxLength(200)
  productVariant?: string;

  // Special instructions from buyer
  @IsString()
  @IsOptional()
  @MaxLength(500)
  buyerNotes?: string;
}
