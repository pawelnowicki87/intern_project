import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

import { USERS_READER } from 'src/follows/ports/tokens';
import { UserReaderAdapter } from './adapters/user-reader.adapter';

import { VisibilityService } from './visibility/visibility.service';
import { FollowsModule } from 'src/follows/follows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FollowsModule,
  ],
  providers: [
    UsersService,
    UsersRepository,
    VisibilityService,
    {
      provide: USERS_READER,
      useClass: UserReaderAdapter,
    },
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    TypeOrmModule,
    UsersRepository,
    VisibilityService,
    {
      provide: USERS_READER,
      useClass: UserReaderAdapter,
    },
  ],
})
export class UsersModule {}
