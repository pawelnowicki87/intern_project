import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async findAll(): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepo.find({
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
    });

    return notifications.map(({ id, recipientId, senderId, action, targetId, isRead, createdAt, sender, recipient }) => ({
      id,
      recipientId,
      senderId,
      action,
      targetId,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      recipient: recipient
        ? {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          }
        : undefined,
    }));
  }

  async findOne(id: number): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['sender', 'recipient'],
    });

    if (!notification) throw new NotFoundException('Notification not found');

    const { recipientId, senderId, action, targetId, isRead, createdAt, sender, recipient } = notification;
    return {
      id,
      recipientId,
      senderId,
      action,
      targetId,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      recipient: recipient
        ? {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          }
        : undefined,
    };
  }

  async create(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = this.notificationRepo.create(data);
    const saved = await this.notificationRepo.save(notification);

    const full = await this.notificationRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'recipient'],
    });

    if (!full) throw new NotFoundException('Notification not found after creation');

    const { recipientId, senderId, action, targetId, isRead, createdAt, sender, recipient } = full;
    return {
      id: full.id,
      recipientId,
      senderId,
      action,
      targetId,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      recipient: recipient
        ? {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          }
        : undefined,
    };
  }

  async update(id: number, data: UpdateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    Object.assign(notification, data);
    await this.notificationRepo.save(notification);

    const updated = await this.notificationRepo.findOne({
      where: { id },
      relations: ['sender', 'recipient'],
    });

    if (!updated) throw new NotFoundException('Updated notification not found');

    const { recipientId, senderId, action, targetId, isRead, createdAt, sender, recipient } = updated;
    return {
      id: updated.id,
      recipientId,
      senderId,
      action,
      targetId,
      isRead,
      createdAt,
      sender: sender
        ? {
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
          }
        : undefined,
      recipient: recipient
        ? {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          }
        : undefined,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    await this.notificationRepo.remove(notification);
    return { message: `Notification ${id} removed successfully` };
  }
}
