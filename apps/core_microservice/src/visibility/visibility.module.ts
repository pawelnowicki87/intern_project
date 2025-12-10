import { forwardRef, Module } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { UsersModule } from 'src/users/users.module';
import { FollowsModule } from 'src/follows/follows.module';
import { VISIBILITY_READER } from 'src/users/ports/tokens';
import { VisibilityAdapter } from './adapters/visibility-profile.adapter';
import { VISIBILITY_POST_READER } from 'src/posts/ports/tokens';
import { VisibilityPostAdapter } from './adapters/Visibility-posts.adapter';
import { FollowVisibilityAdapter } from 'src/follows/adapters/follows-visibility-adapter';
import { FOLLOWS_VISIBILITY_READER } from './port/tokens';
import { PostsModule } from 'src/posts/posts.module';
import { UserVisibilityReaderAdapter } from 'src/users/adapters/user-visibility.adapter';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => FollowsModule),
    forwardRef(() => PostsModule),
  ],
  providers: [VisibilityService,
    {
      provide: VISIBILITY_READER,
      useClass: UserVisibilityReaderAdapter,
    },
    {
      provide: VISIBILITY_POST_READER,
      useClass: VisibilityPostAdapter,
    },
    {
      provide: FOLLOWS_VISIBILITY_READER,
      useClass: FollowVisibilityAdapter,
    },
  ],
  controllers: [],
  exports: [
    VISIBILITY_READER,
    VISIBILITY_POST_READER,
  ],
})

export class VisibilityModule{}