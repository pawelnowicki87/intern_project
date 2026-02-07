import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_SENDER } from './ports/tokens';
import { NotificationsRmqAdapter } from './notifications-rmq.adapter';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://innogram:innogram_password@localhost:5672',
          ],          queue: process.env.NOTIFICATIONS_QUEUE || 'notifications',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [
    {
      provide: NOTIFICATIONS_SENDER,
      useClass: NotificationsRmqAdapter,
    },
  ],
  exports: [NOTIFICATIONS_SENDER],
})
export class NotificationsProducerModule {}
