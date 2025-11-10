import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryConfig } from 'src/common/config/cloudinary.config';
import { FileRepository } from './files.repository';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FilesController],
  providers: [FilesService, CloudinaryConfig, FileRepository],
  exports: [FilesService],
})
export class FilesModule {}
