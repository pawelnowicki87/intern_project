export interface ICommentMentionsProcessorReader {
  processMentions(
    text: string,
    commentId: number,
    authorId: number,
  ): Promise<void>;
}

