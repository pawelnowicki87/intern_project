import { Injectable } from '@nestjs/common';
import { NotFoundError, InternalError } from '../common/errors/domain-errors';
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
      name: chat.name,
      participants: chat.participants?.map((participant) => ({
        userId: participant.user.id,
        username: participant.user.username,
        firstName: participant.user.firstName,
        lastName: participant.user.lastName,
        email: participant.user.email,
      })),
      messages: chat.messages?.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        body: message.body,
        createdAt: message.createdAt,
      })),
    };
  }

  async findAll(): Promise<ChatResponseDto[]> {
    const chats = await this.chatsRepo.findAll();
    return chats.map((chatItem) => this.toResponseDto(chatItem));
  }

  async findByUser(userId: number): Promise<ChatResponseDto[]> {
    const chats = await this.chatsRepo.findByUserWithUnread(userId);
    return chats.map((c) => ({
      ...this.toResponseDto(c),
      unread: (c as any).unreadCount,
    }));
  }

  async findOne(id: number): Promise<ChatResponseDto> {
    const chat = await this.chatsRepo.findById(id);
    if (!chat) throw new NotFoundError(`Chat ${id} not found`);
    return this.toResponseDto(chat);
  }

  async create(data: CreateChatDto): Promise<ChatResponseDto> {
    if (data.participantIds && data.participantIds.length === 2) {
      const existing = await this.chatsRepo.findDirectChatByParticipants(data.participantIds);
      if (existing) {
        return this.toResponseDto(existing);
      }
    }
    const created = await this.chatsRepo.create(data);

    if (!created) {
      throw new InternalError('Failed to create chat');
    }

    const chat = await this.chatsRepo.findById(created.id);
    if (!chat) {
      throw new NotFoundError('Chat not found after creation');
    }

    return this.toResponseDto(chat);
  }

  async update(id: number, data: { name?: string }): Promise<ChatResponseDto> {
    const updated = await this.chatsRepo.update(id, { name: data.name });
    if (!updated) throw new NotFoundError(`Chat ${id} not found`);
    const chat = await this.chatsRepo.findById(id);
    if (!chat) throw new NotFoundError(`Chat ${id} not found`);
    return this.toResponseDto(chat);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.chatsRepo.delete(id);

    if (!success) throw new NotFoundError(`Chat ${id} not found`);

    return { deleted: true };
  }
}
