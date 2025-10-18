import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesPostsService } from './likes-posts.service';
import { LikesPostsController } from './likes-posts.controller';
import { LikePost } from './entities/like-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LikePost])],
  controllers: [LikesPostsController],
  providers: [LikesPostsService],
})
export class LikesPostsModule {}
