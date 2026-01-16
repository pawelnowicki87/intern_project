import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findByRecipient(Number(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ deleted: boolean }> {
    return this.notificationsService.remove(id);
  }
}
