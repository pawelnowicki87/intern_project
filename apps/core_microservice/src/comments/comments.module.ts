import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { MentionsModule } from 'src/mentions/mentions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => MentionsModule),
  ],
  providers: [CommentsService, CommentsRepository],
  controllers: [CommentsController],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
