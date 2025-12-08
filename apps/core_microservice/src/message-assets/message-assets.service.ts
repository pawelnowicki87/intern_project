import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@shared/errors/domain-errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageAsset } from './entities/message-asset.entity';
import { CreateMessageAssetDto } from './dto/create-message-asset.dto';
import { MessageAssetResponseDto } from './dto/message-asset-response.dto';

@Injectable()
export class MessageAssetsService {
  constructor(
    @InjectRepository(MessageAsset)
    private readonly msgAssetRepo: Repository<MessageAsset>,
  ) {}

  async findAll(): Promise<MessageAssetResponseDto[]> {
    const assets = await this.msgAssetRepo.find({
      relations: ['message', 'file'],
      order: { createdAt: 'DESC' },
    });

    return assets.map(({ messageId, fileId, createdAt, message, file }) => ({
      messageId,
      fileId,
      createdAt,
      fileUrl: file?.url,
    }));
  }

  async findOne(messageId: number, fileId: number): Promise<MessageAssetResponseDto> {
    const asset = await this.msgAssetRepo.findOne({
      where: { messageId, fileId },
      relations: ['message', 'file'],
    });

    if (!asset) throw new NotFoundError('Message asset not found');

    const { createdAt, message, file } = asset;
    return {
      messageId,
      fileId,
      createdAt,
      fileUrl: file?.url,
    };
  }

  async create(data: CreateMessageAssetDto): Promise<MessageAssetResponseDto> {
    const asset = this.msgAssetRepo.create(data);
    const saved = await this.msgAssetRepo.save(asset);

    const reloaded = await this.msgAssetRepo.findOne({
      where: { messageId: saved.messageId, fileId: saved.fileId },
      relations: ['message', 'file'],
    });

    if (!reloaded)
      throw new NotFoundError(
        `Message asset (messageId=${saved.messageId}, fileId=${saved.fileId}) not found after creation`,
      );

    const { messageId, fileId, createdAt, message, file } = reloaded;
    return {
      messageId,
      fileId,
      createdAt,
      fileUrl: file?.url,
    };
  }

  async remove(messageId: number, fileId: number): Promise<{ message: string }> {
    const asset = await this.msgAssetRepo.findOne({ where: { messageId, fileId } });
    if (!asset) throw new NotFoundError('Message asset not found');

    await this.msgAssetRepo.remove(asset);
    return { message: `Message asset (messageId=${messageId}, fileId=${fileId}) removed successfully` };
  }
}
