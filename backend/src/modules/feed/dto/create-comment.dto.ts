import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for threading' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
