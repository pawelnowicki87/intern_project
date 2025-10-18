import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepository.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });

    return comments.map(({ id, body, createdAt, updatedAt, user, post }) => ({
      id,
      body,
      createdAt,
      updatedAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      post: {
        id: post.id,
        title: post.title,
      },
    }));
  }

  async findOne(id: number): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) throw new NotFoundException(`Comment with ID ${id} not found`);

    const { body, createdAt, updatedAt, user, post } = comment;
    return {
      id,
      body,
      createdAt,
      updatedAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      post: {
        id: post.id,
        title: post.title,
      },
    };
  }

  async create(data: CreateCommentDto): Promise<CommentResponseDto> {
    try {
      const comment = this.commentRepository.create(data);
      const saved = await this.commentRepository.save(comment);

      const full = await this.commentRepository.findOne({
        where: { id: saved.id },
        relations: ['user', 'post'],
      });

      if (!full) throw new NotFoundException('Comment not found after creation.');

      const { id, body, createdAt, updatedAt, user, post } = full;
      return {
        id,
        body,
        createdAt,
        updatedAt,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        post: {
          id: post.id,
          title: post.title,
        },
      };
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error creating comment.',
      );
    }
  }

  async update(id: number, data: UpdateCommentDto): Promise<CommentResponseDto> {
    const existing = await this.commentRepository.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Comment with ID ${id} not found`);

    Object.assign(existing, data);
    await this.commentRepository.save(existing);

    const updated = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!updated) throw new NotFoundException('Updated comment not found.');

    const { body, createdAt, updatedAt, user, post } = updated;
    return {
      id,
      body,
      createdAt,
      updatedAt,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      post: {
        id: post.id,
        title: post.title,
      },
    };
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.commentRepository.delete(id);
    if (!result.affected) throw new NotFoundException(`Comment with ID ${id} not found`);
    return { deleted: true };
  }
}
