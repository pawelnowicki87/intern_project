import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { Message } from './entities/message.entity';
import { NotFoundError, ForbiddenError } from '../common/errors/domain-errors';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepo: MessagesRepository) {}

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
      assets:
        message.assets?.map((a) => ({
          id: a.fileId,
          url: a.file?.url ?? '',
        })) ?? [],
    };
  }

  async findAll() {
    return (await this.messagesRepo.findAll()).map((m) =>
      this.toResponseDto(m),
    );
  }

  async findOne(id: number) {
    const msg = await this.messagesRepo.findById(id);
    if (!msg) throw new Error('Not found');
    return this.toResponseDto(msg);
  }

  async create(data: CreateMessageDto) {
    const created = await this.messagesRepo.create({ ...data, isRead: false });
    const msg = await this.messagesRepo.findById(created.id);

    if (msg) {
      // Notification logic removed as per user request (messages only in chat icon, not bell)
    }
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
