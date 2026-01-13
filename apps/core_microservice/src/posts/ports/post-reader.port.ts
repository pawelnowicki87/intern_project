export interface IPostReader {
  findOwnerId(postId: number): Promise<number | null>;
}

