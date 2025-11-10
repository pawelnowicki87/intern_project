import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeComment } from './entities/like-comment.entity';
import { LikesCommentsService } from './likes-comments.service';
import { LikesCommentsController } from './likes-comments.controller';
import { LikesCommentsRepository } from './likes-comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LikeComment])],
  controllers: [LikesCommentsController],
  providers: [LikesCommentsService, LikesCommentsRepository],
  exports: [LikesCommentsService, LikesCommentsRepository],
})
export class LikesCommentsModule {}
