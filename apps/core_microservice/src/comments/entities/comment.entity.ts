import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/posts.entity';
import { LikeComment } from '../../likes-comments/entities/like-comment.entity';
import { CommentAsset } from '../../comment-assets/entities/comment-asset.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column({ name: 'post_id', type: 'int', nullable: false })
  postId: number;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @OneToMany(() => LikeComment, (likeComment) => likeComment.comment)
  likes: LikeComment[];

  @OneToMany(() => CommentAsset, (ca) => ca.comment, { cascade: true })
  assets: CommentAsset[];

  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children?: Comment[];
}
