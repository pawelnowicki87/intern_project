import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { FOLLOWS_READER, VISIBILITY_READER } from './ports/tokens';
import { IFollowsReader } from './ports/follows-reader.port';
import { PostMapper } from './post.mapper';
import { IVisibilityReader } from './ports/visibility-reader.port';
import { PostStatus } from './entities/post-status.enum';
import { Post } from './entities/posts.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly postsRepository: PostsRepository,
    @Inject(FOLLOWS_READER)
    private readonly followsReader: IFollowsReader,
    @Inject(VISIBILITY_READER)
    private readonly visibilityReader: IVisibilityReader,
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
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

    const canView = await this.canViewPost(viewerId, post);
    if (!canView) throw new ForbiddenException('This post is private');

    return PostMapper.toResponseDto(post);
  }

  async create(data: CreatePostDto): Promise<PostResponseDto> {
    const created = await this.postsRepository.create(data);
    if (!created) throw new InternalServerErrorException('Post creation failed');

    const post = await this.postsRepository.findById(created.id);
    if (!post) throw new NotFoundException('Error fetching created post');

    return PostMapper.toResponseDto(post);
  }

  async update(id: number, data: UpdatePostDto): Promise<PostResponseDto> {
    const updated = await this.postsRepository.update(id, data);
    if (!updated) throw new NotFoundException(`Post with ID ${id} not found`);

    return PostMapper.toResponseDto(updated);
  }

  async remove(id: number) {
    const success = await this.postsRepository.delete(id);
    if (!success) throw new NotFoundException(`Post with ID ${id} not found`);
    return { deleted: true };
  }

  async findArchived(): Promise<PostResponseDto[]> {
    const posts = await this.postsRepository.findArchived();
    return PostMapper.toResponseList(posts);
  }

  async archive(id: number): Promise<PostResponseDto> {
    const archived = await this.postsRepository.archive(id);
    if (!archived)
      throw new NotFoundException(`Post with id: ${id} cannot be found to archive`);

    return PostMapper.toResponseDto(archived);
  }

  async unArchive(id: number): Promise<PostResponseDto> {
    const unArchive = await this.postsRepository.unArchive(id);
    if (!unArchive)
      throw new NotFoundException(`Post with id: ${id} cannot be found to unarchive`);

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

    return this.visibilityReader.canViewPosts(viewerId, post.userId);
  }
}
