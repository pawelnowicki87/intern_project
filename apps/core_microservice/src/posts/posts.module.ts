import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { FollowsModule } from 'src/follows/follows.module';
import { VisibilityModule } from 'src/visibility/visibility.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => FollowsModule),
    forwardRef(() => VisibilityModule),
  ],
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
  exports: [PostsService, PostsRepository],
})
export class PostsModule {}
