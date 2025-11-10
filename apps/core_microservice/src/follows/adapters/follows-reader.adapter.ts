import { Injectable } from "@nestjs/common";
import { IFollowsReader } from '../../posts/ports/follows-reader.port'
import { FollowsRepository } from "../follows.repository";

@Injectable()
export class FollowsReaderAdapter implements IFollowsReader {
  constructor(private readonly followsRepo: FollowsRepository) {}

  findFollowedIdsByUser(userId: number): Promise<number[]> {
    return this.followsRepo.findFollowedIdsByUser(userId)
  }

}