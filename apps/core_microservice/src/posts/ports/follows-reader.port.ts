export interface IFollowsReader {
  findFollowedIdsByUser(userId: number): Promise<number[]>;
  isFollowing(viewerId: number, ownerId: number): Promise<boolean>;
}
