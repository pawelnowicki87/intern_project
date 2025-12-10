import { Comment } from '../../comments/entities/comment.entity';
import { File } from '../../files/entities/file.entity';
import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('comment_assets')
export class CommentAsset {
  @PrimaryColumn({ name: 'comment_id', type: 'int' })
    commentId: number;

  @PrimaryColumn({ name: 'file_id', type: 'int' })
    fileId: number;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @ManyToOne(() => Comment, (comment) => comment.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
    comment: Comment;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
    file: File;
}
