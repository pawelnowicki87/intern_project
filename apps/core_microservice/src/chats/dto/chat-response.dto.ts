export class ChatResponseDto {
  id: number;
  createdAt: Date;
  name?: string;
  participants: {
    userId: number;
    username?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  }[];
  unread?: number;
  messages?: {
    id: number;
    senderId: number;
    receiverId: number;
    body?: string;
    createdAt: Date;
  }[];
}
