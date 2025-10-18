import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { LikesPostsService } from './likes-posts.service';
import { CreateLikePostDto } from './dto/create-like-post.dto';
import { LikePostResponseDto } from './dto/like-post-response.dto';

@Controller('likes-posts')
export class LikesPostsController {
  constructor(private readonly likesPostsService: LikesPostsService) {}

  @Get()
  findAll(): Promise<LikePostResponseDto[]> {
    return this.likesPostsService.findAll();
  }

  @Get(':userId/:postId')
  findOne(
    @Param('userId') userId: number,
    @Param('postId') postId: number,
  ): Promise<LikePostResponseDto> {
    return this.likesPostsService.findOne(userId, postId);
  }

  @Post()
  create(@Body() data: CreateLikePostDto): Promise<LikePostResponseDto> {
    return this.likesPostsService.create(data);
  }

  @Delete(':userId/:postId')
  remove(
    @Param('userId') userId: number,
    @Param('postId') postId: number,
  ): Promise<{ message: string }> {
    return this.likesPostsService.remove(userId, postId);
  }
}
