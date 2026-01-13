import { Post } from './entities/posts.entity';
import { PostResponseDto } from './dto/post-response.dto';

export class PostMapper {
  static toResponseDto(post: Post): PostResponseDto {
    const assetTypes = (post.assets ?? [])
      .map((a) => a.file?.fileType)
      .filter((t): t is string => !!t);
    let contentType: 'IMAGE' | 'CAROUSEL' | 'REEL' = 'IMAGE';
    if (assetTypes.includes('video')) {
      contentType = 'REEL';
    } else if ((post.assets?.length ?? 0) > 1) {
      contentType = 'CAROUSEL';
    } else {
      contentType = 'IMAGE';
    }
    return {
      id: post.id,
      body: post.body,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      contentType,

      user: post.user
        ? {
          id: post.user.id,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
          username: post.user.username,
          email: post.user.email,
          phone: post.user.phone,
          isPrivate: post.user.isPrivate,
          avatarUrl: post.user.avatarUrl ?? null,
        }
        : null,

      assets: post.assets
        ? post.assets.map((a) => ({
          id: a.file?.id,
          url: a.file?.url,
          type: a.file?.fileType,
        }))
        : [],
      likes: post.likes?.length ?? 0,
      comments: post.comments?.length ?? 0,
      timeAgo: post.createdAt,
    };
  }

  static toResponseList(posts: Post[]): PostResponseDto[] {
    return posts.map((post) => this.toResponseDto(post));
  }
}
