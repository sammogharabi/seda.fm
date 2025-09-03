import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetPlaylistItemsDto {
  @ApiProperty({
    description: 'Number of items to return',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Cursor for pagination',
    example: 'eyJpZCI6InV1aWQiLCJzb3J0VmFsdWUiOiIyMDI0LTA5LTAzVDA5OjAwOjAwLjAwMFoifQ',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Field to sort by',
    enum: ['position', 'addedAt'],
    default: 'position',
    example: 'position',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['position', 'addedAt'])
  sortField?: string = 'position';

  @ApiProperty({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'asc',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'asc';
}
