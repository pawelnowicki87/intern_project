import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

export enum MentionType {
  COMMENT = 'COMMENT',
  POST = 'POST'
}

@Entity('mentions')
export class Mention {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    id: number;

  @Column({ name: 'source_id', type: 'int' })
    sourceId: number;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: MentionType,
  })
    sourceType: MentionType;

  @Column({ name: 'mentioned_user_id', type: 'int' })
    mentionedUserId: number;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @Column({ name: 'created_by_user_id', type: 'int' })
    createdByUserId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'mentioned_user_id' })
    mentionedUser: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' })
    createdByUser: User;
}
