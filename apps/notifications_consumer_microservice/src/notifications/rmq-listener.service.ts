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

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.init();
  }

  private async init() {
    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.url.replace(/:[^:@]+@/, ':***@')}...`);
      this.connection = await connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      this.logger.log(`Successfully connected to RabbitMQ. Waiting for messages in '${this.queueName}'...`);
      
      await this.channel.consume(this.queueName, (msg) => this.handle(msg), {
        noAck: false,
      });
    } catch (err: any) {
      this.logger.error(`Failed to start RabbitMQ listener: ${err?.message || err}`);
    }
  }

  private async handle(msg: ConsumeMessage | null) {
    if (!msg) return;
    try {
      const content = msg.content.toString();
      this.logger.debug(`Received message: ${content}`);
      let payload = JSON.parse(content);

      // Handle NestJS Microservice message format
      if (payload && payload.data) {
        payload = payload.data;
      }
      
      this.logger.log(`Processing notification: ${payload.action} from ${payload.senderId} to ${payload.recipientId}`);

      const result = await this.notificationsService.create({
        recipientId: payload.recipientId,
        senderId: payload.senderId,
        action: payload.action,
        targetId: payload.targetId,
      });
      
      this.logger.log(`Notification created: ${result.id} for user ${payload.recipientId}`);
      this.channel?.ack(msg);
    } catch (err: any) {
      this.logger.error(`Failed to process notification message: ${err?.message || err}`);
      this.channel?.nack(msg, false, false);
    }
  }
}
