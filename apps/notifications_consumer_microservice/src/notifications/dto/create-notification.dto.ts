import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NotificationAction } from '../../common/notifications/notification-action';

export class CreateNotificationDto {
  @IsInt()
  @IsNotEmpty()
    recipientId: number;

  @IsInt()
  @IsNotEmpty()
    senderId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
    action: NotificationAction;

  @IsInt()
  @IsNotEmpty()
    targetId: number;
}
