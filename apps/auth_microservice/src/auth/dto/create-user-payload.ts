export class CreateUserDto {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
}
