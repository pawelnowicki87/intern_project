import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/posts.entity';

@Entity('likes_posts')
export class LikePost {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

  @PrimaryColumn({ name: 'post_id', type: 'int' })
    postId: number;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.likedPosts)
  @JoinColumn({ name: 'user_id' })
    user: User;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'post_id' })
    post: Post;
}
