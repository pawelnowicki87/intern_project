import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavePost } from './entities/save-post.entity';
import { SavedPostsRepository } from './saved-posts.repository';
import { SavedPostsService } from './saved-posts.service';
import { SavedPostsController } from './saved-posts.controller';
import { PostsRepository } from 'src/posts/posts.repository';
import { Post } from 'src/posts/entities/posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavePost, Post])],
  providers: [SavedPostsRepository, SavedPostsService, PostsRepository],
  controllers: [SavedPostsController],
  exports: [SavedPostsService],
})
export class SavedPostsModule {}
