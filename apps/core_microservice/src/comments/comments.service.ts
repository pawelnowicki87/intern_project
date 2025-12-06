import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { Inject } from '@nestjs/common';
import { COMMENT_MENTIONS_READER } from './ports/tokens';
import { ICommentMentionsProcessorReader } from './ports/mentions-processor.port';
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

    private toResponseDto(c: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();

    dto.id = c.id;
    dto.body = c.body;
    dto.createdAt = c.createdAt;
    dto.updatedAt = c.updatedAt;
    dto.parentId = c.parentId;

    dto.user = {
      id: c.user.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      email: c.user.email,
    };

    dto.post = {
      id: c.post.id,
      title: c.post.title,
    };

    dto.children = [];

    return dto;
  }

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepo.findAll();
    return comments.map((c) => this.toResponseDto(c));
  }

  async findOne(id: number): Promise<CommentResponseDto> {
    const comment = await this.commentsRepo.findById(id);
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);

    return this.toResponseDto(comment);
  }

  async create(data: CreateCommentDto): Promise<CommentResponseDto> {

    if (data.parentId) {
      const parent = await this.commentsRepo.findById(data.parentId);
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parent.postId !== data.postId) {
        throw new InternalServerErrorException(
          'Parent comment belongs to a different post',
        );
      }
    }
    const created = await this.commentsRepo.create(data);

    if (!created) {
      throw new InternalServerErrorException('Failed to create comment');
    }

    const comment = await this.commentsRepo.findById(created.id);
    if (!comment) {
      throw new NotFoundException('Comment not found after creation');
    }

    if (typeof data.body === 'string' && data.body.length > 0) {
      await this.commentMentionsReader.processMentions(data.body, comment.id, data.userId);
    }
    return this.toResponseDto(comment);
  }

  async update(id: number, data: UpdateCommentDto): Promise<CommentResponseDto> {
    const updated = await this.commentsRepo.update(id, data);

    if (!updated) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
    
    const fresh = await this.commentsRepo.findById(id);
    if (!fresh) {
      throw new NotFoundException(`Comment ${id} not found after update`);
    }

    if (typeof data.body === 'string' && data.body.length > 0) {
      await this.commentMentionsReader.processMentions(data.body, id, fresh.userId);
    }

    return this.toResponseDto(fresh);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.commentsRepo.delete(id);

    if (!success) throw new NotFoundException(`Comment ${id} not found`);

    return { deleted: true };
  }

  async getCommentsTreeForPost(postId: number): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepo.findByPostId(postId);

    const dtoList = comments.map((c) => this.toResponseDto(c));

    const map = new Map<number, CommentResponseDto>();
    dtoList.forEach((dto) => map.set(dto.id, dto));

    const roots: CommentResponseDto[] = [];

    // assign children to parents
    dtoList.forEach((dto) => {
      if (dto.parentId) {
        const parent = map.get(dto.parentId);
        if (parent) {
          parent.children.push(dto);
        }
      } else {
        // main comment
        roots.push(dto);
      }
    });

    return roots;
  }
}
