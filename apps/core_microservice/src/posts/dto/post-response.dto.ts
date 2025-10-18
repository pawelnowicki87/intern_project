import { UserResponseDto } from '../../users/dto/user-response.dto';

export class PostResponseDto {
  id: number;
  title?: string;
  body?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserResponseDto | null;
}
