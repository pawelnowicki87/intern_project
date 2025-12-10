import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PostStatus } from '../entities/post-status.enum';

export class CreatePostDto {
  @IsString({ message: 'Title must be a string.' })
  @MaxLength(150, { message: 'Title can have up to 150 characters.' })
  @IsNotEmpty({ message: 'Title is required.' })
    title: string;

  @IsString({ message: 'Body must be a string.' })
  @MinLength(3, { message: 'Body must have at least 3 characters.' })
  @IsNotEmpty({ message: 'Body is required.' })
    body: string;

  @IsInt({ message: 'User ID must be an integer.' })
  @IsNotEmpty({ message: 'User ID is required.' })
    userId: number;

  @IsOptional()
  @IsEnum(PostStatus, { message: 'Status must be a valid PostStatus value.' })
    status: PostStatus;
}
