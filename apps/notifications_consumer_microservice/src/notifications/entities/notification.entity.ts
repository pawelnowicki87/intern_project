import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { NotificationAction } from '@shared/notifications/notification-action';

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
}
