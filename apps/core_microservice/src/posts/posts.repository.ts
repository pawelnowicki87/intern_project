import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { PostStatus } from './entities/post-status.enum';
import { PostAsset } from 'src/post-assets/entities/post-asset.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { LikePost } from 'src/likes-posts/entities/like-post.entity';
import { SavePost } from 'src/saved-posts/entities/save-post.entity';
import { InternalError } from '@shared/errors/domain-errors';

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
      relations: ['user', 'assets', 'assets.file', 'likes', 'comments'],
      order: { createdAt: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
      take,
      skip,
    });
  }

  async findById(id: number): Promise<Post | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'assets', 'assets.file', 'likes', 'comments'],
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
      const existing = await this.repo.findOne({ where: { id } });
      if (!existing) return false;
      await this.repo.manager.transaction(async (manager) => {
        await manager.query(
          'DELETE FROM likes_comments WHERE comment_id IN (SELECT id FROM comments WHERE post_id = $1)',
          [id],
        );
        await manager.getRepository(Comment).delete({ postId: id });
        await manager.getRepository(SavePost).delete({ postId: id });
        await manager.getRepository(LikePost).delete({ postId: id });
        await manager.getRepository(PostAsset).delete({ postId: id });
        await manager.getRepository(Post).delete({ id });
      });
      return true;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }

  async findArchived(): Promise<Post[]> {
    return this.repo.find({ 
      where: { status: PostStatus.ARCHIVED},
      relations: [ 'user', 'assets', 'assets.file', 'likes', 'comments'],
      order: { createdAt: 'DESC'},
    });
  }

  async archive(id: number): Promise<Post | null> {
    try {
      await this.repo.update(id, { status: PostStatus.ARCHIVED});
      return this.findById(id);
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async unArchive(id: number): Promise<Post | null> {
    try {
      await this.repo.update(id, { status: PostStatus.PUBLISHED});
      return this.findById(id);
    } catch (error) {
      this.logger.warn(error.message);
      return null;
    }
  };

  async findByUserIds(
    allUsersIds: number[],
    sort: 'asc' | 'desc' = 'desc', 
    take = 1, 
    skip = 10,
  ): Promise<Post[]> {
    return this.repo.find({
      where: { 
        userId: In(allUsersIds),
        status: PostStatus.PUBLISHED,
      },
      relations: ['user', 'assets', 'assets.file', 'likes', 'comments'],
      order: { createdAt: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
      take,
      skip,
    });
  } 

  async findMostLikedPublishedIds(
    take = 10,
    skip = 0,
  ): Promise<number[]> {
    const qb = this.repo.createQueryBuilder('post')
      .leftJoin('post.likes', 'likes')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .select('post.id', 'id')
      .addSelect('COUNT(likes.userId)', '"likesCount"')
      .groupBy('post.id')
      .orderBy('"likesCount"', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    const raw = await qb.getRawMany();
    return raw.map((r: any) => Number(r.id));
  }


  async findByIdsOrdered(ids: number[]): Promise<Post[]> {
    if (!ids.length) return [];
    const posts = await this.repo.find({
      where: { id: In(ids), status: PostStatus.PUBLISHED },
      relations: ['user', 'assets', 'assets.file', 'likes', 'comments'],
    });
    const order = new Map<number, number>(ids.map((id, idx) => [id, idx]));
    return posts.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
  }

  async searchByQuery(
    query: string,
    sort: 'asc' | 'desc' = 'desc',
    take = 10,
    skip = 0,
  ): Promise<Post[]> {
    return this.repo.find({
      where: [
        { body: ILike(`%${query}%`), status: PostStatus.PUBLISHED },
      ],
      relations: ['user', 'assets', 'assets.file', 'likes', 'comments'],
      order: { createdAt: sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
      take,
      skip,
    });
  }

  async attachAsset(postId: number, fileId: number) {
    if (!postId) {
      throw new InternalError('Invalid postId for asset attachment');
    }
    if (!fileId) {
      throw new InternalError('Invalid fileId for asset attachment');
    }
    await this.repo.manager.getRepository(PostAsset).insert({
      postId,
      fileId,
    });
  }


}
