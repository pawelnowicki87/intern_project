import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentAsset } from './entities/comment-asset.entity';
import { CommentAssetsRepository } from './comment-assets.repository';
import { CommentAssetsService } from './comment-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentAsset])],
  providers: [CommentAssetsService, CommentAssetsRepository],
  exports: [CommentAssetsService, CommentAssetsRepository],
})
export class CommentAssetsModule {}
