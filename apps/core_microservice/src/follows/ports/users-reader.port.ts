export interface IUsersReader {
  findById(userId: number): Promise<{ id: number, isPrivate: boolean} | null>;
}