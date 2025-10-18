export class ChatResponseDto {
  id: number;
  createdAt: Date;
  participants: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  messages?: {
    id: number;
    senderId: number;
    receiverId: number;
    body?: string;
    createdAt: Date;
  }[];
}
