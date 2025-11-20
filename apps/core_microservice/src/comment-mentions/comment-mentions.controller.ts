import { Controller, Get, Param } from '@nestjs/common';
import { CommentMentionsService } from './comment-mentions.service';
import { CommentMentionResponseDto } from './dto/comment-mention-response.dto';

@Controller('comment-mentions')
export class CommentMentionsController {
  constructor(private readonly mentionsService: CommentMentionsService) {}

  @Get()
  findAll(): Promise<CommentMentionResponseDto[]> {
    return this.mentionsService.findAll();
  }

  @Get('comment/:commentId')
  getByComment(@Param('commentId') commentId: number): Promise<CommentMentionResponseDto[]> {
    return this.mentionsService.getByCommentId(commentId);
  }

  @Get('user/:userId')
  getMentionsForUser(@Param('userId') userId: number): Promise<CommentMentionResponseDto[]> {
    return this.mentionsService.getByUserId(userId);
  }
}
