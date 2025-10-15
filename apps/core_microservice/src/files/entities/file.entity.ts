import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/posts.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ name: 'type', type: 'varchar', nullable: true })
  fileType?: string;

  @Column({ name: 'owner_id', type: 'int', nullable: false })
  ownerId: number;

  @Column({ name: 'post_id', type: 'int', nullable: true })
  postId?: number;

  @Column({ name: 'comment_id', type: 'int', nullable: true })
  commentId?: number;

  @Column({ name: 'message_id', type: 'int', nullable: true })
  messageId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // relations

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Post, (post) => post.files)
  @JoinColumn({ name: 'post_id' })
  post?: Post;

  @ManyToOne(() => Comment, (comment) => comment.files)
  @JoinColumn({ name: 'comment_id' })
  comment?: Comment;

  @ManyToOne(() => Message, (message) => message.files)
  @JoinColumn({ name: 'message_id' })
  message?: Message;
}
