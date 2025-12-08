export interface IPostMentionsProcessorReader {
  processMentions(
    text: string,
    postId: number,
    authorId: number,
  ): Promise<void>;
}
