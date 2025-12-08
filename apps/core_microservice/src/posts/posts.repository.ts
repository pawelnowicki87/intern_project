import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { PostStatus } from './entities/post-status.enum';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsRepository {
  private readonly logger = new Logger(PostsRepository.name);

  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
  ) {}

  async findAll(
    sort: 'asc' | 'desc' = 'desc',
    take = 10,
    skip = 0,
  ): Promise<Post[]> {
  return this.repo.find({
    relations: ['user'],
    order: { createdAt: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
    take,
    skip,
    });
  }

  async findById(id: number): Promise<Post | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(data: Partial<Post>): Promise<Post | null> {
    try {
      const post = this.repo.create(data);
      return await this.repo.save(post);
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async update(id: number, data: Partial<Post>): Promise<Post | null> {
    try {
      await this.repo.update(id, data);
      return this.findById(id);
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async findArchived(): Promise<Post[]> {
      return this.repo.find({ 
        where: { status: PostStatus.ARCHIVED},
        relations: [ 'user' ],
        order: { createdAt: 'DESC'}
      })
  }

  async archive(id: number): Promise<Post | null> {
    try {
      await this.repo.update(id, { status: PostStatus.ARCHIVED});
      return this.findById(id);
    } catch (error) {
      this.logger.error(error.message)
      return null
    }
  }

  async unArchive(id: number): Promise<Post | null> {
    try {
      await this.repo.update(id, { status: PostStatus.PUBLISHED})
      return this.findById(id);
    } catch (error) {
      this.logger.warn(error.message)
      return null
    }
  };

  async findByUserIds(
    allUsersIds: number[],
    sort: 'asc' | 'desc' = 'desc', 
    take = 1, 
    skip = 10
  ): Promise<Post[]> {
  return this.repo.find({
    where: { 
      userId: In(allUsersIds),
      status: PostStatus.PUBLISHED
    },
    relations: ['user'],
    order: { createdAt: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
    take,
    skip,
  });
} 

async searchByQuery(
  query: string,
  sort: 'asc' | 'desc' = 'desc',
  take = 10,
  skip = 0,
): Promise<Post[]> {
  return this.repo.find({
    where: [
      { title: ILike(`%${query}%`), status: PostStatus.PUBLISHED },
      { body: ILike(`%${query}%`), status: PostStatus.PUBLISHED },
    ],
    relations: ['user'],
    order: { createdAt: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
    take,
    skip,
  });
}

}