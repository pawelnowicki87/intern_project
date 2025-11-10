import { NotificationResponseDto } from "src/notifications/dto/notification-response.dto";
import { NotificationAction } from "src/notifications/entities/notification-acion.enum";

export interface INotificationSender {
  sendNotification(
    recipientId: number, 
    senderId: number,
    action: NotificationAction, 
    targetId: number
  ): Promise<NotificationResponseDto | null>;
}