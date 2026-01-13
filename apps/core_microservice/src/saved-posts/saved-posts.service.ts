import { Injectable } from '@nestjs/common';
import { SavedPostsRepository } from './saved-posts.repository';
import { CreateSavePostDto } from './dto/create-save-post.dto';
import { SavePostResponseDto } from './dto/save-post-response.dto';
import { InternalError, NotFoundError, ForbiddenError } from '@shared/errors/domain-errors';
import { PostsRepository } from 'src/posts/posts.repository';

@Injectable()
export class SavedPostsService {
  constructor(
    private readonly repo: SavedPostsRepository,
    private readonly postsRepo: PostsRepository,
  ) {}

  private toResponseDto(save: any): SavePostResponseDto {
    return {
      userId: save.userId,
      postId: save.postId,
      createdAt: save.createdAt,
      userFirstName: save.user?.firstName,
      userLastName: save.user?.lastName,
      postTitle: save.post?.title,
    };
  }

  async findAll(): Promise<SavePostResponseDto[]> {
    const saves = await this.repo.findAll();
    return saves.map((s) => this.toResponseDto(s));
  }

  async findByUserId(userId: number): Promise<SavePostResponseDto[]> {
    const saves = await this.repo.findByUserId(userId);
    return (saves ?? []).map((s) => this.toResponseDto(s));
  }

  async findOne(userId: number, postId: number): Promise<SavePostResponseDto> {
    const save = await this.repo.findOne(userId, postId);
    if (!save) throw new NotFoundError('Saved post not found');
    return this.toResponseDto(save);
  }

  async create(data: CreateSavePostDto): Promise<SavePostResponseDto> {
    const post = await this.postsRepo.findById(data.postId);
    if (!post) throw new NotFoundError('Post not found');
    if (post.userId === data.userId) throw new ForbiddenError('Cannot save own post');
    const created = await this.repo.create(data);
    if (!created) throw new InternalError('Failed to create saved post');
    const save = await this.repo.findOne(created.userId, created.postId);
    if (!save) throw new NotFoundError('Saved post not found after creation');
    return this.toResponseDto(save);
  }

  async remove(userId: number, postId: number): Promise<{ deleted: boolean }> {
    const success = await this.repo.delete(userId, postId);
    if (!success) throw new NotFoundError('Saved post not found');
    return { deleted: true };
  }

  async toggleSave(userId: number, postId: number): Promise<{ saved: boolean }> {
    const post = await this.postsRepo.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    if (post.userId === userId) throw new ForbiddenError('Cannot save own post');
    const existing = await this.repo.findOne(userId, postId);
    if (existing) {
      const success = await this.repo.delete(userId, postId);
      if (!success) throw new InternalError('Failed to remove saved post');
      return { saved: false };
    }
    const created = await this.repo.create({ userId, postId });
    if (!created) throw new InternalError('Failed to create saved post');
    return { saved: true };
  }
}
