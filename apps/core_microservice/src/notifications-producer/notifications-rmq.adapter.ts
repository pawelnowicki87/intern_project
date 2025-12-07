import { Injectable, Logger } from '@nestjs/common';
import { INotificationSender } from './ports/notification-sender.port';
import { NotificationAction } from '@shared/notifications/notification-action';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class NotificationsRmqAdapter implements INotificationSender {
  private readonly logger = new Logger(NotificationsRmqAdapter.name);
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly queueName = process.env.NOTIFICATIONS_QUEUE || 'notifications';
  private readonly url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  constructor() {
    console.log("RMQ URL USED:", this.url);
  }

  private async ensureChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    try {
      if (!this.connection) {
        this.connection = await connect(this.url);
      }
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      return this.channel;
    } catch (err: any) {
      this.logger.error(`Failed to initialize RabbitMQ channel: ${err?.message || err}`);
      throw err;
    }
  }

  async sendNotification(
    recipientId: number,
    senderId: number,
    action: NotificationAction,
    targetId: number,
  ): Promise<void> {
    const channel = await this.ensureChannel();
    const payload = {
      recipientId,
      senderId,
      action,
      targetId,
      createdAt: new Date().toISOString(),
    };

    const buffer = Buffer.from(JSON.stringify(payload));
    channel.sendToQueue(this.queueName, buffer, { persistent: true });
  }
}
