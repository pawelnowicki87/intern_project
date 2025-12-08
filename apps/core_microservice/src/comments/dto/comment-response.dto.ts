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

  constructor(init?: {
    id: number;
    body?: string;
    createdAt: Date;
    updatedAt: Date;
    parentId?: number;
    children?: CommentResponseDto[];
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
  }) {
    if (!init) return;
    this.id = init.id;
    this.body = init.body;
    this.createdAt = init.createdAt;
    this.updatedAt = init.updatedAt;
    this.parentId = init.parentId;
    this.children = init.children ?? [];
    this.user = init.user;
    this.post = init.post;
  }
}
