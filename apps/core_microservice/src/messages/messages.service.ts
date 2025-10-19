import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async findAll(): Promise<MessageResponseDto[]> {
    const messages = await this.messageRepo.find({
      relations: ['sender', 'receiver', 'assets'],
      order: { createdAt: 'DESC' },
    });

    return messages.map(({ id, senderId, receiverId, title, body, isRead, createdAt, sender, receiver, assets }) => ({
      id,
      senderId,
      receiverId,
      title,
      body,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      receiver: receiver
        ? {
            firstName: receiver.firstName,
            lastName: receiver.lastName,
            email: receiver.email,
          }
        : undefined,
      assets: assets
        ? assets.map((a) => ({
            id: a.fileId,
            url: a.file?.url ?? '',
          }))
        : [],
    }));
  }

  async findOne(id: number): Promise<MessageResponseDto> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'assets', 'assets.file'],
    });

    if (!message) throw new NotFoundException('Message not found');

    const { senderId, receiverId, title, body, isRead, createdAt, sender, receiver, assets } = message;

    return {
      id,
      senderId,
      receiverId,
      title,
      body,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      receiver: receiver
        ? {
            firstName: receiver.firstName,
            lastName: receiver.lastName,
            email: receiver.email,
          }
        : undefined,
      assets: assets
        ? assets.map((a) => ({
            id: a.fileId,
            url: a.file?.url ?? '',
          }))
        : [],
    };
  }

  async create(data: CreateMessageDto): Promise<MessageResponseDto> {
    const message = this.messageRepo.create(data);
    const saved = await this.messageRepo.save(message);

    const full = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'receiver', 'assets', 'assets.file'],
    });

    if (!full) throw new NotFoundException('Message not found after creation');

    const { id, senderId, receiverId, title, body, isRead, createdAt, sender, receiver, assets } = full;

    return {
      id,
      senderId,
      receiverId,
      title,
      body,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      receiver: receiver
        ? {
            firstName: receiver.firstName,
            lastName: receiver.lastName,
            email: receiver.email,
          }
        : undefined,
      assets: assets
        ? assets.map((a) => ({
            id: a.fileId,
            url: a.file?.url ?? '',
          }))
        : [],
    };
  }

  async update(id: number, data: UpdateMessageDto): Promise<MessageResponseDto> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');

    Object.assign(message, data);
    await this.messageRepo.save(message);

    const updated = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'assets', 'assets.file'],
    });

    if (!updated) throw new NotFoundException('Updated message not found');

    const { senderId, receiverId, title, body, isRead, createdAt, sender, receiver, assets } = updated;

    return {
      id: updated.id,
      senderId,
      receiverId,
      title,
      body,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      receiver: receiver
        ? {
            firstName: receiver.firstName,
            lastName: receiver.lastName,
            email: receiver.email,
          }
        : undefined,
      assets: assets
        ? assets.map((a) => ({
            id: a.fileId,
            url: a.file?.url ?? '',
          }))
        : [],
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');

    await this.messageRepo.remove(message);
    return { message: `Message ${id} removed successfully` };
  }
}
