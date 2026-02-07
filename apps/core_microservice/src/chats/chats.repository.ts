import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsRepository {
  private readonly logger = new Logger(ChatsRepository.name);

  constructor(
    @InjectRepository(Chat)
    private readonly repo: Repository<Chat>,
  ) {}

  findAll(): Promise<Chat[]> {
    return this.repo.find({
      relations: ['participants', 'participants.user', 'messages'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Chat | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['participants', 'participants.user', 'messages'],
    });
  }

  async create(data: CreateChatDto): Promise<Chat | null> {
    try {
      const chat = this.repo.create({
        createdAt: new Date(),
        name: data.name ?? null,
        participants: data.participantIds?.map((userId) => ({
          user: { id: userId },
        })) || [],
      });
    
      const savedChat = await this.repo.save(chat);
      return savedChat;
    } catch (err) {
      this.logger.error(`Failed to create chat: ${err.message}`);
      return null;
    }
  }

  async update(id: number, data: Partial<Pick<Chat, 'name'>>): Promise<Chat | null> {
    try {
      const chat = await this.repo.findOne({ where: { id } });
      if (!chat) return null;
      if (data.name !== undefined) chat.name = data.name ?? null;
      const saved = await this.repo.save(chat);
      return saved;
    } catch (err) {
      this.logger.error(`Failed to update chat: ${err.message}`);
      return null;
    }
  }

  async findByUserWithUnread(userId: number): Promise<Chat[]> {
    return this.repo.createQueryBuilder('chat')
      .innerJoin('chat.participants', 'p', 'p.userId = :userId', { userId })
      .leftJoinAndSelect('chat.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('chat.messages', 'messages')
      .loadRelationCountAndMap('chat.unreadCount', 'chat.messages', 'message', (qb) => 
        qb.where('message.receiverId = :userId AND message.isRead = false', { userId })
      )
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  }

  async findDirectChatByParticipants(userIds: number[]): Promise<Chat | null> {
    try {
      const all = await this.findAll();
      const set = new Set(userIds);
      const found = all.find((c) => {
        const parts = c.participants ?? [];
        if (parts.length !== 2) return false;
        const ids = parts.map((p: any) => p.user?.id).filter(Boolean);
        return ids.length === 2 && ids.every((id) => set.has(id)) && set.size === 2;
      });
      return found ?? null;
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }
}
