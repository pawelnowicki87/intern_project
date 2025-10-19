import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<PostResponseDto[]> {
    this.logger.log('Fetching all posts...');
    const posts = await this.postRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    this.logger.debug(`Fetched ${posts.length} posts.`);

    return posts.map(({ id, title, body, status, createdAt, updatedAt, user }) => ({
      id,
      title,
      body,
      status,
      createdAt,
      updatedAt,
      user: user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
          }
        : null,
    }));
  }

  async findOne(id: number): Promise<PostResponseDto> {
    this.logger.log(`Fetching post with ID=${id}`);
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      this.logger.warn(`Post with ID=${id} not found.`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const { title, body, status, createdAt, updatedAt, user } = post;
    return {
      id: post.id,
      title,
      body,
      status,
      createdAt,
      updatedAt,
      user: user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
          }
        : null,
    };
  }

  async create(data: CreatePostDto): Promise<PostResponseDto> {
    this.logger.log(`Creating post for userId=${data.userId}`);
    try {
      const post = this.postRepository.create(data);
      const saved = await this.postRepository.save(post);
      this.logger.debug(`Post created with ID=${saved.id}`);

      const fullPost = await this.postRepository.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });

      if (!fullPost) {
        this.logger.error('Post not found after creation.');
        throw new NotFoundException('Error while fetching created post.');
      }

      const { id, title, body, status, createdAt, updatedAt, user } = fullPost;
      return {
        id,
        title,
        body,
        status,
        createdAt,
        updatedAt,
        user: user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            }
          : null,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error creating post: ${error instanceof Error ? error.message : error}`,
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unexpected error during post creation.',
      );
    }
  }

  async update(id: number, data: UpdatePostDto): Promise<PostResponseDto> {
    this.logger.log(`Updating post with ID=${id}`);
    try {
      const existing = await this.postRepository.findOne({ where: { id } });
      if (!existing) {
        this.logger.warn(`Post with ID=${id} not found for update.`);
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      await this.postRepository.update(id, data);
      this.logger.debug(`Post ID=${id} updated.`);

      const updated = await this.postRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!updated) {
        this.logger.error(`Post ID=${id} not found after update.`);
        throw new NotFoundException(`Updated post with ID ${id} not found`);
      }

      const { title, body, status, createdAt, updatedAt, user } = updated;
      return {
        id: updated.id,
        title,
        body,
        status,
        createdAt,
        updatedAt,
        user: user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            }
          : null,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error updating post ID=${id}: ${error instanceof Error ? error.message : error}`,
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unexpected error during post update.',
      );
    }
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    this.logger.warn(`Attempting to delete post with ID=${id}`);
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Post with ID=${id} not found for deletion.`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    this.logger.log(`Post ID=${id} deleted successfully.`);
    return { deleted: true };
  }
}
