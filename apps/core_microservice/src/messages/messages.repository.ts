import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesRepository {
  private readonly logger = new Logger(MessagesRepository.name);

  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  findAll(): Promise<Message[]> {
    return this.repo.find({
      relations: ['sender', 'receiver', 'assets', 'assets.file'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Message | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'assets', 'assets.file'],
    });
  }

  async create(data: Partial<Message>): Promise<Message | null> {
    try {
      const msg = this.repo.create(data);
      return await this.repo.save(msg);
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  async update(id: number, data: Partial<Message>): Promise<Message | null> {
    try {
      await this.repo.update(id, data);
      return this.findById(id);
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (e) {
      this.logger.error(e.message);
      return false;
    }
  }
}
