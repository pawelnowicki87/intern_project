import { Injectable } from '@nestjs/common';
import { NotFoundError, InternalError } from '@shared/errors/domain-errors';
import { LikesCommentsRepository } from './likes-comments.repository';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';
import { LikeCommentResponseDto } from './dto/like-comment-response.dto';
import { LikeComment } from './entities/like-comment.entity';

@Injectable()
export class LikesCommentsService {
  constructor(private readonly likesRepo: LikesCommentsRepository) {}

  private toResponseDto(like: LikeComment): LikeCommentResponseDto {
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
    if (!like) throw new NotFoundError('Like not found');
    return this.toResponseDto(like);
  }

  async create(data: CreateLikeCommentDto): Promise<LikeCommentResponseDto> {
    const created = await this.likesRepo.create(data);

    if (!created) {
      throw new InternalError('Failed to create like');
    }

    const like = await this.likesRepo.findOne(created.userId, created.commentId);
    if (!like) {
      throw new NotFoundError('Like not found after creation');
    }

    return this.toResponseDto(like);
  }

  async remove(userId: number, commentId: number): Promise<{ deleted: boolean }> {
    const success = await this.likesRepo.delete(userId, commentId);

    if (!success) throw new NotFoundError('Like not found');

    return { deleted: true };
  }

  async toggleLike(userId: number, commentId: number): Promise<{ liked: boolean}> {
    const existingLike = await this.likesRepo.findOne(userId, commentId);
    
    if (existingLike) {
      const success = await this.likesRepo.delete(userId, commentId);

      if (!success) {
        throw new InternalError('Failed to remove like');
      }

      return { liked: false};
    }

    const created = await this.likesRepo.create({ userId, commentId});

    if (!created) {
      throw new InternalError('Failed to create like');
    }

    return { liked: true };
  }

  async getCommentLikes(commentId: number): Promise<LikeCommentResponseDto[]> {
    const likes = await this.likesRepo.findByCommentId(commentId);

    return likes.map(like => this.toResponseDto(like));
  }

  async countByCommentId(commentId: number): Promise<number> {
    const count = await this.likesRepo.countByCommentId(commentId);

    return count;
  }

  async checkLiked(userId: number, commentIds: number[]): Promise<{ likedIds: number[] }> {
    const likes = await this.likesRepo.findByUserAndCommentIds(userId, commentIds);
    const likedIds = Array.from(new Set(likes.map((l) => l.commentId)));
    return { likedIds };
  }
}
