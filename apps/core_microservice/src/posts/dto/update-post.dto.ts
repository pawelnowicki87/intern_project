import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PostStatus } from '../entities/post-status.enum';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsEnum(PostStatus, { message: 'Status must be a valid PostStatus value.' })
    status?: PostStatus;
}
