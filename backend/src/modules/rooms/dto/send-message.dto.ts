import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Room message must not exceed 5000 characters' })
  content: string;
}

export class SendProductMessageDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Product message caption must not exceed 500 characters' })
  caption?: string;
}
