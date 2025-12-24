import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000, { message: 'Message content must not exceed 10000 characters' })
  content: string;
}

export class StartConversationDto {
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000, { message: 'Message content must not exceed 10000 characters' })
  content: string;
}
