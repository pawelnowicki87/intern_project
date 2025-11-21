export interface IVisibilityReader {
  canViewProfile(viewerId: number, ownerId: number): Promise<boolean>;
}