import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatParticipant } from './entities/chat-participant.entity';

@Injectable()
export class ChatParticipantsRepository {
  private readonly logger = new Logger(ChatParticipantsRepository.name);

  constructor(
    @InjectRepository(ChatParticipant)
    private readonly repo: Repository<ChatParticipant>,
  ) {}

  findAll(): Promise<ChatParticipant[]> {
    return this.repo.find({
      relations: ['chat', 'user'],
      order: { joinedAt: 'DESC' },
    });
  }

  findOne(chatId: number, userId: number): Promise<ChatParticipant | null> {
    return this.repo.findOne({
      where: { chatId, userId },
      relations: ['chat', 'user'],
    });
  }

  async create(data: Partial<ChatParticipant>): Promise<ChatParticipant | null> {
    try {
      const participant = this.repo.create(data);
      return await this.repo.save(participant);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(chatId: number, userId: number): Promise<boolean> {
    try {
      const result = await this.repo.delete({ chatId, userId });
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }

  findByChatId(chatId: number): Promise<ChatParticipant[]> {
    return this.repo.find({
      where: { chatId },
      relations: ['chat', 'user'],
    });
  }
}
