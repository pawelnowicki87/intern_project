import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeComment } from './entities/like-comment.entity';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';

@Injectable()
export class LikesCommentsRepository {
  private readonly logger = new Logger(LikesCommentsRepository.name);

  constructor(
    @InjectRepository(LikeComment)
    private readonly repo: Repository<LikeComment>,
  ) {}

  findAll(): Promise<LikeComment[]> {
    return this.repo.find({
      relations: ['user', 'comment'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(userId: number, commentId: number): Promise<LikeComment | null> {
    return this.repo.findOne({
      where: { userId, commentId },
      relations: ['user', 'comment'],
    });
  }

  async create(data: CreateLikeCommentDto): Promise<LikeComment | null> {
    try {
      const like = this.repo.create(data);
      return await this.repo.save(like);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(userId: number, commentId: number): Promise<boolean> {
    try {
      const result = await this.repo.delete({ userId, commentId });
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }

  async findByCommentId(commentId: number): Promise<LikeComment[]> {
    return this.repo.find({
      where: { commentId },
      relations: ['user', 'comment'],
      order: { createdAt: 'DESC'},
    });
  }

  async countByCommentId(commentId: number): Promise<number> {
    return this.repo.count({
      where: { commentId },
    });
  }
}
