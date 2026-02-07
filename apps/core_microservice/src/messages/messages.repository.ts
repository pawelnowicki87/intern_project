import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesRepository {
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
    const msg = this.repo.create(data);
    return this.repo.save(msg);
  }

  async update(id: number, data: Partial<Message>): Promise<Message | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async countUnread(userId: number): Promise<number> {
    return this.repo.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
