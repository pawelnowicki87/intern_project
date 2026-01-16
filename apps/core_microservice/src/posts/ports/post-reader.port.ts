export interface IPostReader {
  findOwnerId(postId: number): Promise<number | null>;
  countPublishedByUserId(userId: number): Promise<number>;
}
