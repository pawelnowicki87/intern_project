import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('likes_comments')
export class LikeComment {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @PrimaryColumn({ name: 'comment_id', type: 'int' })
  commentId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // relations

  @ManyToOne(() => User, (user) => user.likedComments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
