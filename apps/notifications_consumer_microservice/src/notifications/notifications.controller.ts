import { Controller, Get, Param, Put, Body, UseFilters } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
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

  @Get()
  findAll(): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: number,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findByRecipient(Number(userId));
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.update(Number(id), updateNotificationDto);
  }
}
