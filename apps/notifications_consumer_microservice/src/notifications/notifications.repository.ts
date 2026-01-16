import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  findAll(): Promise<Notification[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: number): Promise<Notification | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByRecipientId(recipientId: number): Promise<Notification[]> {
    return this.repo.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: CreateNotificationDto): Promise<Notification | null> {
    try {
      const notification = this.repo.create(data);
      return await this.repo.save(notification);
    } catch (e: any) {
      this.logger.error(e?.message ?? String(e));
      return null;
    }
  }

  async update(id: number, data: Partial<Notification>): Promise<Notification | null> {
    try {
      await this.repo.update(id, data);
      return this.findById(id);
    } catch (e: any) {
      this.logger.error(e?.message ?? String(e));
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (e: any) {
      this.logger.error(e?.message ?? String(e));
      return false;
    }
  }
}
