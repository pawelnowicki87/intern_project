export interface IVisibilityReader {
  canViewProfile(viewerId: number, ownerId: number): Promise<boolean>;
  canViewPosts(viewerId: number, ownerId: number): Promise<boolean>;
  canViewFollowers(viewerId: number, ownerId: number): Promise<boolean>;
}