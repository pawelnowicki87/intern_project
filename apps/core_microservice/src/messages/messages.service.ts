import { Injectable, Logger } from '@nestjs/common';
import { NotFoundError, InternalError } from '@shared/errors/domain-errors';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly messagesRepo: MessagesRepository) {}

  public toResponseDto(message): MessageResponseDto {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      chatId: message.chatId,
      body: message.body,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: message.sender
        ? {
            firstName: message.sender.firstName,
            lastName: message.sender.lastName,
            email: message.sender.email,
          }
        : undefined,
      receiver: message.receiver
        ? {
            firstName: message.receiver.firstName,
            lastName: message.receiver.lastName,
            email: message.receiver.email,
          }
        : undefined,
      assets: message.assets
        ? message.assets.map((asset) => ({
            id: asset.fileId,
            url: asset.file?.url ?? '',
          }))
        : [],
    };
  }

  async findAll(): Promise<MessageResponseDto[]> {
    const messages = await this.messagesRepo.findAll();
    return messages.map((message) => this.toResponseDto(message));
  }

  async findOne(id: number): Promise<MessageResponseDto> {
    const message = await this.messagesRepo.findById(id);
    if (!message) throw new NotFoundError(`Message ${id} not found`);
    return this.toResponseDto(message);
  }

  async create(data: CreateMessageDto): Promise<MessageResponseDto> {
    const created = await this.messagesRepo.create(data);
    if (!created) throw new InternalError('Failed to create message');

    const message = await this.messagesRepo.findById(created.id);
    if (!message) throw new NotFoundError(`Message not found after creation`);

    return this.toResponseDto(message);
  }

  async update(id: number, data: UpdateMessageDto): Promise<MessageResponseDto> {
    const updated = await this.messagesRepo.update(id, data);
    if (!updated) throw new NotFoundError(`Message ${id} not found`);

    return this.toResponseDto(updated);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.messagesRepo.delete(id);
    if (!success) throw new NotFoundError(`Message ${id} not found`);

    return { deleted: true };
  }
}
