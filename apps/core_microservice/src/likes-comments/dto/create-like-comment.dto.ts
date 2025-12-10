import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateLikeCommentDto {
  @IsInt()
  @IsNotEmpty({ message: 'User ID is required.' })
    userId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Comment ID is required.' })
    commentId: number;
}
