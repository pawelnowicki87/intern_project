import { IFollowsVisibilityReader } from 'src/visibility/port/follows-visibility-reader.port';
import { FollowsRepository } from '../follows.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowStatus } from '../entities/follow.entity';

@Injectable()
export class FollowVisibilityAdapter implements IFollowsVisibilityReader {
  constructor(private readonly followsRepo: FollowsRepository) {}

  async findFollowRelation(followerId: number, ownerId: number): Promise<{ status: FollowStatus } | null> {
    const follow = await this.followsRepo.findOne(followerId, ownerId);
    return follow ? { status: follow.status } : null;
  }
}
