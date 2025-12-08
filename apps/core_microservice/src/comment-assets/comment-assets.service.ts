import { Injectable } from '@nestjs/common';
import { CommentAssetsRepository } from './comment-assets.repository';

@Injectable()
export class CommentAssetsService {
  constructor(
    private readonly commentAssetsRepository: CommentAssetsRepository,
  ) {}

  async linkFileToComment(commentId: number, fileId: number) {
    return this.commentAssetsRepository.createLink(commentId, fileId);
  }

  async removeAssetsByComment(commentId: number) {
    return this.commentAssetsRepository.deleteByComment(commentId);
  }
}
