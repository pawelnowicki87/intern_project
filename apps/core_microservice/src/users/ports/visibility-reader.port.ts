import { FollowStatus } from 'src/follows/entities/follow.entity';

export interface IVisibilityFollowsReader {
  findFollowRelation(
    viewerId: number,
    ownerId: number
  ): Promise<{ status: FollowStatus } | null>;
}
