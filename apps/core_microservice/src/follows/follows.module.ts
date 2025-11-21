import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { FollowsRepository } from './follows.repository';
import { FollowsReaderAdapter } from './adapters/follows-reader.adapter';
import { FOLLOWS_READER } from 'src/posts/ports/tokens';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { FollowVisibilityAdapter } from './adapters/follows-visibility-adapter';
import { FOLLOWS_VISIBILITY_READER } from 'src/visibility/port/tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow]), 
    UsersModule,
    NotificationsModule  
  ],
  controllers: [FollowsController],
  providers: [
    FollowsService, 
    FollowsRepository, 
    FollowsReaderAdapter,
    {
      provide: FOLLOWS_READER,
      useClass: FollowsReaderAdapter
    },
    {
      provide: FOLLOWS_VISIBILITY_READER,
      useClass: FollowVisibilityAdapter
    }
  ],
  exports: [
      FOLLOWS_READER,
      FOLLOWS_VISIBILITY_READER
  ],
})
export class FollowsModule {}
