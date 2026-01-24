export interface IFollowsReader {
  findFollowedIdsByUser(userId: number): Promise<number[]>;
  isFollowing(viewerId: number, ownerId: number): Promise<boolean>;
  countFollowersByUserId(userId: number): Promise<number>;
  countFollowingByUserId(userId: number): Promise<number>;
}
