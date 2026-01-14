import { Injectable } from '@nestjs/common';
import { IUserVisibilityReader } from 'src/visibility/port/user-visibility-reader.port';
import { UsersRepository } from '../users.repository';
import { ResponseUserVisibilityDto } from 'src/visibility/dto/responseUserVisibility.dto';

@Injectable()
export class UserVisibilityReaderAdapter implements IUserVisibilityReader {
  constructor(private readonly userRepo: UsersRepository) {}
  async findUserById(userId: number): Promise<ResponseUserVisibilityDto | null> {
    const user = await this.userRepo.findById(userId);
    
    if (!user) return null;

    return { isPrivate: user.isPrivate };
  }

}
