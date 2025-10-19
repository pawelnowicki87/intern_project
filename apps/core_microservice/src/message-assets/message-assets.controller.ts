import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { MessageAssetsService } from './message-assets.service';
import { CreateMessageAssetDto } from './dto/create-message-asset.dto';
import { MessageAssetResponseDto } from './dto/message-asset-response.dto';

@Controller('message-assets')
export class MessageAssetsController {
  constructor(private readonly messageAssetsService: MessageAssetsService) {}

  @Get()
  findAll(): Promise<MessageAssetResponseDto[]> {
    return this.messageAssetsService.findAll();
  }

  @Get(':messageId/:fileId')
  findOne(
    @Param('messageId') messageId: number,
    @Param('fileId') fileId: number,
  ): Promise<MessageAssetResponseDto> {
    return this.messageAssetsService.findOne(messageId, fileId);
  }

  @Post()
  create(@Body() data: CreateMessageAssetDto): Promise<MessageAssetResponseDto> {
    return this.messageAssetsService.create(data);
  }

  @Delete(':messageId/:fileId')
  remove(
    @Param('messageId') messageId: number,
    @Param('fileId') fileId: number,
  ): Promise<{ message: string }> {
    return this.messageAssetsService.remove(messageId, fileId);
  }
}
