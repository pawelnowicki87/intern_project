import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow, FollowStatus } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';

@Injectable()
export class FollowsRepository {
  private readonly logger = new Logger(FollowsRepository.name);

  constructor(
    @InjectRepository(Follow)
    private readonly repo: Repository<Follow>,
  ) {}

  findAll(): Promise<Follow[]> {
    return this.repo.find({
      relations: ['follower', 'followed'],
      order: { createdAt: 'DESC' },
    });
  }

  findOne(
    followerId: number, 
    followedId: number
  ): Promise<Follow | null> {
    return this.repo.findOne({
      where: { followerId, followedId },
      relations: ['follower', 'followed'],
    });
  }

  async create(data: CreateFollowDto): Promise<Follow | null> {
    try {
      const entity = this.repo.create(data);
      return await this.repo.save(entity);
    } catch (err) {
      this.logger.error(err.message);
      return null;
    }
  }

  async delete(
    followerId: number, 
    followedId: number
  ): Promise<boolean> {
    try {
      const result = await this.repo.delete({ followerId, followedId });
      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.logger.error(err.message);
      return false;
    }
  }

  async findFollowedIdsByUser(followerId: number): Promise<number[]> {
    const follows = await this.repo.find({
      where: { followerId },
      select: [ 'followedId' ]
    });
    return follows.map(f => f. followedId)
  }

  async updateStatus(
  followerId: number,
  followedId: number,
  status: FollowStatus,
  ): Promise<boolean> {
  try {
    const result = await this.repo.update(
      { followerId, followedId },
      { status },
    );
    return (result.affected ?? 0) > 0;
  } catch (error) {
    this.logger.error(error.message);
    return false;
  }
  }
}
