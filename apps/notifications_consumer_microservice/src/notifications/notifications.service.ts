import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async findAll(): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsRepo.findAll();
    return notifications.map((n) => ({
      id: n.id,
      recipientId: n.recipientId,
      senderId: n.senderId,
      action: n.action,
      targetId: n.targetId,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  async findOne(id: number): Promise<NotificationResponseDto> {
    const n = await this.notificationsRepo.findById(id);
    if (!n) throw new NotFoundException(`Notification ${id} not found`);
    return {
      id: n.id,
      recipientId: n.recipientId,
      senderId: n.senderId,
      action: n.action,
      targetId: n.targetId,
      isRead: n.isRead,
      createdAt: n.createdAt,
    };
  }

  async create(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    const created = await this.notificationsRepo.create(data);
    if (!created) throw new InternalServerErrorException('Notification creation failed');
    return this.findOne(created.id);
  }

  async update(id: number, data: UpdateNotificationDto): Promise<NotificationResponseDto> {
    const updated = await this.notificationsRepo.update(id, data);
    if (!updated) throw new NotFoundException(`Notification ${id} not found`);
    return this.findOne(updated.id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.notificationsRepo.delete(id);
    if (!success) throw new NotFoundException(`Notification ${id} not found`);
    return { deleted: true };
  }
}
