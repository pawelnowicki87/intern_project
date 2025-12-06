import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';

@Injectable()
export class NotificationsRmqListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationsRmqListener.name);
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly queueName = process.env.NOTIFICATIONS_QUEUE || 'notifications';
  private readonly url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  constructor(private readonly notificationsService: NotificationsService) {}

  async onModuleInit() {
    await this.init();
  }

  private async init() {
    try {
      this.connection = await connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.consume(this.queueName, (msg) => this.handle(msg), {
        noAck: false,
      });
      this.logger.log(`Listening for notifications on queue: ${this.queueName}`);
    } catch (err: any) {
      this.logger.error(`Failed to start RabbitMQ listener: ${err?.message || err}`);
    }
  }

  private async handle(msg: ConsumeMessage | null) {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await this.notificationsService.create({
        recipientId: payload.recipientId,
        senderId: payload.senderId,
        action: payload.action,
        targetId: payload.targetId,
      });
      this.channel?.ack(msg);
    } catch (err: any) {
      this.logger.error(`Failed to process notification message: ${err?.message || err}`);
      this.channel?.nack(msg, false, false);
    }
  }
}
