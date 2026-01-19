import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ReorderItem {
  @ApiProperty({
    description: 'Playlist item ID',
    example: 'clx1234567890',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'New position (0-based index)',
    minimum: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderPlaylistItemsDto {
  @ApiProperty({
    description: 'Array of items with their new positions',
    type: [ReorderItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
