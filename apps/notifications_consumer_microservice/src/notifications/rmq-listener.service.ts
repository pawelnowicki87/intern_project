import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import * as amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class NotificationsRmqListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationsRmqListener.name);
  private connection: any = null;
  private channel: any = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly queueName =
    process.env.NOTIFICATIONS_QUEUE || 'notifications';
  private readonly url =
    process.env.RABBITMQ_URL ||
    'amqp://innogram:innogram_password@rabbitmq:5672';
  private readonly reconnectDelayMs = 5000;
  constructor(private readonly notificationsService: NotificationsService) {}

  async onModuleInit() {
    this.scheduleReconnect(this.reconnectDelayMs);
  }

  private scheduleReconnect(delayMs = this.reconnectDelayMs) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.init();
    }, delayMs);
  }

  private async init() {
    try {
      this.logger.log(
        `Connecting to RabbitMQ at ${this.url.replace(/:[^:@]+@/, ':***@')}...`,
      );
      this.connection = await amqp.connect(this.url);
      if (!this.connection) {
        throw new Error('Failed to connect to RabbitMQ');
      }

      this.channel = await this.connection.createChannel();
      if (!this.channel) {
        throw new Error('Failed to create channel');
      }

      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.prefetch(1);

      this.logger.log(
        `Successfully connected to RabbitMQ. Waiting for messages in '${this.queueName}'...`,
      );

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Reconnecting...');
        this.connection = null;
        this.channel = null;
        this.scheduleReconnect();
      });

      this.connection.on('error', (error: Error) => {
        this.logger.error(`RabbitMQ connection error: ${error.message}`);
      });

      await this.channel.consume(this.queueName, (msg) => this.handle(msg), {
        noAck: false,
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to start RabbitMQ listener: ${err?.message || err}`,
      );
      this.connection = null;
      this.channel = null;
      this.scheduleReconnect();
    }
  }

  private async handle(msg: ConsumeMessage | null) {
    if (!msg) return;
    try {
      const content = msg.content.toString();
      this.logger.log(`Received raw message: ${content}`);
      let payload = JSON.parse(content);

      // Handle NestJS Microservice message format
      if (payload && payload.data) {
        payload = payload.data;
      }

      this.logger.log(
        `Processing notification: ${payload.action} from ${payload.senderId} to ${payload.recipientId}`,
      );

      const result = await this.notificationsService.create({
        recipientId: payload.recipientId,
        senderId: payload.senderId,
        action: payload.action,
        targetId: payload.targetId,
      });

      this.logger.log(
        `Notification created: ${result.id} for user ${payload.recipientId}`,
      );
      this.channel?.ack(msg);
    } catch (err: any) {
      this.logger.error(
        `Failed to process notification message: ${err?.message || err}`,
      );
      this.channel?.nack(msg, false, false);
    }
  }
}
