export class CommentResponseDto {
  id: number;
  body?: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: number;
  children: CommentResponseDto[] = [];

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
