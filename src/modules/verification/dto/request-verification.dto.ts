import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class RequestVerificationDto {
  @ApiProperty({
    description: 'Artist name to be verified',
    required: false,
  })
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiProperty({
    description: 'Artist website URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}