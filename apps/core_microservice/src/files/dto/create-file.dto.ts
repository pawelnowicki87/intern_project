import { IsOptional, IsString, IsUrl } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateFileDto {
  @IsUrl()
    url: string;

  @IsString()
    publicId: string;

  @IsOptional()
  @IsString()
    fileType?: string;

  owner: User;
}
