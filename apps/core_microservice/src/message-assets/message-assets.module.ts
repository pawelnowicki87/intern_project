import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageAssetsService } from './message-assets.service';
import { MessageAssetsController } from './message-assets.controller';
import { MessageAsset } from './entities/message-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAsset])],
  controllers: [MessageAssetsController],
  providers: [MessageAssetsService],
})
export class MessageAssetsModule {}
