import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOAuthUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
    firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
    lastName: string;

  @IsEmail()
    email: string;
}
