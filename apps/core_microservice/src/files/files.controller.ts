import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FilesService } from './files.service';
import { JwtHttpGuard } from 'src/common/guards/jwt-http.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtHttpGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  uploadFile(@UploadedFile() file, @Req() req) {
    return this.filesService.uploadImage(file, req.user);
  }

  @Delete('delete')
  @UseGuards(JwtHttpGuard)
  deleteFile(@Body('public_id') public_id: string) {
    return this.filesService.deleteImage(public_id);
  }
}
