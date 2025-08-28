import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';

export class SubmitVerificationDto {
  @ApiProperty({
    description: 'The claim code received from verification request',
    example: 'SEDA-ABC12345',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^SEDA-[A-Z0-9]+$/, {
    message: 'Invalid claim code format',
  })
  claimCode: string;

  @ApiProperty({
    description: 'URL where the claim code has been placed',
    example: 'https://artist.bandcamp.com',
  })
  @IsNotEmpty()
  @IsUrl()
  targetUrl: string;
}