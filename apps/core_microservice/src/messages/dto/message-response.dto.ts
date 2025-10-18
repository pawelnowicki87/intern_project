export class MessageResponseDto {
  id: number;
  senderId: number;
  receiverId: number;
  title?: string;
  body?: string;
  isRead: boolean;
  createdAt: Date;

  sender?: {
    firstName: string;
    lastName: string;
    email: string;
  };

  receiver?: {
    firstName: string;
    lastName: string;
    email: string;
  };

  assets?: {
    id: number;
    url: string;
  }[];
}
