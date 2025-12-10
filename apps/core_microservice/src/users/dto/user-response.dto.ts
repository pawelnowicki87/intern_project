export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  isPrivate: boolean;
}
