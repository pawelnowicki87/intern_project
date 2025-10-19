import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatParticipantDto {
  @IsInt()
  @IsNotEmpty({ message: 'Chat ID is required.' })
  chatId: number;

  @IsInt()
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: number;
}
