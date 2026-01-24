import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeComment } from './entities/like-comment.entity';
import { LikesCommentsService } from './likes-comments.service';
import { LikesCommentsController } from './likes-comments.controller';
import { LikesCommentsRepository } from './likes-comments.repository';
import { NotificationsProducerModule } from 'src/notifications-producer/notifications-producer.module';

@Module({
  imports: [TypeOrmModule.forFeature([LikeComment]), NotificationsProducerModule],
  controllers: [LikesCommentsController],
  providers: [LikesCommentsService, LikesCommentsRepository],
  exports: [LikesCommentsService, LikesCommentsRepository],
})
export class LikesCommentsModule {}
