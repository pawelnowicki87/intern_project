import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PostStatus } from '../entities/post-status.enum';

export class PostResponseDto {
  id: number;
  body: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  user: UserResponseDto | null;

  assets: {
    id: number;
    url: string;
    type?: string;
  }[];

  likes: number;
  comments: number;
  timeAgo: Date;;
}