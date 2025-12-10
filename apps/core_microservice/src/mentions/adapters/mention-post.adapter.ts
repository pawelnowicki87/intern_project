import { Injectable } from '@nestjs/common';
import { MentionsService } from '../mentions.service';
import { MentionType } from '../entity/mention.entity';
import { IPostMentionsProcessorReader } from 'src/posts/ports/mentions-processor.port';

@Injectable()
export class MentionPostAdapter implements IPostMentionsProcessorReader {
  constructor(private readonly mentionsService: MentionsService) {}

  async processMentions(text: string, postId: number, authorId: number): Promise<void> {
    await this.mentionsService.processMentions(text, postId, MentionType.POST, authorId);
  }
}
