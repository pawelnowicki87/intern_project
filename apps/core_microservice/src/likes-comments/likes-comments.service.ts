import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeComment } from './entities/like-comment.entity';
import { CreateLikeCommentDto } from './dto/create-like-comment.dto';
import { LikeCommentResponseDto } from './dto/like-comment-response.dto';

@Injectable()
export class LikesCommentsService {
  constructor(
    @InjectRepository(LikeComment)
    private readonly likeCommentRepo: Repository<LikeComment>,
  ) {}

  async findAll(): Promise<LikeCommentResponseDto[]> {
    const likes = await this.likeCommentRepo.find({
      relations: ['user', 'comment'],
      order: { createdAt: 'DESC' },
    });

    return likes.map(({ userId, commentId, createdAt, user, comment }) => ({
      userId,
      commentId,
      createdAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      commentBody: comment?.body,
    }));
  }

  async findOne(userId: number, commentId: number): Promise<LikeCommentResponseDto> {
    const like = await this.likeCommentRepo.findOne({
      where: { userId, commentId },
      relations: ['user', 'comment'],
    });

    if (!like) throw new NotFoundException('Like not found');

    const { createdAt, user, comment } = like;
    return {
      userId,
      commentId,
      createdAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      commentBody: comment?.body,
    };
  }

  async create(data: CreateLikeCommentDto): Promise<LikeCommentResponseDto> {
    const like = this.likeCommentRepo.create(data);
    const saved = await this.likeCommentRepo.save(like);

    const full = await this.likeCommentRepo.findOne({
      where: { userId: saved.userId, commentId: saved.commentId },
      relations: ['user', 'comment'],
    });

    if (!full)
      throw new NotFoundException(
        `Like (userId=${saved.userId}, commentId=${saved.commentId}) not found after creation.`,
      );

    const { userId, commentId, createdAt, user, comment } = full;
    return {
      userId,
      commentId,
      createdAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      commentBody: comment?.body,
    };
  }

  async remove(userId: number, commentId: number): Promise<{ message: string }> {
    const like = await this.likeCommentRepo.findOne({ where: { userId, commentId } });
    if (!like) throw new NotFoundException('Like not found');

    await this.likeCommentRepo.remove(like);
    return {
      message: `Like (userId=${userId}, commentId=${commentId}) removed successfully.`,
    };
  }
}
