import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
    username: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
    phone?: string | null;
}
