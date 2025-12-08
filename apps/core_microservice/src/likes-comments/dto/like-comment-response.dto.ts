export class LikeCommentResponseDto {
  userId: number;
  commentId: number;
  createdAt: Date;

  userFirstName: string;
  userLastName: string;
  commentBody?: string;
}
