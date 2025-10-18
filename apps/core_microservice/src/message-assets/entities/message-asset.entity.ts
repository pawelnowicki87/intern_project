import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
import { File } from '../../files/entities/file.entity';

@Entity('message_assets')
export class MessageAsset {
  @PrimaryColumn({ name: 'message_id', type: 'int' })
  messageId: number;

  @PrimaryColumn({ name: 'file_id', type: 'int' })
  fileId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: File;
}
