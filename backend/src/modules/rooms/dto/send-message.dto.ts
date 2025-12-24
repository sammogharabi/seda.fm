import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Room message must not exceed 5000 characters' })
  content: string;
}
