import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
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
  ): Promise<{ message: string }> {
    return this.followsService.remove(followerId, followedId);
  }
}
