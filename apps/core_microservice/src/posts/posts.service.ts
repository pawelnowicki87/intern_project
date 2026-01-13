import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotFoundError, InternalError, ForbiddenError } from '@shared/errors/domain-errors';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { FOLLOWS_READER, VISIBILITY_POST_READER } from './ports/tokens';
import type { IFollowsReader } from './ports/follows-reader.port';
import { PostMapper } from './post.mapper';
import { PostStatus } from './entities/post-status.enum';
import { Post } from './entities/posts.entity';
import type { IVisibilityPostsReader } from './ports/visibility-post.reader';
import { POST_MENTIONS_READER } from './ports/tokens';
import type { IPostMentionsProcessorReader } from './ports/mentions-processor.port';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly postsRepository: PostsRepository,

    @Inject(FOLLOWS_READER)
    private readonly followsReader: IFollowsReader,

    @Inject(VISIBILITY_POST_READER)
    private readonly visibilityPostReader: IVisibilityPostsReader,

    @Inject(POST_MENTIONS_READER)
    private readonly postMentionsReader: IPostMentionsProcessorReader,

  ) {}

  async findAll(
    sort: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 10,
  ): Promise<PostResponseDto[]> {
    const skip = (page - 1) * limit;
    const posts = await this.postsRepository.findAll(sort, limit, skip);
    return PostMapper.toResponseList(posts);
  }

  async findOne(id: number, viewerId: number): Promise<PostResponseDto> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundError(`Post with ID ${id} not found`);

    const canView = await this.canViewPost(viewerId, post);
    if (!canView) throw new ForbiddenError('This post is private');

    return PostMapper.toResponseDto(post);
  }

  async create(data: CreatePostDto): Promise<PostResponseDto> {
    const { fileIds, ...postData } = data;

    const created = await this.postsRepository.create(postData);
    if (!created) throw new InternalError('Post creation failed');

    if (fileIds?.length) {
      for (const fileId of fileIds) {
        await this.postsRepository.attachAsset(created.id, fileId);
      }
    }

    const post = await this.postsRepository.findById(created.id);
    if (!post) throw new NotFoundError('Post not found after creation');

    return PostMapper.toResponseDto(post);
  }

  async update(id: number, data: UpdatePostDto): Promise<PostResponseDto> {
    const updated = await this.postsRepository.update(id, data);
    if (!updated) throw new NotFoundError(`Post with ID ${id} not found`);

    if (typeof data.body === 'string' && data.body.length > 0) {
      await this.postMentionsReader.processMentions(data.body, id, updated.userId);
    }
    return PostMapper.toResponseDto(updated);
  }

  async remove(id: number) {
    const success = await this.postsRepository.delete(id);
    if (!success) throw new NotFoundError(`Post with ID ${id} not found`);
    return { deleted: true };
  }

  async findArchived(): Promise<PostResponseDto[]> {
    const posts = await this.postsRepository.findArchived();
    return PostMapper.toResponseList(posts);
  }

  async archive(id: number): Promise<PostResponseDto> {
    const archived = await this.postsRepository.archive(id);
    if (!archived)
      throw new NotFoundError(`Post with id: ${id} cannot be found to archive`);

    return PostMapper.toResponseDto(archived);
  }

  async unArchive(id: number): Promise<PostResponseDto> {
    const unArchive = await this.postsRepository.unArchive(id);
    if (!unArchive)
      throw new NotFoundError(`Post with id: ${id} cannot be found to unarchive`);

    return PostMapper.toResponseDto(unArchive);
  }

  async findFeedForUser(
    userId: number,
    sort: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 10,
  ): Promise<PostResponseDto[]> {
    const followedIds = await this.followsReader.findFollowedIdsByUser(userId);
    const allUsersIds = [...followedIds, userId];

    const skip = (page - 1) * limit;
    const posts = await this.postsRepository.findByUserIds(allUsersIds, sort, limit, skip);

    const visible: Post[] = [];

    for (const post of posts) {
      if (await this.canViewPost(userId, post)) {
        visible.push(post);
      }
    }

    return PostMapper.toResponseList(visible);
  }

  async searchPosts(query: string): Promise<PostResponseDto[]> {
    if (!query || query.trim() === '') return [];

    const posts = await this.postsRepository.searchByQuery(query, 'desc', 10, 0);

    const visible: Post[] = [];

    for (const post of posts) {
      if (await this.canViewPost(0, post)) {
        visible.push(post);
      }
    }

    return PostMapper.toResponseList(visible);
  }

  async canViewPost(viewerId: number, post: Post): Promise<boolean> {
    if (viewerId === post.userId) return true;

    if (post.status !== PostStatus.PUBLISHED) return false;

    return this.visibilityPostReader.canViewPosts(viewerId, post.userId);
  }
}
