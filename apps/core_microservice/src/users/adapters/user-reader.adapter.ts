import { IUsersReader } from "src/follows/ports/users-reader.port";
import { UsersRepository } from "../users.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserReaderAdapter implements IUsersReader {
constructor(private readonly usesrRepo: UsersRepository) {}

  async findById(userId: number): Promise<{ id: number; isPrivate: boolean; } | null> {
    const user = await this.usesrRepo.findById(userId);

    if(!user) return null;

    return {
      id: user.id,
      isPrivate: user.isPrivate
    }
  } 
}
  