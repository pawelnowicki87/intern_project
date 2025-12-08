export interface IVisibilityPostsReader {
  canViewPosts(viewerId: number, ownerId: number): Promise<boolean>;
}