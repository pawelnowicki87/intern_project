import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileResponseDto } from './dto/file-response.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findAll(): Promise<FileResponseDto[]> {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<FileResponseDto> {
    return this.filesService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateFileDto): Promise<FileResponseDto> {
    return this.filesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateFileDto,
  ): Promise<FileResponseDto> {
    return this.filesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ message: string }> {
    return this.filesService.remove(id);
  }
}
