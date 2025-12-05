import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToQueueDto {
  @ApiProperty({ description: 'Track reference JSON metadata' })
  @IsObject()
  trackRef: any;
}
