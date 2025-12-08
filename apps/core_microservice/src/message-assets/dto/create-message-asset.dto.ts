import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateMessageAssetDto {
  @IsInt()
  @IsNotEmpty({ message: 'Message ID is required.' })
  messageId: number;

  @IsInt()
  @IsNotEmpty({ message: 'File ID is required.' })
  fileId: number;
}
