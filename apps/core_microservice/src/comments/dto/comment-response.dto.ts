export class CommentResponseDto {
  id: number;
  body?: string;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  post: {
    id: number;
    title?: string;
  };
}
