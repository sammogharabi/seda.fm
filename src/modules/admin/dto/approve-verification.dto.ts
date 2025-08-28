import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveVerificationDto {
  @ApiProperty({
    description: 'Optional notes about the approval',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}