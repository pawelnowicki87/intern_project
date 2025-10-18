export class ChatParticipantResponseDto {
  chatId: number;
  userId: number;
  joinedAt: Date;

  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
}
