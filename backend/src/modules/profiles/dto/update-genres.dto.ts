import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGenresDto {
  @ApiProperty({
    description: 'User selected music genres (1-10 genres)',
    type: [String],
    example: ['Electronic', 'Hip-Hop', 'Jazz', 'Rock'],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one genre must be selected' })
  @ArrayMaxSize(10, { message: 'Maximum 10 genres allowed' })
  @IsString({ each: true, message: 'Each genre must be a string' })
  genres: string[];
}
