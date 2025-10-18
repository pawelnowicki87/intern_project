import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(): Promise<CommentResponseDto[]> {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateCommentDto): Promise<CommentResponseDto> {
    return this.commentsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ deleted: boolean }> {
    return this.commentsService.remove(id);
  }
}
