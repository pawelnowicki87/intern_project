import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/file.entity';
import { CloudinaryConfig } from 'src/common/config/cloudinary.config';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FilesController],
  providers: [FilesService, CloudinaryConfig],
})
export class FilesModule {}
