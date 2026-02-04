import { Injectable, Logger } from '@nestjs/common';
import { INotificationSender } from './ports/notification-sender.port';
import { NotificationAction } from '@shared/notifications/notification-action';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, Options } from 'amqplib';

@Injectable()
export class NotificationsRmqAdapter implements INotificationSender {
  private readonly logger = new Logger(NotificationsRmqAdapter.name);
  private connection = amqp.connect([process.env.RABBITMQ_URL || 'amqp://localhost:5672']);
  private channelWrapper: ChannelWrapper;
  private readonly queueName = process.env.NOTIFICATIONS_QUEUE || 'notifications';

  constructor() {
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: Channel) => {
        return channel.assertQueue(this.queueName, { durable: true });
      },
    });
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
      const options: Options.Publish = { persistent: true };
      await this.channelWrapper.sendToQueue(this.queueName, payload, options);
    } catch (err: any) {
      this.logger.error(`Failed to send notification: ${err?.message || err}`);
      throw err;
    }
  }
}
