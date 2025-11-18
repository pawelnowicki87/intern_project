import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get()
  findAll(): Promise<FollowResponseDto[]> {
    return this.followsService.findAll();
  }

  @Get(':followerId/:followedId')
  findOne(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<FollowResponseDto> {
    return this.followsService.findOne(followerId, followedId);
  }

  @Post()
  create(@Body() data: CreateFollowDto): Promise<FollowResponseDto> {
    return this.followsService.create(data);
  }

  @Delete(':followerId/:followedId')
  remove(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<{ deleted: boolean}> {
    return this.followsService.remove(followerId, followedId);
  }

  @Patch(':followerId/:followedId/accept')
  async acceptFollow(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number
  ): Promise<{ accepted: boolean}> {
    const result = await this.followsService.acceptFollow(followerId, followedId);

    return result;
  }

  @Patch(':followerId/:followedId/reject')
  async rejectFollow(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number
  ): Promise<{ accepted: boolean}> {
    const result = await this.followsService.rejectFollow(followerId, followedId);

    return result;
  }

  @Get(':userId/followers')
  getFollowers(@Param('userId') userId: number): Promise<FollowResponseDto[]> {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId') userId: number): Promise<FollowResponseDto[]> {
    return this.followsService.getFollowing(userId);
  }

  @Delete(':followerId/:followedId/cancel')
  cancelFollowRequest(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<{ cancelled: boolean }> {
    return this.followsService.cancelFollowRequest(followerId, followedId)
  }
}
