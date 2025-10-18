import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Post } from '../../posts/entities/posts.entity';
import { File } from '../../files/entities/file.entity';

@Entity('post_assets')
export class PostAsset {
  @PrimaryColumn({ name: 'post_id', type: 'int' })
  postId: number;

  @PrimaryColumn({ name: 'file_id', type: 'int' })
  fileId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: File;
}
