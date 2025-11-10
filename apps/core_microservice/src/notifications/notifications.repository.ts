import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  findAll(): Promise<Notification[]> {
    return this.repo.find({
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<NotificationResponseDto | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['sender', 'recipient'],
    });
  }

  async create(data: CreateNotificationDto): Promise<NotificationResponseDto | null> {
    try {
      const notification = this.repo.create(data);
      return await this.repo.save(notification);
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  async update(id: number, data: Partial<Notification>): Promise<NotificationResponseDto | null> {
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
