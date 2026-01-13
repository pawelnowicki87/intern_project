export class SavePostResponseDto {
  userId: number;
  postId: number;
  createdAt: Date;

  userFirstName?: string;
  userLastName?: string;
  postTitle?: string;
}

