import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesCommentsService } from './likes-comments.service';
import { LikesCommentsController } from './likes-comments.controller';
import { LikeComment } from './entities/like-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LikeComment])],
  controllers: [LikesCommentsController],
  providers: [LikesCommentsService],
})
export class LikesCommentsModule {}
