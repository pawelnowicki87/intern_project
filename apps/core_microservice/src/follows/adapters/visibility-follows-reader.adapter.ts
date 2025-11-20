import { Injectable } from '@nestjs/common';
import { IVisibilityFollowsReader } from 'src/users/ports/visibility-reader.port';
import { FollowsRepository } from '../follows.repository';
import { FollowStatus } from '../entities/follow.entity';

@Injectable()
export class VisibilityFollowsReaderAdapter implements IVisibilityFollowsReader {
  constructor(private readonly followsRepo: FollowsRepository) {}

  async findFollowRelation(
    viewerId: number,
    ownerId: number,
  ): Promise<{ status: FollowStatus } | null> {
    const follow = await this.followsRepo.findOne(viewerId, ownerId);

    if (!follow) return null;

    return { status: follow.status };
  }
}
