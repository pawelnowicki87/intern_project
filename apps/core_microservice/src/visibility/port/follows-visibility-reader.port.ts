import { FollowStatus } from "src/follows/entities/follow.entity";

export interface IFollowsVisibilityReader {
  findFollowRelation(followerId, ownerId): Promise<{ status: FollowStatus } | null>;
}