import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationAction } from './notification-acion.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recipient_id', type: 'int', nullable: false })
  recipientId: number;

  @Column({ name: 'sender_id', type: 'int', nullable: false })
  senderId: number;

  @Column({ type: 'varchar', nullable: false })
  action: NotificationAction;

  @Column({ name: 'target_id', type: 'int', nullable: false })
  targetId: number;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // relations

  @ManyToOne(() => User, (user) => user.receivedNotifications)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
