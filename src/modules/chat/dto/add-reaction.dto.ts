import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddReactionDto {
  @ApiProperty()
  @IsString()
  emoji: string;
}