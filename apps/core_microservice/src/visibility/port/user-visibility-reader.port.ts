import { ResponseUserVisibilityDto } from '../dto/responseUserVisibility.dto';

export interface IUserVisibilityReader {
  findUserById(userId: number): Promise<ResponseUserVisibilityDto | null>
}