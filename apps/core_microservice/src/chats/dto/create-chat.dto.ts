import { IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true, message: 'Each participant ID must be an integer.' })
  participantIds?: number[];
}
