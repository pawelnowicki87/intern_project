import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @MaxLength(150, { message: 'Title can have up to 150 characters.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Body must be a string.' })
  @MinLength(3, { message: 'Body must have at least 3 characters.' })
  body?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string.' })
  @MaxLength(20, { message: 'Status can have up to 20 characters.' })
  status?: string;
}
