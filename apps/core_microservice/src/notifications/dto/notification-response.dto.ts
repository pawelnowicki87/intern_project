import { NotificationAction } from "../entities/notification-acion.enum";

export class NotificationResponseDto {
  id: number;
  recipientId: number;
  senderId: number;
  action: NotificationAction;
  targetId: number;
  isRead: boolean;
  createdAt: Date;

  sender?: {
    firstName: string;
    lastName: string;
    email: string;
  };

  recipient?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
