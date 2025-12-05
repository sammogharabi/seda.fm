import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class VoteDto {
  @ApiProperty({ enum: VoteType, description: 'Vote type' })
  @IsEnum(VoteType)
  voteType: VoteType;
}
