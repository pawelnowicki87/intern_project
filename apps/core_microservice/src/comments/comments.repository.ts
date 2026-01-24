import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { LikeComment } from '../likes-comments/entities/like-comment.entity';

@Injectable()
export class CommentsRepository {
  private readonly logger = new Logger(CommentsRepository.name);

  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  findAll(): Promise<Comment[]> {
    return this.repo.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Comment | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
  }

  async create(data: Partial<Comment>): Promise<Comment | null> {
    try {
      const comment = this.repo.create(data);
      return await this.repo.save(comment);
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async update(id: number, data: Partial<Comment>): Promise<Comment | null> {
    try {
      await this.repo.update(id, data);
      return this.findById(id);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }

  findByPostId(postId: number): Promise<Comment[]> {
    return this.repo.find({
      where: { postId },
      relations: ['user', 'post'], 
      order: { createdAt: 'ASC' },
    });
  }

  async deleteLikesByCommentIds(commentIds: number[]): Promise<boolean> {
    if (!commentIds.length) return true;
    try {
      await this.repo.manager.getRepository(LikeComment).delete({ commentId: In(commentIds) });
      return true;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }
}
