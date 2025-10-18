import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/posts.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { LikePost } from '../../likes-posts/entities/like-post.entity';
import { LikeComment } from '../../likes-comments/entities/like-comment.entity';
import { Follow } from '../../follows/entities/follow.entity';
import { Message } from '../../messages/entities/message.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { File } from '../../files/entities/file.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'varchar', nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: false })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // relations

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => LikePost, (likePost) => likePost.user)
  likedPosts: LikePost[];

  @OneToMany(() => LikeComment, (likeComment) => likeComment.user)
  likedComments: LikeComment[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.followed)
  followers: Follow[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  receivedNotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.sender)
  sentNotifications: Notification[];

  @OneToMany(() => File, (file) => file.owner)
  files: File[];
}
