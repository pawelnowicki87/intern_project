import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundError, InternalError } from '../common/errors/domain-errors';
import { LikesPostsRepository } from './likes-posts.repository';
import { CreateLikePostDto } from './dto/create-like-post.dto';
import { LikePostResponseDto } from './dto/like-post-response.dto';
import { NOTIFICATIONS_SENDER } from 'src/notifications-producer/ports/tokens';
import type { INotificationSender } from 'src/notifications-producer/ports/notification-sender.port';
import { NotificationAction } from '../common/notifications/notification-action';

@Injectable()
export class LikesPostsService {
  private readonly logger = new Logger(LikesPostsService.name);

  constructor(
    private readonly likesRepo: LikesPostsRepository,
    @Inject(NOTIFICATIONS_SENDER)
    private readonly notificationSender: INotificationSender,
  ) {}

  private async notifyPostLike(userId: number, postId: number): Promise<void> {
    const like = await this.likesRepo.findOne(userId, postId);

    if (!like) {
      this.logger.warn(
        `Like not found for userId: ${userId}, postId: ${postId} during notification`,
      );
      return;
    }

    if (!like.post) {
      this.logger.warn(
        `Post not found in relation for like userId: ${userId}, postId: ${postId}. Check relations.`,
      );
      return;
    }

    const postOwnerId = like.post.userId;
    if (!postOwnerId) {
      this.logger.warn(`Post owner ID missing for postId: ${postId}`);
      return;
    }

    if (postOwnerId === userId) {
      this.logger.debug(
        `User ${userId} liked their own post ${postId}. No notification sent.`,
      );
      return;
    }

    this.logger.log(
      `Sending LIKE_POST notification to user ${postOwnerId} from user ${userId} for post ${postId}`,
    );
    try {
      await this.notificationSender.sendNotification(
        postOwnerId,
        userId,
        NotificationAction.LIKE_POST,
        postId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send LIKE_POST notification: ${error.message}`,
        error.stack,
      );
    }
  }

  private toResponseDto(like: any): LikePostResponseDto {
    return {
      userId: like.userId,
      postId: like.postId,
      createdAt: like.createdAt,
      userFirstName: like.user?.firstName,
      userLastName: like.user?.lastName,
      postTitle: like.post?.title,
    };
  }

  async findAll(): Promise<LikePostResponseDto[]> {
    const likes = await this.likesRepo.findAll();
    return likes.map((like) => this.toResponseDto(like));
  }

  async findOne(userId: number, postId: number): Promise<LikePostResponseDto> {
    const like = await this.likesRepo.findOne(userId, postId);
    if (!like) throw new NotFoundError('Like not found');
    return this.toResponseDto(like);
  }

  async create(data: CreateLikePostDto): Promise<LikePostResponseDto> {
    const created = await this.likesRepo.create(data);

    if (!created) {
      throw new InternalError('Failed to create like');
    }

    const like = await this.likesRepo.findOne(created.userId, created.postId);
    if (!like) {
      throw new NotFoundError('Like not found after creation');
    }

    await this.notifyPostLike(created.userId, created.postId);

    return this.toResponseDto(like);
  }

  async remove(userId: number, postId: number): Promise<{ deleted: boolean }> {
    const success = await this.likesRepo.delete(userId, postId);
    if (!success) throw new NotFoundError('Like not found');

    return { deleted: true };
  }

  async toggleLike(
    userId: number,
    postId: number,
  ): Promise<{ liked: boolean }> {
    const existingLike = await this.likesRepo.findOne(userId, postId);

    if (existingLike) {
      const success = await this.likesRepo.delete(userId, postId);

      if (!success) {
        throw new InternalError('Faild to remove like');
      }

      return { liked: false };
    }

    const created = await this.likesRepo.create({ userId, postId });
    if (!created) {
      throw new InternalError('Faild to create like');
    }

    await this.notifyPostLike(created.userId, created.postId);

    return { liked: true };
  }

  async getPostLikes(postId: number): Promise<LikePostResponseDto[] | null> {
    const likes = await this.likesRepo.findByPostId(postId);

    if (!likes) {
      throw new InternalError('Failed to count likes');
    }

    return likes.map((like) => this.toResponseDto(like));
  }

  async countByPostId(postId: number): Promise<number> {
    const count = await this.likesRepo.countByPostId(postId);

    return count;
  }
}
