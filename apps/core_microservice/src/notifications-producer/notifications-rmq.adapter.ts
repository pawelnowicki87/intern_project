import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { INotificationSender } from './ports/notification-sender.port';
import { NotificationAction } from '../common/notifications/notification-action';

@Injectable()
export class NotificationsRmqAdapter implements INotificationSender {
  private readonly logger = new Logger(NotificationsRmqAdapter.name);

  constructor(
    @Inject('NOTIFICATIONS_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendNotification(
    recipientId: number,
    senderId: number,
    action: NotificationAction,
    targetId: number,
  ): Promise<void> {
    const payload = {
      recipientId,
      senderId,
      action,
      targetId,
      createdAt: new Date().toISOString(),
    };

    try {
      this.client.emit('notification_created', payload);
    } catch (err: any) {
      this.logger.error(
        `Failed to send notification: ${err?.message || err}`,
        err?.stack,
      );
    }
  }
}
