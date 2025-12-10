import { NotificationAction } from '@shared/notifications/notification-action';

export class NotificationResponseDto {
  id: number;
  recipientId: number;
  senderId: number;
  action: NotificationAction;
  targetId: number;
  isRead: boolean;
  createdAt: Date;
}
