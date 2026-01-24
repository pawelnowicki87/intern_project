import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
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

  @Post()
  create(@Body() data: CreateFollowDto): Promise<FollowResponseDto> {
    return this.followsService.create(data);
  }

  @Delete(':followerId/:followedId')
  remove(
    @Param('followerId') followerId: string,
    @Param('followedId') followedId: string,
  ): Promise<{ deleted: boolean }> {
    const fId = Number.parseInt(followerId, 10);
    const tId = Number.parseInt(followedId, 10);
    return this.followsService.remove(Number.isFinite(fId) ? fId : 0, Number.isFinite(tId) ? tId : 0);
  }

  @Patch(':followerId/:followedId/accept')
  async acceptFollow(
    @Param('followerId') followerId: string,
    @Param('followedId') followedId: string,
  ): Promise<{ accepted: boolean }> {
    const fId = Number.parseInt(followerId, 10);
    const tId = Number.parseInt(followedId, 10);
    return this.followsService.acceptFollow(Number.isFinite(fId) ? fId : 0, Number.isFinite(tId) ? tId : 0);
  }

  @Patch(':followerId/:followedId/reject')
  async rejectFollow(
    @Param('followerId') followerId: string,
    @Param('followedId') followedId: string,
  ): Promise<{ accepted: boolean }> {
    const fId = Number.parseInt(followerId, 10);
    const tId = Number.parseInt(followedId, 10);
    return this.followsService.rejectFollow(Number.isFinite(fId) ? fId : 0, Number.isFinite(tId) ? tId : 0);
  }

  @Get(':userId/followers')
  getFollowers(
    @Param('userId') userId: string,
    @Query('viewerId') viewerId?: string,
  ): Promise<FollowResponseDto[]> {
    const ownerId = Number.parseInt(userId, 10);
    const viewer = viewerId !== undefined ? Number.parseInt(viewerId, 10) : 0;
    return this.followsService.getFollowers(Number.isFinite(ownerId) ? ownerId : 0, Number.isFinite(viewer) ? viewer : 0);
  }

  @Get(':userId/following')
  getFollowing(
    @Param('userId') userId: string,
    @Query('viewerId') viewerId?: string,
  ): Promise<FollowResponseDto[]> {
    const ownerId = Number.parseInt(userId, 10);
    const viewer = viewerId !== undefined ? Number.parseInt(viewerId, 10) : 0;
    return this.followsService.getFollowing(Number.isFinite(ownerId) ? ownerId : 0, Number.isFinite(viewer) ? viewer : 0);
  }

  @Delete(':followerId/:followedId/cancel')
  cancelFollowRequest(
    @Param('followerId') followerId: string,
    @Param('followedId') followedId: string,
  ): Promise<{ cancelled: boolean }> {
    const fId = Number.parseInt(followerId, 10);
    const tId = Number.parseInt(followedId, 10);
    return this.followsService.cancelFollowRequest(Number.isFinite(fId) ? fId : 0, Number.isFinite(tId) ? tId : 0);
  }

  @Get(':followerId/:followedId')
  findOne(
    @Param('followerId') followerId: string,
    @Param('followedId') followedId: string,
  ): Promise<FollowResponseDto> {
    const fId = Number.parseInt(followerId, 10);
    const tId = Number.parseInt(followedId, 10);
    return this.followsService.findOne(Number.isFinite(fId) ? fId : 0, Number.isFinite(tId) ? tId : 0);
  }
}
