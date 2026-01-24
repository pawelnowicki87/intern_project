import { Injectable } from '@nestjs/common';
import { IMessageReadWebsocketReader } from 'src/websecket/ports/message-read-websocket.port';
import { MessagesService } from '../messages.service';

@Injectable()
export class MessageReadWebsocketAdapter implements IMessageReadWebsocketReader {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  async markMessageAsRead(messageId: number): Promise<void> {
    await this.messagesService.update(messageId, { isRead: true });
  }
}
