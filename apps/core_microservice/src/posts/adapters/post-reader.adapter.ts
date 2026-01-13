import { Injectable } from '@nestjs/common';
import type { IPostReader } from '../ports/post-reader.port';
import { PostsRepository } from '../posts.repository';

@Injectable()
export class PostReaderAdapter implements IPostReader {
  constructor(private readonly postsRepo: PostsRepository) {}

  async findOwnerId(postId: number): Promise<number | null> {
    const post = await this.postsRepo.findById(postId);
    return post?.userId ?? null;
  }
}

