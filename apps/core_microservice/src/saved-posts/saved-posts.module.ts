import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavePost } from './entities/save-post.entity';
import { SavedPostsRepository } from './saved-posts.repository';
import { SavedPostsService } from './saved-posts.service';
import { SavedPostsController } from './saved-posts.controller';
import { PostsModule } from 'src/posts/posts.module';
import { SAVED_POSTS_POST_READER } from './ports/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([SavePost]), PostsModule],
  providers: [
    SavedPostsRepository,
    SavedPostsService,
  ],
  controllers: [SavedPostsController],
  exports: [SavedPostsService],
})
export class SavedPostsModule {}
