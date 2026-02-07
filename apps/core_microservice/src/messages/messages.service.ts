import { Inject, Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { Message } from './entities/message.entity';
import { NOTIFICATIONS_SENDER } from 'src/notifications-producer/ports/tokens';
import type { INotificationSender } from 'src/notifications-producer/ports/notification-sender.port';
import { NotFoundError, ForbiddenError } from '../common/errors/domain-errors';
import { NotificationAction } from '../common/notifications/notification-action';
import { ChatParticipantsRepository } from 'src/chat-participants/chat-participants.repository';


@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    private readonly chatParticipantsRepo: ChatParticipantsRepository,
    @Inject(NOTIFICATIONS_SENDER)
    private readonly notificationSender: INotificationSender,
  ) {}

  private async notifyMessageRecipients(message: Message): Promise<void> {
    const { senderId, receiverId, chatId, id } = message;

    if (receiverId && receiverId !== senderId) {
      await this.notificationSender.sendNotification(
        receiverId,
        senderId,
        NotificationAction.MESSAGE_RECEIVED,
        chatId ?? id,
      );
      return;
    }

    if (!chatId) return;
    const participants = await this.chatParticipantsRepo.findByChatId(chatId);
    const recipients = participants
      .map((p) => p.userId)
      .filter((userId) => userId !== senderId);

    await Promise.all(
      recipients.map((recipientId) =>
        this.notificationSender.sendNotification(
          recipientId,
          senderId,
          NotificationAction.MESSAGE_GROUP_RECEIVED,
          chatId,
        ),
      ),
    );
  }
  toResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      chatId: message.chatId,
      body: message.body,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: message.sender && {
        firstName: message.sender.firstName,
        lastName: message.sender.lastName,
        email: message.sender.email,
      },
      receiver: message.receiver && {
        firstName: message.receiver.firstName,
        lastName: message.receiver.lastName,
        email: message.receiver.email,
      },
      assets: message.assets?.map(a => ({
        id: a.fileId,
        url: a.file?.url ?? '',
      })) ?? [],
    };
  }

  async findAll() {
    return (await this.messagesRepo.findAll()).map(m => this.toResponseDto(m));
  }

  async findOne(id: number) {
    const msg = await this.messagesRepo.findById(id);
    if (!msg) throw new Error('Not found');
    return this.toResponseDto(msg);
  }

  async create(data: CreateMessageDto) {
    const created = await this.messagesRepo.create({ ...data, isRead: false });
    const msg = await this.messagesRepo.findById(created.id);
    await this.notifyMessageRecipients(msg);
    return this.toResponseDto(msg);
  }

  async update(id: number, data: UpdateMessageDto) {
    const updated = await this.messagesRepo.update(id, data);
    return this.toResponseDto(updated);
  }

  async remove(id: number) {
    return { deleted: await this.messagesRepo.delete(id) };
  }

  async countUnread(userId: number) {
    return this.messagesRepo.countUnread(userId);
  }
}

