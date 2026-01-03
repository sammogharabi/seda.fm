import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  trackingCarrier?: string;
}
