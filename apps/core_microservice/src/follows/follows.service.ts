import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
  ) {}

  async findAll(): Promise<FollowResponseDto[]> {
    const follows = await this.followRepo.find({
      relations: ['follower', 'followed'],
      order: { createdAt: 'DESC' },
    });

    return follows.map(({ followerId, followedId, createdAt, follower, followed }) => ({
      followerId,
      followedId,
      createdAt,
      followerFirstName: follower?.firstName,
      followerLastName: follower?.lastName,
      followedFirstName: followed?.firstName,
      followedLastName: followed?.lastName,
    }));
  }

  async findOne(followerId: number, followedId: number): Promise<FollowResponseDto> {
    const follow = await this.followRepo.findOne({
      where: { followerId, followedId },
      relations: ['follower', 'followed'],
    });

    if (!follow) throw new NotFoundException('Follow relation not found');

    const { createdAt, follower, followed } = follow;
    return {
      followerId,
      followedId,
      createdAt,
      followerFirstName: follower?.firstName,
      followerLastName: follower?.lastName,
      followedFirstName: followed?.firstName,
      followedLastName: followed?.lastName,
    };
  }

  async create(data: CreateFollowDto): Promise<FollowResponseDto> {
    const follow = this.followRepo.create(data);
    const saved = await this.followRepo.save(follow);

    const full = await this.followRepo.findOne({
      where: { followerId: saved.followerId, followedId: saved.followedId },
      relations: ['follower', 'followed'],
    });

    if (!full)
      throw new NotFoundException(
        `Follow relation (followerId=${saved.followerId}, followedId=${saved.followedId}) not found after creation.`,
      );

    const { followerId, followedId, createdAt, follower, followed } = full;
    return {
      followerId,
      followedId,
      createdAt,
      followerFirstName: follower?.firstName,
      followerLastName: follower?.lastName,
      followedFirstName: followed?.firstName,
      followedLastName: followed?.lastName,
    };
  }

  async remove(followerId: number, followedId: number): Promise<{ message: string }> {
    const follow = await this.followRepo.findOne({ where: { followerId, followedId } });
    if (!follow) throw new NotFoundException('Follow relation not found');

    await this.followRepo.remove(follow);
    return {
      message: `Follow relation (followerId=${followerId}, followedId=${followedId}) removed successfully.`,
    };
  }
}
