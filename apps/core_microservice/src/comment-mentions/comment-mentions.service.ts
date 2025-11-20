import { Injectable } from '@nestjs/common';
import { CommentMentionsRepository } from './comment-mentions.repository';
import { CommentMentionResponseDto } from './dto/comment-mention-response.dto';
import { CommentMention } from './entities/comment-mention.entity';

@Injectable()
export class CommentMentionsService {
  constructor(private readonly repo: CommentMentionsRepository) {}

  private toResponseDto(m: CommentMention): CommentMentionResponseDto {
    return {
      id: m.id,
      commentId: m.commentId,
      mentionedUserId: m.mentionedUserId,
      authorId: m.authorId,
      createdAt: m.createdAt,

      mentionedUser: m.mentionedUser
        ? {
            id: m.mentionedUser.id,
            firstName: m.mentionedUser.firstName,
            lastName: m.mentionedUser.lastName,
            username: m.mentionedUser.username,
          }
        : undefined,

      author: m.author
        ? {
            id: m.author.id,
            firstName: m.author.firstName,
            lastName: m.author.lastName,
            username: m.author.username,
          }
        : undefined,
    };
  }

  async findAll(): Promise<CommentMentionResponseDto[]> {
    const list = await this.repo.findAll();
    return list.map((m) => this.toResponseDto(m));
  }

  async getByCommentId(commentId: number): Promise<CommentMentionResponseDto[]> {
    const list = await this.repo.findByCommentId(commentId);
    return list.map((m) => this.toResponseDto(m));
  }

  async getByUserId(userId: number): Promise<CommentMentionResponseDto[]> {
    const list = await this.repo.findByMentionedUserId(userId);
    return list.map((m) => this.toResponseDto(m));
  }
}
