import { Injectable } from '@nestjs/common';
import { IFollowsReader } from '../../posts/ports/follows-reader.port';
import { FollowsRepository } from '../follows.repository';
import { FollowStatus } from '../entities/follow.entity';

@Injectable()
export class FollowsReaderAdapter implements IFollowsReader {
  constructor(private readonly followsRepo: FollowsRepository) {}

  findFollowedIdsByUser(userId: number): Promise<number[]> {
    return this.followsRepo.findFollowedIdsByUser(userId);
  }

  async isFollowing(viewerId: number, ownerId: number): Promise<boolean> {
    const follow = await this.followsRepo.findOne(viewerId, ownerId);
    return Boolean(follow && follow.status === FollowStatus.ACCEPTED);
  }

}