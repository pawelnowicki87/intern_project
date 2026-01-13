import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavePost } from './entities/save-post.entity';
import { CreateSavePostDto } from './dto/create-save-post.dto';

@Injectable()
export class SavedPostsRepository {
  private readonly logger = new Logger(SavedPostsRepository.name);

  constructor(
    @InjectRepository(SavePost)
    private readonly repo: Repository<SavePost>,
  ) {}

  findAll(): Promise<SavePost[]> {
    return this.repo.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(userId: number, postId: number): Promise<SavePost | null> {
    return this.repo.findOne({
      where: { userId, postId },
      relations: ['user', 'post'],
    });
  }

  async create(data: CreateSavePostDto): Promise<SavePost | null> {
    try {
      const save = this.repo.create(data);
      return await this.repo.save(save);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(userId: number, postId: number): Promise<boolean> {
    try {
      const result = await this.repo.delete({ userId, postId });
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }

  async findByUserId(userId: number): Promise<SavePost[] | null> {
    return this.repo.find({
      where: { userId },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }
}
