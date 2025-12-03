import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NOTIFICATIONS_SENDER } from 'src/follows/ports/tokens';
import { NotificationsSenderAdapter } from './adapters/notifications-sender.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    {
      provide: NOTIFICATIONS_SENDER,
      useClass: NotificationsSenderAdapter,
    }
  ],
  exports: [
    NotificationsService,
    NotificationsRepository,
    NOTIFICATIONS_SENDER,
  ],
})
export class NotificationsModule {}
