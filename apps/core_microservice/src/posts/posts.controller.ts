import {
  Controller,
  Get,
  Post as HttpPost,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PostResponseDto[]> {
    return this.postsService.findAll(sort, page, limit);
  }

  @Get('search')
  search(@Query('query') query: string): Promise<PostResponseDto[]> {
    return this.postsService.searchPosts(query);
  }

  @Get('archive')
  findArchived(): Promise<PostResponseDto[]> {
    return this.postsService.findArchived();
  }

  @Get('feed/:userId')
  findFeed(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PostResponseDto[]> {
    return this.postsService.findFeedForUser(
      Number(userId),
      sort,
      Number(page),
      Number(limit),
    );
  }

  @Get('feed/:userId/most-liked')
  findMostLikedFeed(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PostResponseDto[]> {
    return this.postsService.findFeedMostLikedForUser(
      Number(userId),
      Number(page),
      Number(limit),
    );
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('viewerId') viewerId?: number,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PostResponseDto[]> {
    return this.postsService.findByUserVisible(
      Number(userId),
      viewerId ? Number(viewerId) : 0,
      sort,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('viewerId') viewerId?: number,
  ): Promise<PostResponseDto> {
    return this.postsService.findOne(id, viewerId ? Number(viewerId) : 0);
  }

  @HttpPost()
  create(@Body() data: CreatePostDto): Promise<PostResponseDto> {
    return this.postsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseIntPipe) id: number): Promise<PostResponseDto> {
    return this.postsService.archive(id);
  }

  @Patch(':id/unarchive')
  unArchive(@Param('id', ParseIntPipe) id: number): Promise<PostResponseDto> {
    return this.postsService.unArchive(id);
  }
}
