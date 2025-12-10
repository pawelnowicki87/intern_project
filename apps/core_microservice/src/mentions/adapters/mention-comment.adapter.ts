import { Injectable } from '@nestjs/common';
import { MentionsService } from '../mentions.service';
import { MentionType } from '../entity/mention.entity';
import { ICommentMentionsProcessorReader } from 'src/comments/ports/mentions-processor.port';

@Injectable()
export class MentionCommentAdapter implements ICommentMentionsProcessorReader {
  constructor(
        private readonly mentionsService: MentionsService,
  ) {}

  async processMentions(text: string, commentId: number, authorId: number): Promise<void> {
    await this.mentionsService.processMentions(text, commentId, MentionType.COMMENT, authorId);
  }

}
