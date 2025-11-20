import { Inject, Injectable } from '@nestjs/common';
import { IVisibilityReader } from 'src/posts/ports/visibility-reader.port';
import { UsersRepository } from '../users.repository';
import { FollowsRepository } from 'src/follows/follows.repository';
import { FollowStatus } from 'src/follows/entities/follow.entity';
import { IFollowsReader } from 'src/posts/ports/follows-reader.port';
import { FOLLOWS_READER } from 'src/posts/ports/tokens';

@Injectable()
export class VisibilityReaderAdapter implements IVisibilityReader {
  constructor(
    private readonly usersRepo: UsersRepository,
    @Inject(FOLLOWS_READER)
    private readonly followsReader: IFollowsReader,
  ) {}

  private async isFollowing(viewerId: number, ownerId: number): Promise<boolean> {
    if (viewerId === ownerId) return true;

    return await this.followsReader.isFollowing(viewerId, ownerId);
  }

  async canViewProfile(viewerId: number, ownerId: number): Promise<boolean> {
    if (viewerId === ownerId) return true;

    const user = await this.usersRepo.findById(ownerId);
    if (!user) return false;

    if (!user.isPrivate) return true;

    return this.isFollowing(viewerId, ownerId);
  }

  async canViewPosts(viewerId: number, ownerId: number): Promise<boolean> {
    return this.canViewProfile(viewerId, ownerId);
  }

  async canViewFollowers(viewerId: number, ownerId: number): Promise<boolean> {
    return this.canViewProfile(viewerId, ownerId);
  }
}
