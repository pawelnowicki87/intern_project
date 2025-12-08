import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentAsset } from './entities/comment-asset.entity';

@Injectable()
export class CommentAssetsRepository {
  constructor(
    @InjectRepository(CommentAsset)
    private readonly repo: Repository<CommentAsset>,
  ) {}

  async createLink(commentId: number, fileId: number) {
    const link = this.repo.create({ commentId, fileId });
    return this.repo.save(link);
  }

  async deleteByComment(commentId: number) {
    return this.repo.delete({ commentId });
  }
}
