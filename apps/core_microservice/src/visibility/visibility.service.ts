import { Injectable, Inject } from '@nestjs/common';
import { FollowStatus } from 'src/follows/entities/follow.entity';
import { IUserVisibilityReader } from './port/user-visibility-reader.port';
import { IFollowsVisibilityReader } from './port/follows-visibility-reader.port';
import { VISIBILITY_READER } from 'src/users/ports/tokens';
import { FOLLOWS_VISIBILITY_READER } from './port/tokens';

@Injectable()
export class VisibilityService {
  constructor(
    @Inject(VISIBILITY_READER)
    private readonly userVisibilityReader: IUserVisibilityReader,

    @Inject(FOLLOWS_VISIBILITY_READER)
    private readonly followVisibilityReader: IFollowsVisibilityReader,
  ) {}

  async isOwner(viewerId: number, ownerId: number): Promise<boolean> {
    return viewerId === ownerId;
  }

  async isPublicProfile(userId: number): Promise<boolean> {
    const user = await this.userVisibilityReader.findUserById(userId);
    return user ? !user.isPrivate : false;
  }

  async isFollowAccepted(viewerId: number, ownerId: number): Promise<boolean> {
    const follow = await this.followVisibilityReader.findFollowRelation(viewerId, ownerId);
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
