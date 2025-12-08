export class FollowResponseDto {
  followerId: number;
  followedId: number;
  createdAt: Date;

  followerFirstName: string;
  followerLastName: string;
  followedFirstName: string;
  followedLastName: string;
}
