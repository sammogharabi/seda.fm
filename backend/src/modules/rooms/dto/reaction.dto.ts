import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddReactionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(8)
  emoji: string;
}
