import { Injectable } from '@nestjs/common';
import { IMessageWebsocketReader } from 'src/websecket/ports/message-websocket.port';
import { MessageResponseDto } from '../dto/message-response.dto';
import { MessagesService } from '../messages.service';

@Injectable()
export class MessageWebsocketAdapter implements IMessageWebsocketReader {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  async saveMessageToDb(data: {
    chatId: number;
    senderId: number;
    receiverId?: number;
    body: string;
  }): Promise<MessageResponseDto> {
    return this.messagesService.create(data);
  }

  async editMessage(id: number, body: string): Promise<MessageResponseDto> {
    return this.messagesService.update(id, { body });
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await this.messagesService.remove(id);
    return result.deleted.affected ? result.deleted.affected > 0 : false;
  }
}
