export class LikePostResponseDto {
  userId: number;
  postId: number;
  createdAt: Date;

  userFirstName?: string;
  userLastName?: string;
  postTitle?: string;
}
