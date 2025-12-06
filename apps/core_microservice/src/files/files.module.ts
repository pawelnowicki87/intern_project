import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileRepository } from './files.repository';
import { File } from './entities/file.entity';
import { CloudinaryModule } from 'src/common/config/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([File]), CloudinaryModule],
  controllers: [FilesController],
  providers: [FilesService, FileRepository],
  exports: [FilesService],
})
export class FilesModule {}
