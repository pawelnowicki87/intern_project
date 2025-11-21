import { Module } from '@nestjs/common';
import { VisibilityService } from "./visibility.service";
import { UsersModule } from 'src/users/users.module';
import { FollowsModule } from 'src/follows/follows.module';
import { VISIBILITY_READER } from 'src/users/ports/tokens';
import { VisibilityAdapter } from './adapters/visibility-profile.adapter';
import { VISIBILITY_POST_READER } from 'src/posts/ports/tokens';
import { VisibilityPostAdapter } from './adapters/Visibility-posts.adapter';

@Module({
  imports: [UsersModule, FollowsModule],
  providers: [VisibilityService,
    {
      provide: VISIBILITY_READER,
      useClass: VisibilityAdapter
    },
    {
      provide: VISIBILITY_POST_READER,
      useClass: VisibilityPostAdapter
    }
  ],
  controllers: [],
  exports: [
    VISIBILITY_READER,
    VISIBILITY_POST_READER
  ]
})

export class VisibilityModule{}