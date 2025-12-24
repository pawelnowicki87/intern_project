import { Injectable } from '@nestjs/common';
import { InternalError, NotFoundError } from '@shared/errors/domain-errors';
import { CloudinaryConfig } from 'src/common/config/cloudinary.config';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { FileRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly cloudinaryConfig: CloudinaryConfig,
    private readonly fileRepository: FileRepository,
  ) {}

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new InternalError('No file provided');
    }

    const cloudinary = this.cloudinaryConfig.getClient();

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'innogram_uploads',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    await this.fileRepository.createFile({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType: uploadResult.resource_type,
    });

    return uploadResult;
  }

  async deleteImage(publicId: string): Promise<{ deleted: boolean}> {
    const file = await this.fileRepository.findByPublicId(publicId);
    if (!file) throw new NotFoundError('File not found');

    const cloudinary = this.cloudinaryConfig.getClient();
    await cloudinary.uploader.destroy(publicId);
    await this.fileRepository.deleteByPublicId(publicId);

    return { deleted: true };
  }
}
