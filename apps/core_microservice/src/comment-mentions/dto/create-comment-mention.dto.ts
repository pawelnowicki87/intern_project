import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCommentMentionDto {
  @IsInt()
  @IsNotEmpty()
  commentId: number;

  @IsInt()
  @IsNotEmpty()
  mentionedUserId: number;

  @IsInt()
  @IsNotEmpty()
  authorId: number;
}
