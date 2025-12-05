import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class DenyVerificationDto {
  @ApiProperty({
    description: 'Reason for denying the verification',
    example: 'Could not find claim code on the provided URL',
    minLength: 10,
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Denial reason is required' })
  @IsString({ message: 'Reason must be a string' })
  @MinLength(10, {
    message: 'Denial reason must be at least 10 characters long',
  })
  @MaxLength(500, {
    message: 'Denial reason cannot exceed 500 characters',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  reason: string;
}
