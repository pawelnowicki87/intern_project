import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @IsNotEmpty({ message: 'Sender ID is required.' })
  senderId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Receiver ID is required.' })
  receiverId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Title can have up to 100 characters.' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Message body cannot be empty.' })
  body?: string;
}
