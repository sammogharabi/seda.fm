import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubmitVerificationDto {
  @ApiProperty({
    description: 'The claim code received from verification request',
    example: 'SEDA-ABC12345',
  })
  @IsNotEmpty({ message: 'Claim code is required' })
  @IsString({ message: 'Claim code must be a string' })
  @MinLength(8, { message: 'Claim code is too short' })
  @MaxLength(50, { message: 'Claim code is too long' })
  @Matches(/^SEDA-[A-Z0-9-]+$/, {
    message: 'Invalid claim code format. Must start with SEDA- followed by letters and numbers',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  claimCode: string;

  @ApiProperty({
    description: 'URL where the claim code has been placed',
    example: 'https://artist.bandcamp.com',
  })
  @IsNotEmpty({ message: 'Target URL is required' })
  @IsUrl(
    {
      protocols: ['https'],
      require_protocol: true,
    },
    { message: 'Must be a valid HTTPS URL' },
  )
  @MaxLength(500, { message: 'URL is too long' })
  @Matches(/^https:\/\/([\w-]+\.)*[a-zA-Z0-9][\w-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}/, {
    message: 'URL must use HTTPS and contain a valid domain',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  targetUrl: string;
}
