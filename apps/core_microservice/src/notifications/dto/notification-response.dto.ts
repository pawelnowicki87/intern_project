export class NotificationResponseDto {
  id: number;
  recipientId: number;
  senderId: number;
  action: string;
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
