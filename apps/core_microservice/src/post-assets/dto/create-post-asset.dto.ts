import { IsInt, IsNotEmpty } from 'class-validator';

export class CreatePostAssetDto {
  @IsInt()
  @IsNotEmpty()
    postId: number;

  @IsInt()
  @IsNotEmpty()
    fileId: number;
}
