import { Injectable, Inject } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { IFollowsReader } from 'src/posts/ports/follows-reader.port';
import { FOLLOWS_READER } from 'src/posts/ports/tokens';
import { FollowStatus } from 'src/follows/entities/follow.entity';
import { VISIBILITY_FOLLOWS_READER } from '../ports/tokens';
import { IVisibilityFollowsReader } from '../ports/visibility-reader.port';

@Injectable()
export class VisibilityService {
  constructor(
    private readonly usersRepo: UsersRepository,
    @Inject(VISIBILITY_FOLLOWS_READER)
    private readonly followsReader: IVisibilityFollowsReader
  ) {}

  async isOwner(viewerId: number, ownerId: number): Promise<boolean> {
    return viewerId === ownerId;
  }

  async isPublicProfile(userId: number): Promise<boolean> {
    const user = await this.usersRepo.findById(userId);
    return user ? !user.isPrivate : false;
  }

  async isFollowAccepted(viewerId: number, ownerId: number): Promise<boolean> {
    const follow = await this.followsReader.findFollowRelation(viewerId, ownerId);
    return follow?.status === FollowStatus.ACCEPTED;
  }

  async canViewProfile(viewerId: number, ownerId: number): Promise<boolean> {
    if (await this.isOwner(viewerId, ownerId)) return true;
    if (await this.isFollowAccepted(viewerId, ownerId)) return true;
    if (await this.isPublicProfile(ownerId)) return true;

    return false;
  }

  async canViewPosts(viewerId: number, ownerId: number): Promise<boolean> {
    return this.canViewProfile(viewerId, ownerId);
  }

  async canViewFollowersList(viewerId: number, ownerId: number): Promise<boolean> {
    return this.canViewProfile(viewerId, ownerId);
  }
}
