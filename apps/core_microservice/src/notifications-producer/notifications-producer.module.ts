import { Module, Global } from '@nestjs/common';
import { NOTIFICATIONS_SENDER } from './ports/tokens';
import { NotificationsRmqAdapter } from './notifications-rmq.adapter';

@Global()
@Module({
  providers: [
    {
      provide: NOTIFICATIONS_SENDER,
      useClass: NotificationsRmqAdapter,
    },
  ],
  exports: [NOTIFICATIONS_SENDER],
})
export class NotificationsProducerModule {}
