import { IsInt, IsOptional, IsArray, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsInt()
  creatorId: number;

  @IsArray()
  @IsInt({ each: true, message: 'Each participant ID must be an integer.' })
  participantIds: number[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
