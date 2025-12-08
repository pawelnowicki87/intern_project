import { isIn, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Post ID is required.' })
  postId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Comment body must have at least 1 character.' })
  body: string;
}
