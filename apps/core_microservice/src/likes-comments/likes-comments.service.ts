import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LikesCommentsRepository } from './likes-comments.repository';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';
import { LikeCommentResponseDto } from './dto/like-comment-response.dto';

@Injectable()
export class LikesCommentsService {
  constructor(private readonly likesRepo: LikesCommentsRepository) {}

  private toResponseDto(like: any): LikeCommentResponseDto {
    return {
      userId: like.userId,
      commentId: like.commentId,
      createdAt: like.createdAt,
      userFirstName: like.user?.firstName,
      userLastName: like.user?.lastName,
      commentBody: like.comment?.body,
    };
  }

  async findAll(): Promise<LikeCommentResponseDto[]> {
    const likes = await this.likesRepo.findAll();
    return likes.map((like) => this.toResponseDto(like));
  }

  async findOne(userId: number, commentId: number): Promise<LikeCommentResponseDto> {
    const like = await this.likesRepo.findOne(userId, commentId);
    if (!like) throw new NotFoundException('Like not found');
    return this.toResponseDto(like);
  }

  async create(data: CreateLikeCommentDto): Promise<LikeCommentResponseDto> {
    const created = await this.likesRepo.create(data);

    if (!created) {
      throw new InternalServerErrorException('Failed to create like');
    }

    const like = await this.likesRepo.findOne(created.userId, created.commentId);
    if (!like) {
      throw new NotFoundException('Like not found after creation');
    }

    return this.toResponseDto(like);
  }

  async remove(userId: number, commentId: number): Promise<{ deleted: boolean }> {
    const success = await this.likesRepo.delete(userId, commentId);

    if (!success) throw new NotFoundException('Like not found');

    return { deleted: true };
  }
}
