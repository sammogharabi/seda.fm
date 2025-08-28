import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DenyVerificationDto {
  @ApiProperty({
    description: 'Reason for denying the verification',
    example: 'Could not find claim code on the provided URL',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, {
    message: 'Denial reason must be at least 10 characters long',
  })
  reason: string;
}