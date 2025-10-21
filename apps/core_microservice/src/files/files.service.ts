import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileResponseDto } from './dto/file-response.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
  ) {}

  async findAll(): Promise<FileResponseDto[]> {
    const files = await this.fileRepo.find({
      relations: ['owner', 'comment'],
      order: { createdAt: 'DESC' },
    });

    return files.map(
      ({ id, url, fileType, ownerId, commentId, createdAt, owner, comment }) => ({
        id,
        url,
        fileType,
        ownerId,
        commentId,
        createdAt,
        owner: owner
          ? {
              firstName: owner.firstName,
              lastName: owner.lastName,
              email: owner.email,
            }
          : undefined,
        commentBody: comment?.body,
      }),
    );
  }

  async findOne(id: number): Promise<FileResponseDto> {
    const file = await this.fileRepo.findOne({
      where: { id },
      relations: ['owner', 'comment'],
    });
    if (!file) throw new NotFoundException('File not found');

    const { url, fileType, ownerId, commentId, createdAt, owner, comment } = file;
    return {
      id,
      url,
      fileType,
      ownerId,
      commentId,
      createdAt,
      owner: owner
        ? {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
          }
        : undefined,
      commentBody: comment?.body,
    };
  }

  async create(data: CreateFileDto): Promise<FileResponseDto> {
    const file = this.fileRepo.create(data);
    const saved = await this.fileRepo.save(file);

    const full = await this.fileRepo.findOne({
      where: { id: saved.id },
      relations: ['owner', 'comment'],
    });

    if (!full) throw new NotFoundException('File not found after creation');

    const { id, url, fileType, ownerId, commentId, createdAt, owner, comment } =
      full;
    return {
      id,
      url,
      fileType,
      ownerId,
      commentId,
      createdAt,
      owner: owner
        ? {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
          }
        : undefined,
      commentBody: comment?.body,
    };
  }

  async update(id: number, data: UpdateFileDto): Promise<FileResponseDto> {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    Object.assign(file, data);
    await this.fileRepo.save(file);

    const updated = await this.fileRepo.findOne({
      where: { id },
      relations: ['owner', 'comment'],
    });

    if (!updated) throw new NotFoundException('Updated file not found');

    const { url, fileType, ownerId, commentId, createdAt, owner, comment } =
      updated;
    return {
      id: updated.id,
      url,
      fileType,
      ownerId,
      commentId,
      createdAt,
      owner: owner
        ? {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
          }
        : undefined,
      commentBody: comment?.body,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    await this.fileRepo.remove(file);
    return { message: `File ${id} removed successfully.` };
  }
}
