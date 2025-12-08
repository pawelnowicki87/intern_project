import { IMessageReadWebsocketReader } from "src/websecket/ports/message-read-websocket.port";
import { MessagesService } from "../messages.service";

export class MessageReadWebsocketAdapter implements IMessageReadWebsocketReader {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  async markMessageAsRead(messageId: number): Promise<void> {
    await this.messagesService.update(messageId, { isRead: true });
  }
}
