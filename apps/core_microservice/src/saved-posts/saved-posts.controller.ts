import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { CreateSavePostDto } from './dto/create-save-post.dto';
import { SavePostResponseDto } from './dto/save-post-response.dto';

@Controller('saved-posts')
export class SavedPostsController {
  constructor(private readonly service: SavedPostsService) {}

  @Get()
  findAll(): Promise<SavePostResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':userId')
  findByUserId(@Param('userId') userId: number): Promise<SavePostResponseDto[]> {
    return this.service.findByUserId(Number(userId));
  }

  @Post()
  create(@Body() data: CreateSavePostDto): Promise<SavePostResponseDto> {
    return this.service.create(data);
  }

  @Delete(':userId/:postId')
  remove(
    @Param('userId') userId: number,
    @Param('postId') postId: number,
  ): Promise<{ deleted: boolean }> {
    return this.service.remove(Number(userId), Number(postId));
  }

  @Post('toggle')
  toggleSave(@Body() data: CreateSavePostDto): Promise<{ saved: boolean }> {
    return this.service.toggleSave(data.userId, data.postId);
  }
}
