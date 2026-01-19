import { Injectable } from '@nestjs/common';
import { NotFoundError, InternalError, ForbiddenError } from '@shared/errors/domain-errors';
import { CommentsRepository } from './comments.repository';
import { Inject } from '@nestjs/common';
import { COMMENT_MENTIONS_READER } from './ports/tokens';
import type { ICommentMentionsProcessorReader } from './ports/mentions-processor.port';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    @Inject(COMMENT_MENTIONS_READER)
    private readonly commentMentionsReader: ICommentMentionsProcessorReader,
  ) {}

  private toResponseDto(comment: Comment): CommentResponseDto {
    return new CommentResponseDto({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      parentId: comment.parentId,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatarUrl: comment.user.avatarUrl ?? null,
      },
      post: {
        id: comment.post.id,
      },
      children: [],
    });
  }

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepo.findAll();
    return comments.map((comment) => this.toResponseDto(comment));
  }

  async findOne(id: number): Promise<CommentResponseDto> {
    const foundComment = await this.commentsRepo.findById(id);
    if (!foundComment) throw new NotFoundError(`Comment ${id} not found`);

    return this.toResponseDto(foundComment);
  }

  async create(data: CreateCommentDto): Promise<CommentResponseDto> {
    if (data.parentId !== undefined && data.parentId !== null) {
      const parent = await this.commentsRepo.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent comment not found');
      }

      if (parent.parentId) {
        throw new InternalError('Parent comment already has a parent');
      }

      if (parent.postId !== data.postId) {
        throw new InternalError('Parent comment belongs to a different post');
      }
    }
    const created = await this.commentsRepo.create(data);

    if (!created) {
      throw new InternalError('Failed to create comment');
    }

    const createdComment = await this.commentsRepo.findById(created.id);
    if (!createdComment) {
      throw new NotFoundError('Comment not found after creation');
    }

    if (typeof data.body === 'string' && data.body.length > 0) {
      await this.commentMentionsReader.processMentions(data.body, createdComment.id, data.userId);
    }
    return this.toResponseDto(createdComment);
  }

  async update(id: number, data: UpdateCommentDto): Promise<CommentResponseDto> {
    let currentComment: Comment | null = null;
    const needsCurrentComment = (data.userId !== undefined && data.userId !== null)
      || (data.parentId !== undefined && data.parentId !== null && (data.postId === undefined || data.postId === null));
    if (needsCurrentComment) {
      currentComment = await this.commentsRepo.findById(id);
      if (!currentComment) {
        throw new NotFoundError(`Comment ${id} not found`);
      }
    }
    if (data.userId !== undefined && data.userId !== null && currentComment && currentComment.userId !== data.userId) {
      throw new ForbiddenError('Cannot edit comment owned by another user');
    }
    if (data.parentId !== undefined && data.parentId !== null) {
      const parent = await this.commentsRepo.findById(data.parentId);
      if (!parent) {
        throw new NotFoundError('Parent comment not found');
      }

      if (parent.parentId) {
        throw new InternalError('Parent comment already has a parent');
      }

      const targetPostId = data.postId ?? currentComment?.postId;
      if (targetPostId !== parent.postId) {
        throw new InternalError('Parent comment belongs to a different post');
      }
    }

    const updated = await this.commentsRepo.update(id, data);

    if (!updated) {
      throw new NotFoundError(`Comment ${id} not found`);
    }
    
    const freshComment = await this.commentsRepo.findById(id);
    if (!freshComment) {
      throw new NotFoundError(`Comment ${id} not found after update`);
    }

    if (typeof data.body === 'string' && data.body.length > 0) {
      await this.commentMentionsReader.processMentions(data.body, id, freshComment.userId);
    }

    return this.toResponseDto(freshComment);
  }

  async remove(id: number, userId?: number): Promise<{ deleted: boolean }> {
    const existing = await this.commentsRepo.findById(id);
    if (!existing) throw new NotFoundError(`Comment ${id} not found`);
    if (userId !== undefined && userId !== null && existing.userId !== userId) {
      throw new ForbiddenError('Cannot delete comment owned by another user');
    }
    const related = await this.commentsRepo.findByPostId(existing.postId);
    const byParent = new Map<number, number[]>();
    related.forEach((comment) => {
      if (!comment.parentId) return;
      const list = byParent.get(comment.parentId) ?? [];
      list.push(comment.id);
      byParent.set(comment.parentId, list);
    });
    const idsToDelete = new Set<number>();
    const queue: number[] = [id];
    while (queue.length) {
      const currentId = queue.shift()!;
      if (idsToDelete.has(currentId)) continue;
      idsToDelete.add(currentId);
      const children = byParent.get(currentId) ?? [];
      children.forEach((childId) => queue.push(childId));
    }
    const likesDeleted = await this.commentsRepo.deleteLikesByCommentIds(Array.from(idsToDelete));
    if (!likesDeleted) {
      throw new InternalError('Failed to remove comment likes');
    }
    const success = await this.commentsRepo.delete(id);

    if (!success) throw new NotFoundError(`Comment ${id} not found`);

    return { deleted: true };
  }

  async getCommentsTreeForPost(postId: number): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepo.findByPostId(postId);

    const responseList = comments.map((comment) => this.toResponseDto(comment));

    const responsesById = new Map<number, CommentResponseDto>();
    responseList.forEach((response) => responsesById.set(response.id, response));

    const roots: CommentResponseDto[] = [];

    responseList.forEach((response) => {
      if (response.parentId) {
        const parent = responsesById.get(response.parentId);
        if (parent) {
          parent.children.push(response);
        }
      } else {
        roots.push(response);
      }
    });

    return roots;
  }
}
