import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { PostAssetsService } from './post-assets.service';
import { CreatePostAssetDto } from './dto/create-post-asset.dto';
import { PostAssetResponseDto } from './dto/post-asset-response.dto';

@Controller('post-assets')
export class PostAssetsController {
  constructor(private readonly postAssetsService: PostAssetsService) {}

  @Get()
  findAll(): Promise<PostAssetResponseDto[]> {
    return this.postAssetsService.findAll();
  }

  @Get(':postId/:fileId')
  findOne(
    @Param('postId') postId: number,
    @Param('fileId') fileId: number,
  ): Promise<PostAssetResponseDto> {
    return this.postAssetsService.findOne(postId, fileId);
  }

  @Post()
  create(@Body() data: CreatePostAssetDto): Promise<PostAssetResponseDto> {
    return this.postAssetsService.create(data);
  }

  @Delete(':postId/:fileId')
  remove(
    @Param('postId') postId: number,
    @Param('fileId') fileId: number,
  ): Promise<{ message: string }> {
    return this.postAssetsService.remove(postId, fileId);
  }
}
