import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

import { USERS_READER } from 'src/follows/ports/tokens';
import { UserReaderAdapter } from './adapters/user-reader.adapter';

import { FollowsModule } from 'src/follows/follows.module';
import { USER_VISIBILITY_READER } from 'src/visibility/port/tokens';
import { UserVisibilityReaderAdapter } from './adapters/user-visibility.adapter';
import { VisibilityModule } from 'src/visibility/visibility.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FollowsModule],
  providers: [
    UsersService,
    UsersRepository,
    VisibilityModule,
    {
      provide: USERS_READER,
      useClass: UserReaderAdapter,
    },
    {
      provide: USER_VISIBILITY_READER,
      useClass: UserVisibilityReaderAdapter
    }
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    TypeOrmModule,
    UsersRepository,
    USERS_READER,
    USER_VISIBILITY_READER
    
  ],
})
export class UsersModule {}
