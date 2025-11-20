import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentMention } from './entities/comment-mention.entity';
import { CommentMentionsRepository } from './comment-mentions.repository';
import { CommentMentionsService } from './comment-mentions.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommentMention]), UsersModule],
  providers: [CommentMentionsRepository, CommentMentionsService],
  exports: [CommentMentionsService],
})
export class CommentMentionsModule {}
