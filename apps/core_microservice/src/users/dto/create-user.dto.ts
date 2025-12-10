import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required.' })
  @MaxLength(50, { message: 'First name can have up to 50 characters.' })
    firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required.' })
  @MaxLength(50, { message: 'Last name can have up to 50 characters.' })
    lastName: string;

  @IsEmail({}, { message: 'Invalid email format.' })
    email: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required.' })
  @MaxLength(20, { message: 'Username can have up to 20 characters.' })
    username: string;

  @IsOptional()
  @IsString()
  @Length(0, 20, { message: 'Phone number can have up to 20 characters.' })
    phone?: string;

  isPrivate: boolean;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters.' })
    passwordHash: string;
}
