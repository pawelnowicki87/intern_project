import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
  ) {}

  async findAll(): Promise<ChatResponseDto[]> {
    const chats = await this.chatRepo.find({
      relations: ['participants', 'participants.user', 'messages'],
      order: { createdAt: 'DESC' },
    });

    return chats.map((chat) => ({
      id: chat.id,
      createdAt: chat.createdAt,
      participants: chat.participants?.map((p) => ({
        userId: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email,
      })),
      messages: chat.messages?.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    }));
  }

  async findOne(id: number): Promise<ChatResponseDto> {
    const chat = await this.chatRepo.findOne({
      where: { id },
      relations: ['participants', 'participants.user', 'messages'],
    });

    if (!chat) throw new NotFoundException('Chat not found');

    return {
      id: chat.id,
      createdAt: chat.createdAt,
      participants: chat.participants?.map((p) => ({
        userId: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email,
      })),
      messages: chat.messages?.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    };
  }

  async create(data: CreateChatDto): Promise<ChatResponseDto> {
    const chat = this.chatRepo.create();
    const saved = await this.chatRepo.save(chat);

    return {
      id: saved.id,
      createdAt: saved.createdAt,
      participants: [],
      messages: [],
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const chat = await this.chatRepo.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Chat not found');

    await this.chatRepo.remove(chat);
    return { message: `Chat ${id} removed successfully.` };
  }
}
