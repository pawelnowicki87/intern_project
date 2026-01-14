import { FollowStatus } from '../entities/follow.entity';

export class FollowResponseDto {
  followerId: number;
  followedId: number;
  createdAt: Date;
  status: FollowStatus;

  followerFirstName: string;
  followerLastName: string;
  followedFirstName: string;
  followedLastName: string;
}
