export class UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
