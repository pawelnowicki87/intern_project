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
import { PostAsset } from '../../post-assets/entities/post-asset.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  // FK
  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  status?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => LikePost, (likePost) => likePost.post)
  likes: LikePost[];

  @OneToMany(() => PostAsset, (pa) => pa.post)
  assets: PostAsset[];
}
