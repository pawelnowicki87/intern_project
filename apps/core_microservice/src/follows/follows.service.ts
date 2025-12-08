import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { FollowsRepository } from './follows.repository';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { Follow, FollowStatus } from './entities/follow.entity';
import { USERS_READER } from './ports/tokens';
import { NOTIFICATIONS_SENDER } from 'src/notifications-producer/ports/tokens';
import type { INotificationSender } from 'src/notifications-producer/ports/notification-sender.port';
import { NotificationAction } from '@shared/notifications/notification-action';
import type { IUsersReader } from './ports/users-reader.port';

@Injectable()
export class FollowsService {
  constructor(
    private readonly followsRepo: FollowsRepository,
    @Inject(NOTIFICATIONS_SENDER)
    private readonly notificationSender: INotificationSender,
    @Inject(USERS_READER)
    private readonly userReader: IUsersReader,
  ) {}

  private toResponseDto(f: Follow): FollowResponseDto {
    return {
      followerId: f.followerId,
      followedId: f.followedId,
      createdAt: f.createdAt,
      followerFirstName: f.follower.firstName,
      followerLastName: f.follower.lastName,
      followedFirstName: f.followed.firstName,
      followedLastName: f.followed.lastName,
    };
  }

  private async canViewFollowersList(
    viewerId: number,
    ownerId: number,
  ): Promise<boolean> {
    if (viewerId === ownerId) return true;

    const user = await this.userReader.findById(ownerId);
    if (!user) return false;

    if (!user.isPrivate) return true;

    const follow = await this.followsRepo.findOne(viewerId, ownerId);
    if (!follow) return false;

    return follow.status === FollowStatus.ACCEPTED;
  }

  async findAll(): Promise<FollowResponseDto[]> {
    const follows = await this.followsRepo.findAll();
    return follows.map((f) => this.toResponseDto(f));
  }

  async findOne(followerId: number, followedId: number): Promise<FollowResponseDto> {
    const follow = await this.followsRepo.findOne(followerId, followedId);
    if (!follow) throw new NotFoundException('Follow relation not found');
    return this.toResponseDto(follow);
  }

  async create(data: CreateFollowDto): Promise<FollowResponseDto> {
    const created = await this.followsRepo.create(data);

    if (!created) {
      throw new InternalServerErrorException('Failed to create follow relation');
    }

    const user = await this.userReader.findById(created.followedId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPrivate) {
      created.status = FollowStatus.PENDING;

      await this.notificationSender.sendNotification(
        created.followedId,
        created.followerId,
        NotificationAction.FOLLOW_REQUEST,
        created.followerId,
      );
    } else {
      created.status = FollowStatus.ACCEPTED;

      await this.notificationSender.sendNotification(
        created.followerId,
        created.followedId,
        NotificationAction.FOLLOW_ACCEPTED,
        created.followedId,
      );
    }

    await this.followsRepo.updateStatus(
      created.followerId,
      created.followedId,
      created.status,
    );

    const follow = await this.followsRepo.findOne(
      created.followerId,
      created.followedId,
    );
    if (!follow) {
      throw new NotFoundException('Follow relation not found after creation');
    }

    return this.toResponseDto(follow);
  }

  async remove(
    followerId: number,
    followedId: number,
  ): Promise<{ deleted: boolean }> {
    const success = await this.followsRepo.delete(followerId, followedId);
    if (!success) throw new NotFoundException('Follow relation not found');
    return { deleted: true };
  }

  async acceptFollow(
    followerId: number,
    followedId: number,
  ): Promise<{ accepted: boolean }> {
    const follow = await this.followsRepo.findOne(followerId, followedId);

    if (!follow) throw new NotFoundException('Follow not found');

    follow.status = FollowStatus.ACCEPTED;

    await this.notificationSender.sendNotification(
      follow.followerId,
      follow.followedId,
      NotificationAction.FOLLOW_ACCEPTED,
      follow.followedId,
    );

    await this.followsRepo.updateStatus(followerId, followedId, follow.status);

    return { accepted: true };
  }

  async rejectFollow(
    followerId: number,
    followedId: number,
  ): Promise<{ accepted: boolean }> {
    const follow = await this.followsRepo.findOne(followerId, followedId);

    if (!follow) throw new NotFoundException('Follow not found');

    follow.status = FollowStatus.REJECTED;

    await this.notificationSender.sendNotification(
      follow.followerId,
      follow.followedId,
      NotificationAction.FOLLOW_REJECTED,
      follow.followedId,
    );

    await this.followsRepo.updateStatus(followerId, followedId, follow.status);

    return { accepted: true };
  }

  async getFollowers(
    userId: number,
    viewerId: number,
  ): Promise<FollowResponseDto[]> {
    const canView = await this.canViewFollowersList(viewerId, userId);
    if (!canView) {
      throw new ForbiddenException('Followers list is private');
    }

    const followersList = await this.followsRepo.findFollowersByUserId(userId);
    return followersList.map((f) => this.toResponseDto(f));
  }

  async getFollowing(
    userId: number,
    viewerId: number,
  ): Promise<FollowResponseDto[]> {
    const canView = await this.canViewFollowersList(viewerId, userId);
    if (!canView) {
      throw new ForbiddenException('Following list is private');
    }

    const followingList = await this.followsRepo.findFollowingByUserId(userId);
    return followingList.map((f) => this.toResponseDto(f));
  }

  async cancelFollowRequest(
    followerId: number,
    followedId: number,
  ): Promise<{ cancelled: boolean }> {
    const follow = await this.followsRepo.findOne(followerId, followedId);

    if (!follow) throw new NotFoundException('Follow request not found');

    if (follow.status !== FollowStatus.PENDING) {
      throw new NotFoundException('Cannot cancel non pending follow request');
    }

    const success = await this.followsRepo.delete(followerId, followedId);

    if (!success) {
      throw new InternalServerErrorException('Fail to cancel follow request');
    }

    return { cancelled: true };
  }
}
