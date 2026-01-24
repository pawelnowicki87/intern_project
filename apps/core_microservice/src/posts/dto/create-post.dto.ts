import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { PostStatus } from '../entities/post-status.enum';

export class CreatePostDto {
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

  @IsOptional()
  @IsInt({ each: true })
    fileIds?: number[];
}
