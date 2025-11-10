import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatsRepository } from './chats.repository';
import { ChatResponseDto } from './dto/chat-response.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepo: ChatsRepository) {}

  private toResponseDto(chat: any): ChatResponseDto {
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

  async findAll(): Promise<ChatResponseDto[]> {
    const chats = await this.chatsRepo.findAll();
    return chats.map((c) => this.toResponseDto(c));
  }

  async findOne(id: number): Promise<ChatResponseDto> {
    const chat = await this.chatsRepo.findById(id);
    if (!chat) throw new NotFoundException(`Chat ${id} not found`);
    return this.toResponseDto(chat);
  }

  async create(data: CreateChatDto): Promise<ChatResponseDto> {
    const created = await this.chatsRepo.create(data);

    if (!created) {
      throw new InternalServerErrorException('Failed to create chat');
    }

    const chat = await this.chatsRepo.findById(created.id);
    if (!chat) {
      throw new NotFoundException('Chat not found after creation');
    }

    return this.toResponseDto(chat);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.chatsRepo.delete(id);

    if (!success) throw new NotFoundException(`Chat ${id} not found`);

    return { deleted: true };
  }
}
