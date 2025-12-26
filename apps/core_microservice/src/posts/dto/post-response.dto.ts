import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PostStatus } from '../entities/post-status.enum';

export class PostResponseDto {
  id: number;
  title: string;
  body: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  user: UserResponseDto | null;
}