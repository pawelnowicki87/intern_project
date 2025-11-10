import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepo: CommentsRepository) {}

  private toResponseDto(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        email: comment.user.email,
      },
      post: {
        id: comment.post.id,
        title: comment.post.title,
      },
    };
  }

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepo.findAll();
    return comments.map((c) => this.toResponseDto(c));
  }

  async findOne(id: number): Promise<CommentResponseDto> {
    const comment = await this.commentsRepo.findById(id);
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);

    return this.toResponseDto(comment);
  }

  async create(data: CreateCommentDto): Promise<CommentResponseDto> {
    const created = await this.commentsRepo.create(data);

    if (!created) {
      throw new InternalServerErrorException('Failed to create comment');
    }

    const comment = await this.commentsRepo.findById(created.id);
    if (!comment) {
      throw new NotFoundException('Comment not found after creation');
    }

    return this.toResponseDto(comment);
  }

  async update(id: number, data: UpdateCommentDto): Promise<CommentResponseDto> {
    const updated = await this.commentsRepo.update(id, data);

    if (!updated) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    return this.toResponseDto(updated);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.commentsRepo.delete(id);

    if (!success) throw new NotFoundException(`Comment ${id} not found`);

    return { deleted: true };
  }
}
