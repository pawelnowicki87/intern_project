import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentMention } from './entities/comment-mention.entity';

@Injectable()
export class CommentMentionsRepository {
  private readonly logger = new Logger(CommentMentionsRepository.name);

  constructor(
    @InjectRepository(CommentMention)
    private readonly repo: Repository<CommentMention>,
  ) {}

  async create(data: Partial<CommentMention>): Promise<CommentMention | null> {
    try {
      const mention = this.repo.create(data);
      return await this.repo.save(mention);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async findAll(): Promise<CommentMention[]> {
    return this.repo.find({
      relations: ['comment', 'mentionedUser', 'author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCommentId(commentId: number): Promise<CommentMention[]> {
    return this.repo.find({
      where: { commentId },
      relations: ['comment', 'mentionedUser', 'author'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByMentionedUserId(userId: number): Promise<CommentMention[]> {
    return this.repo.find({
      where: { mentionedUserId: userId },
      relations: ['comment', 'mentionedUser', 'author'],
      order: { createdAt: 'DESC' },
    });
  }
}
