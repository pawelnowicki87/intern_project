import { Injectable } from '@nestjs/common';
import { NotFoundError, InternalError } from '@shared/errors/domain-errors';
import { LikesPostsRepository } from './likes-posts.repository';
import { CreateLikePostDto } from './dto/create-like-post.dto';
import { LikePostResponseDto } from './dto/like-post-response.dto';

@Injectable()
export class LikesPostsService {
  constructor(private readonly likesRepo: LikesPostsRepository) {}

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

    return this.toResponseDto(like);
  }

  async remove(userId: number, postId: number): Promise<{ deleted: boolean }> {
    const success = await this.likesRepo.delete(userId, postId);
    if (!success) throw new NotFoundError('Like not found');

    return { deleted: true };
  }

  async toggleLike(userId: number, postId: number): Promise<{ liked: boolean }> {
    const existingLike = await this.likesRepo.findOne(userId, postId);

    if (existingLike) {
      const success = await this.likesRepo.delete(userId, postId);

      if (!success) {
        throw new InternalError('Faild to remove like')
      }

      return { liked: false }
    }

    const created = await this.likesRepo.create({ userId, postId });
    if (!created) {
      throw new InternalError('Faild to create like')
    }

    return { liked: true }
  }

  async getPostLikes(postId: number): Promise<LikePostResponseDto[] | null> {
    const likes = await this.likesRepo.findByPostId(postId);

    if(!likes) {
      throw new InternalError('Failed to count likes')
    }

    return likes.map(like => this.toResponseDto(like))
  }

  async countByPostId(postId: number): Promise<number> {
    const count = await this.likesRepo.countByPostId(postId);

    return count;
  }
}
