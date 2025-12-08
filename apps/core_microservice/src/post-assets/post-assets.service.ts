import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@shared/errors/domain-errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostAsset } from './entities/post-asset.entity';
import { PostAssetResponseDto } from './dto/post-asset-response.dto';

@Injectable()
export class PostAssetsService {
  constructor(
    @InjectRepository(PostAsset)
    private readonly postAssetRepo: Repository<PostAsset>,
  ) {}

  async findAll(): Promise<PostAssetResponseDto[]> {
    const assets = await this.postAssetRepo.find({
      relations: ['post', 'file'],
      order: { createdAt: 'DESC' },
    });

    return assets.map(({ postId, fileId, createdAt, post, file }) => ({
      postId,
      fileId,
      createdAt,
      postTitle: post?.title,
      fileUrl: file?.url,
    }));
  }

  async findOne(postId: number, fileId: number): Promise<PostAssetResponseDto> {
    const asset = await this.postAssetRepo.findOne({
      where: { postId, fileId },
      relations: ['post', 'file'],
    });

    if (!asset) {
      throw new NotFoundError(
        `Post asset (postId=${postId}, fileId=${fileId}) not found`,
      );
    }

    const { createdAt, post, file } = asset;
    return {
      postId,
      fileId,
      createdAt,
      postTitle: post?.title,
      fileUrl: file?.url,
    };
  }

  async create(data: Partial<PostAsset>): Promise<PostAssetResponseDto> {
    const asset = this.postAssetRepo.create(data);
    const saved = await this.postAssetRepo.save(asset);

    const reloaded = await this.postAssetRepo.findOne({
      where: { postId: saved.postId, fileId: saved.fileId },
      relations: ['post', 'file'],
    });

    if (!reloaded) {
      throw new NotFoundError(
        `Post asset (postId=${saved.postId}, fileId=${saved.fileId}) not found after creation`,
      );
    }

    const { postId, fileId, createdAt, post, file } = reloaded;
    return {
      postId,
      fileId,
      createdAt,
      postTitle: post?.title,
      fileUrl: file?.url,
    };
  }

  async remove(postId: number, fileId: number): Promise<{ message: string }> {
    const asset = await this.postAssetRepo.findOne({ where: { postId, fileId } });

    if (!asset) {
      throw new NotFoundError(
        `Post asset (postId=${postId}, fileId=${fileId}) not found`,
      );
    }

    await this.postAssetRepo.remove(asset);

    return {
      message: `Post asset (postId=${postId}, fileId=${fileId}) removed successfully`,
    };
  }
}
