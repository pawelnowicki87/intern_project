import { Comment } from "src/comments/entities/comment.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('comment_mentions')
export class CommentMention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'comment_id', type: 'int' })
  commentId: number;

  @Column({ name: 'mentioned_user_id', type: 'int' })
  mentionedUserId: number;

  @Column({ name: 'author_id', type: 'int' })
  authorId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Comment, (comment) => comment.mentions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
