export interface IFollowsReader {
  findFollowedIdsByUser(userId: number): Promise<number[]>;
}
