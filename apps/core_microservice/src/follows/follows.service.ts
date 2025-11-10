import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { FollowsRepository } from './follows.repository';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { Follow, FollowStatus } from './entities/follow.entity';
import { NOTIFICATIONS_SENDER, USERS_READER } from './ports/tokens';
import { INotificationSender } from './ports/notification-sender.port';
import { NotificationAction } from 'src/notifications/entities/notification-acion.enum';
import { IUsersReader } from './ports/users-reader.port';

@Injectable()
export class FollowsService {
  constructor(
    private readonly followsRepo: FollowsRepository,
    @Inject(NOTIFICATIONS_SENDER)
    private readonly notificationSender: INotificationSender,
    @Inject(USERS_READER)
    private readonly userReader: IUsersReader
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

    if(!user) {
      throw new NotFoundException('User not found')
    }

    if (user.isPrivate) {
      created.status = FollowStatus.PENDING;

      await this.notificationSender.sendNotification(
        created.followedId, 
        created.followerId, 
        NotificationAction.FOLLOW_REQUEST, 
        created.followerId
      )
    } else {
      created.status = FollowStatus.ACCEPTED;

      await this.notificationSender.sendNotification(
        created.followerId,
        created.followedId,
        NotificationAction.FOLLOW_ACCEPTED, 
        created.followedId
      );
    }

    await this.followsRepo.updateStatus(
      created.followerId,
      created.followedId,
      created.status,
    );

    const follow = await this.followsRepo.findOne(
      created.followerId, 
      created.followedId);
    if (!follow) {
      throw new NotFoundException('Follow relation not found after creation');
    }

    return this.toResponseDto(follow);
  }

  async remove(followerId: number, followedId: number): Promise<{ deleted: boolean }> {
    const success = await this.followsRepo.delete(followerId, followedId);
    if (!success) throw new NotFoundException('Follow relation not found');
    return { deleted: true };
  }

}
