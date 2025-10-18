import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @IsNotEmpty()
  recipientId: number;

  @IsInt()
  @IsNotEmpty()
  senderId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action: string;

  @IsInt()
  @IsNotEmpty()
  targetId: number;
}
