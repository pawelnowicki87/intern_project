import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateLikePostDto {
  @IsInt()
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Post ID is required.' })
  postId: number;
}
