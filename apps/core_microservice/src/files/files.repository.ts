import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File)
    private readonly repo: Repository<File>,
  ) {}

  async createFile(data: CreateFileDto) {
    const file = await this.repo.create(data);
    return this.repo.save(file);
  }

  async findByPublicId(publicId: string) {
    return this.repo.findOne({ where: { publicId } });
  }

  async deleteByPublicId(publicId: string) {
    return this.repo.delete({ publicId });
  }
}
