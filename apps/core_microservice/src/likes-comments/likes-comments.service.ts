import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundError, InternalError } from '../common/errors/domain-errors';
import { LikesCommentsRepository } from './likes-comments.repository';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';
import { LikeCommentResponseDto } from './dto/like-comment-response.dto';
import { LikeComment } from './entities/like-comment.entity';
import { NOTIFICATIONS_SENDER } from 'src/notifications-producer/ports/tokens';
import type { INotificationSender } from 'src/notifications-producer/ports/notification-sender.port';
import { NotificationAction } from '../common/notifications/notification-action';

@Injectable()
export class LikesCommentsService {
  private readonly logger = new Logger(LikesCommentsService.name);

  constructor(
    private readonly likesRepo: LikesCommentsRepository,
    @Inject(NOTIFICATIONS_SENDER)
    private readonly notificationSender: INotificationSender,
  ) {}

  private async notifyCommentLike(userId: number, commentId: number): Promise<void> {
    const like = await this.likesRepo.findOne(userId, commentId);
    const commentOwnerId = like?.comment?.userId;
    if (!commentOwnerId || commentOwnerId === userId) return;

    this.logger.log(`Sending LIKE_COMMENT notification to user ${commentOwnerId} from user ${userId} for comment ${commentId}`);
    await this.notificationSender.sendNotification(
      commentOwnerId,
      userId,
      NotificationAction.LIKE_COMMENT,
      commentId,
    );
  }

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

    await this.notifyCommentLike(created.userId, created.commentId);

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

    await this.notifyCommentLike(created.userId, created.commentId);

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
