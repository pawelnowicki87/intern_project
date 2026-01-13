import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Post } from '../../posts/entities/posts.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { LikePost } from '../../likes-posts/entities/like-post.entity';
import { LikeComment } from '../../likes-comments/entities/like-comment.entity';
import { SavePost } from '../../saved-posts/entities/save-post.entity';
import { Follow } from '../../follows/entities/follow.entity';
import { Message } from '../../messages/entities/message.entity';
import { File } from '../../files/entities/file.entity';
import { UserCredentials } from './user-credencials.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'first_name', type: 'varchar', nullable: false })
    firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: false })
    lastName: string;

  @Column({ name: 'user_name', type: 'varchar', unique: true })
    username: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
    email: string;

  @Column({ name: 'is_private', type: 'boolean', default: false })
    isPrivate: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

  @Column({ type: 'text', nullable: true })
    bio?: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
    avatarUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

  // relations

  @OneToOne(() => UserCredentials, (credentials) => credentials.user, { cascade: true })
    credentials: UserCredentials;

  @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];

  @OneToMany(() => LikePost, (likePost) => likePost.user)
    likedPosts: LikePost[];
  
  @OneToMany(() => SavePost, (savePost) => savePost.user)
    savedPosts: SavePost[];

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


  @OneToMany(() => File, (file) => file.owner)
    files: File[];
}
