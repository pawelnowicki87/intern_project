import { Injectable } from '@nestjs/common';
import { NotFoundError, InternalError } from '@shared/errors/domain-errors';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async findAll(): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsRepo.findAll();
    return notifications.map((notification) => ({
      id: notification.id,
      recipientId: notification.recipientId,
      senderId: notification.senderId,
      action: notification.action,
      targetId: notification.targetId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    }));
  }

  async findOne(id: number): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepo.findById(id);
    if (!notification) throw new NotFoundError(`Notification ${id} not found`);
    return {
      id: notification.id,
      recipientId: notification.recipientId,
      senderId: notification.senderId,
      action: notification.action,
      targetId: notification.targetId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  async create(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    const created = await this.notificationsRepo.create(data);
    if (!created) throw new InternalError('Notification creation failed');
    return this.findOne(created.id);
  }

  async update(id: number, data: UpdateNotificationDto): Promise<NotificationResponseDto> {
    const updated = await this.notificationsRepo.update(id, data);
    if (!updated) throw new NotFoundError(`Notification ${id} not found`);
    return this.findOne(updated.id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.notificationsRepo.delete(id);
    if (!success) throw new NotFoundError(`Notification ${id} not found`);
    return { deleted: true };
  }
}
