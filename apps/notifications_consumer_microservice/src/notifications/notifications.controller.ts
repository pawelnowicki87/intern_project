import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { RpcExceptionsFilter } from '../common/filters/rpc-exception.filter';

@Controller()
@UseFilters(new RpcExceptionsFilter())
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('notification_created')
  async handleNotificationCreated(@Payload() data: CreateNotificationDto) {
    await this.notificationsService.create(data);
  }

  // HTTP endpoints are not accessible in pure microservice mode,
  // but keeping them if we switch to hybrid application in future.
  /*
  @Get()
  findAll(): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findByRecipient(Number(userId));
  }
  */
}
