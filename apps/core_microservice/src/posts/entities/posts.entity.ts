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
import { Comment } from '../../comments/entities/comment.entity';
import { LikePost } from '../../likes-posts/entities/like-post.entity';
import { SavePost } from '../../saved-posts/entities/save-post.entity';
import { PostAsset } from '../../post-assets/entities/post-asset.entity';
import { PostStatus } from './post-status.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ type: 'text', nullable: true })
    body: string;

  @Column({ name: 'user_id', type: 'int', nullable: false })
    userId: number; // FK

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.PUBLISHED })
    status: PostStatus;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
    comments: Comment[];

  @OneToMany(() => LikePost, (likePost) => likePost.post, { cascade: true })
    likes: LikePost[];

  @OneToMany(() => SavePost, (savePost) => savePost.post, { cascade: true })
    saves: SavePost[];

  @OneToMany(() => PostAsset, (pa) => pa.post, { cascade: true })
    assets: PostAsset[];
}
