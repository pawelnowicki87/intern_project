import { IUserMentionReader } from 'src/mentions/ports/user-mention.reader';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMentionAdapter implements IUserMentionReader {
  constructor(
        private readonly userService: UsersService,
  ) {}

  findUserByUserName(userName: string): Promise<User | null> {
    return this.userService.findByUserName(userName);
  }
}