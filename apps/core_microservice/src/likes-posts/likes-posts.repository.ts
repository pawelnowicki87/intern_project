import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikePost } from './entities/like-post.entity';
import { CreateLikePostDto } from './dto/create-like-post.dto';

@Injectable()
export class LikesPostsRepository {
  private readonly logger = new Logger(LikesPostsRepository.name);

  constructor(
    @InjectRepository(LikePost)
    private readonly repo: Repository<LikePost>,
  ) {}

  findAll(): Promise<LikePost[]> {
    return this.repo.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(userId: number, postId: number): Promise<LikePost | null> {
    return this.repo.findOne({
      where: { userId, postId },
      relations: ['user', 'post'],
    });
  }

  async create(data: CreateLikePostDto): Promise<LikePost | null> {
    try {
      const like = this.repo.create(data);
      return await this.repo.save(like);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(userId: number, postId: number): Promise<boolean> {
    try {
      const result = await this.repo.delete({ userId, postId });
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }
  async findByPostId(postId: number): Promise<LikePost[] | null> {
    return this.repo.find({
      where: { postId },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC'}
    })
  }

  async countByPostId(postId): Promise<number> {
    return this.repo.count({
      where: { postId }
    })
  }
}
