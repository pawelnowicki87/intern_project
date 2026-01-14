import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
  async findOne(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const follow = await this.followsService.findOne(followerId, followedId);
      res.status(200).json(follow);
    } catch {
      res.status(404).send();
    }
  }

  @Post()
  create(@Body() data: CreateFollowDto): Promise<FollowResponseDto> {
    return this.followsService.create(data);
  }

  @Delete(':followerId/:followedId')
  remove(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<{ deleted: boolean }> {
    return this.followsService.remove(followerId, followedId);
  }

  @Patch(':followerId/:followedId/accept')
  async acceptFollow(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<{ accepted: boolean }> {
    return this.followsService.acceptFollow(followerId, followedId);
  }

  @Patch(':followerId/:followedId/reject')
  async rejectFollow(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<{ accepted: boolean }> {
    return this.followsService.rejectFollow(followerId, followedId);
  }

  @Get(':userId/followers')
  getFollowers(
    @Param('userId') userId: number,
    @Query('viewerId') viewerId?: number,
  ): Promise<FollowResponseDto[]> {
    return this.followsService.getFollowers(
      Number(userId),
      viewerId ? Number(viewerId) : 0,
    );
  }

  @Get(':userId/following')
  getFollowing(
    @Param('userId') userId: number,
    @Query('viewerId') viewerId?: number,
  ): Promise<FollowResponseDto[]> {
    return this.followsService.getFollowing(
      Number(userId),
      viewerId ? Number(viewerId) : 0,
    );
  }

  @Delete(':followerId/:followedId/cancel')
  cancelFollowRequest(
    @Param('followerId') followerId: number,
    @Param('followedId') followedId: number,
  ): Promise<{ cancelled: boolean }> {
    return this.followsService.cancelFollowRequest(followerId, followedId);
  }
}
