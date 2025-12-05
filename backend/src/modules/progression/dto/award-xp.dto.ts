import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AwardXPDto {
  @ApiProperty({ description: 'Activity type that triggered XP award' })
  @IsString()
  activityType: string;

  @ApiProperty({ description: 'Amount of XP to award', minimum: 1 })
  @IsInt()
  @Min(1)
  xpAmount: number;
}
