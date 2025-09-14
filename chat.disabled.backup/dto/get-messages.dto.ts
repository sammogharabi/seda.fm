import { IsOptional, IsInt, Min, Max, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum PaginationDirection {
  BEFORE = 'before',
  AFTER = 'after',
}

export class GetMessagesDto {
  @ApiPropertyOptional({ 
    default: 50, 
    minimum: 1, 
    maximum: 100,
    description: 'Number of messages to retrieve' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ 
    description: 'Cursor for pagination (ISO date string or message ID)' 
  })
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ 
    description: 'Direction to paginate from cursor',
    enum: PaginationDirection,
    default: PaginationDirection.BEFORE
  })
  @IsOptional()
  @IsEnum(PaginationDirection)
  direction?: PaginationDirection = PaginationDirection.BEFORE;

  @ApiPropertyOptional({ 
    description: 'Filter by parent message for threaded conversations' 
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}