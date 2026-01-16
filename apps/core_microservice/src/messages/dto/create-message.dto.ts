import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
    senderId: number;

  @IsOptional()
  @IsInt()
    receiverId?: number;

  @IsOptional()
  @IsInt()
    chatId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
    body?: string;
}
