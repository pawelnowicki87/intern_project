import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostAssetsService } from './post-assets.service';
import { PostAssetsController } from './post-assets.controller';
import { PostAsset } from './entities/post-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostAsset])],
  controllers: [PostAssetsController],
  providers: [PostAssetsService],
})
export class PostAssetsModule {}
