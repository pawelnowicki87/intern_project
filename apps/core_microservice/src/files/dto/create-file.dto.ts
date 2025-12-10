import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class CreateFileDto {
  @IsUrl({}, { message: 'Invalid file URL.' })
  @IsNotEmpty({ message: 'File URL is required.' })
    url: string;

  @IsInt()
  @IsNotEmpty({ message: 'Owner ID is required.' })
    publicId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'File type can have up to 50 characters.' })
    fileType?: string;
}
