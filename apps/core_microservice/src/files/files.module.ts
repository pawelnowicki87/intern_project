import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileRepository } from './files.repository';
import { File } from './entities/file.entity';
import { CloudinaryModule } from 'src/common/config/cloudinary.module';
import { UsersModule } from 'src/users/users.module';
import { JwtHttpGuard } from 'src/common/guards/jwt-http.guard';

@Module({
  imports: [TypeOrmModule.forFeature([File]), CloudinaryModule, UsersModule],
  controllers: [FilesController],
  providers: [FilesService, FileRepository, JwtHttpGuard],
  exports: [FilesService],
})
export class FilesModule {}
