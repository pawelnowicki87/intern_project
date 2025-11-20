export class CommentMentionResponseDto {
  id: number;

  commentId: number;
  mentionedUserId: number;
  authorId: number;

  createdAt: Date;

  mentionedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };

  author?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
}
