import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { LikesCommentsService } from './likes-comments.service';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';
import { LikeCommentResponseDto } from './dto/like-comment-response.dto';

@Controller('likes-comments')
export class LikesCommentsController {
  constructor(private readonly likesCommentsService: LikesCommentsService) {}

  @Get()
  findAll(): Promise<LikeCommentResponseDto[]> {
    return this.likesCommentsService.findAll();
  }

  @Get(':userId/:commentId')
  findOne(
    @Param('userId') userId: number,
    @Param('commentId') commentId: number,
  ): Promise<LikeCommentResponseDto> {
    return this.likesCommentsService.findOne(userId, commentId);
  }

  @Post()
  create(@Body() data: CreateLikeCommentDto): Promise<LikeCommentResponseDto> {
    return this.likesCommentsService.create(data);
  }

  @Delete(':userId/:commentId')
  remove(
    @Param('userId') userId: number,
    @Param('commentId') commentId: number,
  ): Promise<{ deleted: boolean }> {
    return this.likesCommentsService.remove(userId, commentId);
  }
}
