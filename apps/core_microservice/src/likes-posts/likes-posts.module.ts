import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikePost } from './entities/like-post.entity';
import { LikesPostsService } from './likes-posts.service';
import { LikesPostsController } from './likes-posts.controller';
import { LikesPostsRepository } from './likes-posts.repository';
import { NotificationsProducerModule } from 'src/notifications-producer/notifications-producer.module';

@Module({
  imports: [TypeOrmModule.forFeature([LikePost]), NotificationsProducerModule],
    controllers: [LikesPostsController],
  providers: [LikesPostsService, LikesPostsRepository],
  exports: [LikesPostsService, LikesPostsRepository],
})
export class LikesPostsModule {}
