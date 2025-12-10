import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateFollowDto {
  @IsInt()
  @IsNotEmpty({ message: 'Follower ID is required.' })
    followerId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Followed ID is required.' })
    followedId: number;
}
