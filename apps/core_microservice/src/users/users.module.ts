import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserCredentials } from './entities/user-credencials.entity';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersCredentialRepository } from './users-credencial.repository';

import { USERS_READER } from 'src/follows/ports/tokens';
import { UserReaderAdapter } from './adapters/user-reader.adapter';

import { FollowsModule } from 'src/follows/follows.module';
import { USER_VISIBILITY_READER } from 'src/visibility/port/tokens';
import { UserVisibilityReaderAdapter } from './adapters/user-visibility.adapter';
import { VisibilityModule } from 'src/visibility/visibility.module';
import { USER_MENTION_READER } from 'src/mentions/ports/user-mention.reader';
import { UserMentionAdapter } from './adapters/user-mention.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserCredentials]),
    forwardRef(() => FollowsModule),
    forwardRef(() => VisibilityModule),
    VisibilityModule,
  ],
  providers: [
    UsersService,
    UsersRepository,
    UsersCredentialRepository,
    {
      provide: USERS_READER,
      useClass: UserReaderAdapter,
    },
    {
      provide: USER_VISIBILITY_READER,
      useClass: UserVisibilityReaderAdapter,
    },
    {
      provide: USER_MENTION_READER,
      useClass: UserMentionAdapter,
    },
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    UsersRepository,
    UsersCredentialRepository,
    USERS_READER,
    USER_VISIBILITY_READER,
    TypeOrmModule,
    USER_MENTION_READER,
  ],
})
export class UsersModule {}
