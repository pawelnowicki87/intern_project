import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { INotificationSender } from './ports/notification-sender.port';
import { NotificationAction } from '../common/notifications/notification-action';

@Injectable()
export class NotificationsRmqAdapter implements INotificationSender {
  private readonly logger = new Logger(NotificationsRmqAdapter.name);

  private connection: any = null;
  private channel: any = null;


  private readonly queueName =
    process.env.NOTIFICATIONS_QUEUE || 'notifications';

  private readonly rabbitUrl =
    process.env.RABBITMQ_URL ||
    'amqp://innogram:innogram_password@rabbitmq:5672';

  private async getChannel() {
    if (this.channel) return this.channel;

    this.logger.log(
      `Connecting to RabbitMQ at ${this.rabbitUrl.replace(/:[^:@]+@/, ':***@')}`,
    );

    this.connection = await amqp.connect(this.rabbitUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(this.queueName, { durable: true });

    this.logger.log(`RabbitMQ channel ready (queue: ${this.queueName})`);

    return this.channel;
  }


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
      const channel = await this.getChannel();

      channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );

      this.logger.log(
        `Notification published to queue '${this.queueName}': ${action}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Failed to publish notification: ${err?.message || err}`,
        err?.stack,
      );
    }
  }
}
