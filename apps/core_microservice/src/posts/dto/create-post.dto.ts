import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @MaxLength(150, { message: 'Title can have up to 150 characters.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Body must be a string.' })
  @MinLength(3, { message: 'Body must have at least 3 characters.' })
  body?: string;

  @IsInt({ message: 'User ID must be an integer.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: number;

  @IsOptional()
  @IsString({ message: 'Status must be a string.' })
  @MaxLength(20, { message: 'Status can have up to 20 characters.' })
  status?: string;
}
