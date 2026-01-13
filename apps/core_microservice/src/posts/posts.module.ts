import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { FollowsModule } from 'src/follows/follows.module';
import { VisibilityModule } from 'src/visibility/visibility.module';
import { MentionsModule } from 'src/mentions/mentions.module';
import { SAVED_POSTS_POST_READER } from 'src/saved-posts/ports/tokens';
import { SavedPostsPostReaderAdapter } from './adapters/saved-posts-post-reader.adapter';
 
@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => FollowsModule),
    forwardRef(() => VisibilityModule),
    forwardRef(() => MentionsModule),
  ],
  providers: [
    PostsService,
    PostsRepository,
    { provide: SAVED_POSTS_POST_READER, useClass: SavedPostsPostReaderAdapter },
  ],
  controllers: [PostsController],
  exports: [PostsService, PostsRepository, SAVED_POSTS_POST_READER],
})
export class PostsModule {}
