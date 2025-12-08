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
  ): Promise<{ deleted: boolean }> {
    return this.likesPostsService.remove(userId, postId);
  }

  @Post('toggle')
  toggleLikePost(@Body() data: CreateLikePostDto): Promise<{ liked: boolean }> {
    return this.likesPostsService.toggleLike(data.userId, data.postId);
  }

  @Get('post/:postId')
  getPostLikes(@Param('postId') postId: number): Promise<LikePostResponseDto[] |null> {
    return this.likesPostsService.getPostLikes(postId);
  }

  @Get('post/:postId/count')
  getPostLikesCount(@Param('postId') postId: number): Promise<number> {
    return this.likesPostsService.countByPostId(postId)
  }
}
