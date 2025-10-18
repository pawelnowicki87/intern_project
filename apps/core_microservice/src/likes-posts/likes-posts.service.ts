import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikePost } from './entities/like-post.entity';
import { CreateLikePostDto } from './dto/create-like-post.dto';
import { LikePostResponseDto } from './dto/like-post-response.dto';

@Injectable()
export class LikesPostsService {
  constructor(
    @InjectRepository(LikePost)
    private readonly likePostRepo: Repository<LikePost>,
  ) {}

  async findAll(): Promise<LikePostResponseDto[]> {
    const likes = await this.likePostRepo.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });

    return likes.map(({ userId, postId, createdAt, user, post }) => ({
      userId,
      postId,
      createdAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      postTitle: post?.title,
    }));
  }

  async findOne(userId: number, postId: number): Promise<LikePostResponseDto> {
    const like = await this.likePostRepo.findOne({
      where: { userId, postId },
      relations: ['user', 'post'],
    });

    if (!like) throw new NotFoundException('Like not found');

    const { createdAt, user, post } = like;
    return {
      userId,
      postId,
      createdAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      postTitle: post?.title,
    };
  }

  async create(data: CreateLikePostDto): Promise<LikePostResponseDto> {
    const like = this.likePostRepo.create(data);
    const saved = await this.likePostRepo.save(like);

    const full = await this.likePostRepo.findOne({
      where: { userId: saved.userId, postId: saved.postId },
      relations: ['user', 'post'],
    });

    if (!full)
      throw new NotFoundException(
        `Like (userId=${saved.userId}, postId=${saved.postId}) not found after creation.`,
      );

    const { userId, postId, createdAt, user, post } = full;
    return {
      userId,
      postId,
      createdAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      postTitle: post?.title,
    };
  }

  async remove(userId: number, postId: number): Promise<{ message: string }> {
    const like = await this.likePostRepo.findOne({ where: { userId, postId } });
    if (!like) throw new NotFoundException('Like not found');

    await this.likePostRepo.remove(like);
    return { message: `Like (userId=${userId}, postId=${postId}) removed successfully.` };
  }
}
