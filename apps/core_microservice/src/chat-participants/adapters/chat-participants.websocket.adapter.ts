import { IChatParticipantsWebsocketReader } from 'src/websecket/ports/chat-participant-websocket.port';
import { ChatParticipantsService } from '../chat-participants.service';

export class ChatParticipantsWebsocketAdapter implements IChatParticipantsWebsocketReader {
  constructor(
        private readonly chatParticipantsService: ChatParticipantsService,
  ) {}

  isUserInChat(chatId: number, userId: number): Promise<boolean> {
    return this.chatParticipantsService.isUserInChat(chatId, userId);
  }

}