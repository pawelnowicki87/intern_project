import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryConfig } from 'src/common/config/cloudinary.config';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Controller('files')
export class FilesController {
  constructor(private readonly cloudinaryConfig: CloudinaryConfig) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('FILE DATA:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });

    if (!file) {
      throw new InternalServerErrorException('No file provided');
    }

    const cloudinary = this.cloudinaryConfig.getClient();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'innogram_uploads',
          resource_type: 'auto',
        },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(new InternalServerErrorException(error.message));
          }

          if (!result) {
            return reject(
              new InternalServerErrorException('No result from Cloudinary'),
            );
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
