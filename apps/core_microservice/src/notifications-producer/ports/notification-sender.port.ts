import { NotificationAction } from '../../common/notifications/notification-action';

export interface INotificationSender {
  sendNotification(
    recipientId: number,
    senderId: number,
    action: NotificationAction,
    targetId: number
  ): Promise<void>;
}
