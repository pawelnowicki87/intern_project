import { Controller, Get, Post, Delete, Param, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
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
  async findOne(
    @Param('userId') userId: number,
    @Param('commentId') commentId: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const like = await this.likesCommentsService.findOne(userId, commentId);
      res.status(200).json(like);
    } catch (e) {
      res.status(404).send();
    }
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

  @Post('toggle')
  toggleLikeComment(@Body() data: CreateLikeCommentDto): Promise<{ liked: boolean}> {
    return this.likesCommentsService.toggleLike(data.userId, data.commentId);
  }

  @Get('comment/:commentId')
  getCommentLikes(@Param('commentId') commentId: number): Promise<LikeCommentResponseDto[]> {
    return this.likesCommentsService.getCommentLikes(commentId);
  }

  @Get('comment/:commentId/count')
  getCommentLikesCount(@Param('commentId') commentId: number): Promise<number> {
    return this.likesCommentsService.countByCommentId(commentId);
  }
}
